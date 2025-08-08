import express from "express";
import cors from "cors";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import fs from "fs";
import os from "os";
import { exec } from "child_process";
import natural from "natural";
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import fsPromises from 'fs/promises';
import crypto from 'crypto';
import path from 'path';
import fetch from 'node-fetch';
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const damerauPkg = require("talisman/metrics/damerau-levenshtein.js");
const damerauLevenshtein = damerauPkg.default || damerauPkg;
const IMAGE_DIFF_DIR = path.join(path.resolve(), 'public/markdown-images');


import markdownRenderRouter from './markdownRenderServer.js';
import { runPipeline, parseRules } from '../pipeline-runner/index.js';

import { pipeline } from "@xenova/transformers";
import { checkCrossPlatformDifferenceBackend } from './crossPlatformLintBackend.js'

dotenv.config();

const app = express();
const allowedOrigins = [
  'http://localhost:5173',           // local dev
  'https://lintme.netlify.app',       // Netlify live site
  'https://lintme-backend.onrender.com' 
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  }
}));

app.use(express.json());

const __dirname = path.resolve();
app.use('/markdown-images', express.static(path.join(__dirname, 'public/markdown-images')));
app.use(markdownRenderRouter);

const shell = os.platform() === "win32" ? "cmd.exe" : "/bin/sh";
await fsPromises.mkdir(IMAGE_DIFF_DIR, { recursive: true });

let embedder;                          // lazy‑loaded
const readmeCache = new Map();         // url → { ts, text }
const CACHE_TTL = 1000 * 60 * 30;    // 30 minutes
/*──────────────────────  Embedding helper  ───────────────────*/
async function getEmbedding(text) {
  if (!embedder) {
    embedder = await pipeline("feature-extraction", "Xenova/e5-small-v2"); // fast model
  }
  const result = await embedder(text, { pooling: "mean", normalize: true });
  return result.data;                      // Float32Array
}


/*──────────────────────  Caching helper  ─────────────────────*/
async function getReadmeCached(url) {
  const cached = readmeCache.get(url);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.text;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Fetch failed: ${r.status}`);
  const text = await r.text();
  readmeCache.set(url, { ts: Date.now(), text });
  return text;
}


app.get("/", (req, res) => {
  res.send("LintMe backend is running!");
});


// API to execute commands
app.post("/api/validate-commands", (req, res) => {
  const { commands, timeout = 5000 } = req.body;
  const results = [];

  let completed = 0;
  console.log(`Checking commands`);
  commands.forEach(({ command, position }) => {
    const result = {
      command,
      line: position ?? "Unknown",
      success: false,
      message: "",
    };

    exec(command, { timeout, shell }, (error, stdout, stderr) => {
      if (error) {
        result.message = error.message.trim();
      } else if (stderr) {
        result.message = stderr.trim();
      } else {
        result.success = true;
        result.message = stdout.trim();
      }

      results.push(result);
      completed++;

      if (completed === commands.length) {
        console.log("Executed Commands:", results);
        res.json(results);
      }
    });
  });
});

// API to check links
app.post("/api/check-link", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    console.warn("Received request with missing URL.");
    return res.status(400).json({ error: "Missing URL." });
  }

  console.log(`Checking link: ${url}`);

  try {
    const start = Date.now();
    const response = await fetch(url, { redirect: "follow" });
    const duration = Date.now() - start;

    console.log(`Link check successful: ${url} (Status: ${response.status}, Time: ${duration}ms)`);

    return res.json({ status: response.status });
  } catch (error) {
    console.error(`Link check failed: ${url}`);
    console.error(`  Error: ${error.message}`);
    return res.status(500).json({ error: "Request failed or timed out." });
  }
});


// --- Add this route below others (before app.listen) ---
app.post('/api/image-diff', async (req, res) => {
  try {
    const { imageA, imageB, threshold = 0.10 } = req.body;
    if (!imageA || !imageB) {
      return res.status(400).json({ error: "imageA and imageB are required." });
    }

    const [bufA, bufB] = await Promise.all([
      fetchBuffer(imageA),
      fetchBuffer(imageB)
    ]);

    const pngA = PNG.sync.read(bufA);
    const pngB = PNG.sync.read(bufB);

    if (pngA.width !== pngB.width || pngA.height !== pngB.height) {
      return res.status(400).json({
        error: `Dimension mismatch: ${pngA.width}x${pngA.height} vs ${pngB.width}x${pngB.height}`
      });
    }

    const diffPNG = new PNG({ width: pngA.width, height: pngA.height });
    const changedPixels = pixelmatch(
      pngA.data, pngB.data, diffPNG.data,
      pngA.width, pngA.height,
      { threshold }
    );

    const id = crypto.randomUUID().slice(0, 8);
    const fileA = path.join(IMAGE_DIFF_DIR, `cmp_base_${id}.png`);
    const fileB = path.join(IMAGE_DIFF_DIR, `cmp_against_${id}.png`);
    const fileD = path.join(IMAGE_DIFF_DIR, `cmp_diff_${id}.png`);

    await Promise.all([
      fsPromises.writeFile(fileA, bufA),
      fsPromises.writeFile(fileB, bufB),
      fsPromises.writeFile(fileD, PNG.sync.write(diffPNG))
    ]);

    const host = `${req.protocol}://${req.get('host')}`;
    res.json({
      changedPixels,
      pngA: `${host}/markdown-images/${path.basename(fileA)}`,
      pngB: `${host}/markdown-images/${path.basename(fileB)}`,
      diff: `${host}/markdown-images/${path.basename(fileD)}`
    });
  } catch (err) {
    console.error('image-diff error:', err);
    res.status(500).json({ error: err.message });
  }
});

async function fetchBuffer(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Fetch failed (${r.status}) for ${url}`);
  return Buffer.from(await r.arrayBuffer());
}

app.post('/api/run-pipeline', async (req, res) => {
  try {
    const { yamlText = '', markdown = '' } = req.body || {};

    if (!yamlText.trim() || !markdown.trim()) {
      return res.status(400).json({ error: 'yamlText and markdown are required.' });
    }

    const ctx  = await runPipeline(yamlText, markdown);
    const { pipeline = [] } = parseRules(yamlText);
    const lastOperator = pipeline.at(-1)?.operator ?? null;

    res.json({ ...ctx, lastOperator });
  } catch (err) {
    console.error('run-pipeline error:', err);
    res.status(500).json({ error: err.message });
  }
});

// API to interact with Groq
app.post("/api/groq-chat", async (req, res) => {
  const { model, prompt } = req.body;

  if (!model || !prompt) {
    return res.status(400).json({ error: "Missing model or prompt." });
  }

  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  try {
    const response = await groq.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
    });

    const result = response.choices[0]?.message?.content.trim() || "";
    res.json({ result });
  } catch (error) {
    console.error("Groq API error:", error);
    res.status(500).json({ error: "LLM generation failed." });
  }
});

app.post("/api/github-file", async (req, res) => {
  const {
    repo,
    branch = "main",
    fileName = "README.md",
    fetchType = "content",
    metaPath = ""
  } = req.body;

  if (!repo) {
    return res.status(400).json({ error: "repo is required." });
  }

  const [owner, repoName] = repo.split("/");

  const headers = {
    "User-Agent": "lintme-backend",
    Authorization: `Bearer ${process.env.GITHUB_TOKEN || ""}`
  };

  if (fetchType === "metadata") {
    let url = `https://api.github.com/repos/${owner}/${repoName}`;
    if (metaPath && metaPath.trim()) {
      url += `/${metaPath.trim().replace(/^\/+/, "")}`;
    }

    try {
      const metaResp = await fetch(url, { headers });
      if (!metaResp.ok) {
        return res.status(metaResp.status).json({
          error: `GitHub metadata fetch failed (${metaResp.status}): ${url}`
        });
      }

      const metadata = await metaResp.json();
      return res.json({ repo, branch, metaPath, metadata });
    } catch (err) {
      return res.status(500).json({ error: `Metadata fetch error: ${err.message}` });
    }
  }

  let commitSha;

  let refResp = await fetch(
    `https://api.github.com/repos/${owner}/${repoName}/branches/${encodeURIComponent(branch)}`,
    { headers }
  );

  if (refResp.ok) {
    const refJson = await refResp.json();
    commitSha = refJson?.commit?.commit?.tree?.sha;
  } else {
    const tagsResp = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/tags?per_page=100`,
      { headers }
    );

    if (!tagsResp.ok) {
      return res.status(tagsResp.status).json({
        error: `Failed to fetch tags (${tagsResp.status})`
      });
    }

    const tags = await tagsResp.json();
    const matchedTag = tags.find(t => t.name === branch);

    if (!matchedTag) {
      return res.status(404).json({
        error: `Branch or tag '${branch}' not found.`
      });
    }

    commitSha = matchedTag.commit.sha;
  }

  if (!commitSha) {
    return res.status(500).json({ error: "Could not resolve commit SHA from branch/tag." });
  }

  const treeURL = `https://api.github.com/repos/${owner}/${repoName}/git/trees/${commitSha}?recursive=1`;
  const treeResp = await fetch(treeURL, { headers });

  if (!treeResp.ok) {
    return res.status(treeResp.status).json({
      error: `GitHub returned ${treeResp.status} for git/trees`
    });
  }

  const tree = await treeResp.json();

  const matches = tree.tree.filter(n =>
    n.type === "blob" && /^readme\.md$/i.test(n.path.split("/").pop())
  );

  if (!matches.length) {
    return res.json({ repo, branch, fileName, readmes: [] });
  }

  const rootReadme = matches.find(m => !m.path.includes("/"));
  const finalMatches = rootReadme ? [rootReadme] : matches;

  const urls = finalMatches.map(m => ({
    path: m.path,
    url: `https://raw.githubusercontent.com/${repo}/${branch}/${m.path}`
  }));

  if (fetchType === "path") {
    return res.json({ repo, branch, fileName, readmes: urls });
  }

  if (fetchType === "content") {
    const contents = await Promise.all(
      urls.map(async ({ path, url }) => {
        try {
          const r = await fetch(url);
          const text = await r.text();
          return { path, url, content: text };
        } catch (e) {
          return { path, url, error: e.message };
        }
      })
    );

    return res.json({ repo, branch, fileName, readmes: contents });
  }

  return res.status(400).json({ error: "Invalid fetchType" });
});



app.get("/api/wordlist", (req, res) => {
  const absolutePath = req.query.path;

  if (!absolutePath) {
    return res.status(400).json({ error: "Missing path query parameter." });
  }

  if (!fs.existsSync(absolutePath)) {
    return res.status(404).json({ error: `File not found: ${absolutePath}` });
  }

  try {
    const content = fs.readFileSync(absolutePath, "utf-8");
    const words = content.split(/\r?\n/).map(w => w.trim()).filter(Boolean);
    res.json({ words });
  } catch (error) {
    console.error("Error reading file:", error);
    res.status(500).json({ error: "Could not read word list." });
  }
});

app.post("/api/compare-readmes", async (req, res) => {
  try {
    let { current, historical, method = "embedding_cosine" } = req.body || {};

    if (typeof current !== "string") {
      return res.status(400).json({ error: "current must be a string" });
    }

    if (typeof historical === "string") historical = [historical];
    if (!Array.isArray(historical) || historical.length === 0) {
      return res.status(400).json({ error: "historical must be a non-empty array of strings or a string" });
    }
    if (!historical.every(h => typeof h === "string")) {
      return res.status(400).json({ error: "historical items must all be strings" });
    }

    const normalize = (s) => (s || "").replace(/\s+/g, " ").trim();
    const cur = normalize(current);

    const comparison = await Promise.all(
      historical.map(async (hist) => {
        const h = normalize(hist);
        if (!h) return { similarity: 0, sectionSimilarity: [], error: "empty historical string" };

        let simDoc = cur === h ? 1 : 0;

        if (simDoc !== 1) {
          switch (method) {
            case "cosine":
              simDoc = cosineSimilarityTFIDF(cur, h);
              break;
            case "embedding_cosine": {
              const [curEmb, histEmb] = await Promise.all([getEmbedding(cur), getEmbedding(h)]);
              simDoc = cosineSimilarity(curEmb, histEmb);
              break;
            }
            case "euclidean": {
              const [curEmb, histEmb] = await Promise.all([getEmbedding(cur), getEmbedding(h)]);
              simDoc = euclideanSimilarity(curEmb, histEmb);
              break;
            }
            case "damerau_levenshtein":
              simDoc = damerauSimilarity(cur, h);
              break;
            case "sectional_embedding": {
              const curSecs  = Object.values(extractSections(cur));
              const histSecs = Object.values(extractSections(h));
              if (curSecs.length && histSecs.length) {
                const [curEmbeds, histEmbeds] = await Promise.all([
                  Promise.all(curSecs.map(getEmbedding)),
                  Promise.all(histSecs.map(getEmbedding)),
                ]);
                const N = Math.min(curEmbeds.length, histEmbeds.length);
                const sims = Array.from({ length: N }, (_, i) => cosineSimilarity(curEmbeds[i], histEmbeds[i]));
                simDoc = sims.length ? sims.reduce((s, v) => s + v, 0) / sims.length : 0;
              } else {
                const [curEmb, histEmb] = await Promise.all([getEmbedding(cur), getEmbedding(h)]);
                simDoc = cosineSimilarity(curEmb, histEmb);
              }
              break;
            }
            default:
              simDoc = cosineSimilarityTFIDF(cur, h);
          }
        }

        const sectionSimilarity = await compareSectionSimilarities(cur, h, method);
        return {
          similarity: Math.round(simDoc * 100),
          sectionSimilarity
        };
      })
    );

    res.json({ comparison });
  } catch (err) {
    console.error("compare-readmes error:", err);
    res.status(500).json({ error: err.message });
  }
});




function cosineSimilarity(v1, v2) {
  let dot = 0, n1 = 0, n2 = 0;
  for (let i = 0; i < v1.length; i++) {
    dot += v1[i] * v2[i];
    n1 += v1[i] * v1[i];
    n2 += v2[i] * v2[i];
  }
  return dot / (Math.sqrt(n1) * Math.sqrt(n2));
}

/* TF‑IDF cosine (unchanged from previous code) */
function cosineSimilarityTFIDF(a, b) {
  const tfidf = new natural.TfIdf();
  tfidf.addDocument(a); tfidf.addDocument(b);
  const vec = (i) => tfidf.listTerms(i).reduce((m, t) => (m[t.term] = t.tfidf, m), {});
  const vA = vec(0), vB = vec(1), terms = new Set([...Object.keys(vA), ...Object.keys(vB)]);
  let dot = 0, n1 = 0, n2 = 0;
  terms.forEach(t => { const x = vA[t] || 0, y = vB[t] || 0; dot += x * y; n1 += x * x; n2 += y * y; });
  return n1 && n2 ? dot / Math.sqrt(n1 * n2) : 0;
}

function damerauSimilarity(a, b) {
  const dist = damerauLevenshtein(a, b);
  const max = Math.max(a.length, b.length) || 1;
  return 1 - dist / max;
}



/* Euclidean similarity (turned into 0‑1 scale) */
function euclideanSimilarity(v1, v2) {
  let sum = 0;
  for (let i = 0; i < v1.length; i++) {
    const d = v1[i] - v2[i];
    sum += d * d;
  }
  const dist = Math.sqrt(sum);
  return 1 / (1 + dist); // maps [0,∞) → (0,1]
}

/*──────────────── Section helpers ────────────────*/
function extractSections(md) {
  const sections = {}, lines = md.split("\n"); let cur = null;
  for (const line of lines) {
    if (/^#{1,6} /.test(line)) { cur = line.trim(); sections[cur] = ""; }
    else if (cur) { sections[cur] += line + "\n"; }
  }
  return sections;
}

async function fetchReadmeVersions(ownerRepo, count) {
  const [owner, repo] = ownerRepo.split("/");
  const apiURL = `https://api.github.com/repos/${owner}/${repo}/commits?path=README.md&per_page=${count}`;

  const resp = await fetch(apiURL, {
    headers: {
      "User-Agent": "readme-linter",
      Authorization: `Bearer ${process.env.GITHUB_TOKEN || ""}`
    }
  });
  if (!resp.ok) throw new Error(`GitHub API request failed: ${resp.status}`);

  const commits = await resp.json();
  if (!Array.isArray(commits)) throw new Error("GitHub API did not return a commit list");

  return commits.map(c =>
    `https://raw.githubusercontent.com/${owner}/${repo}/${c.sha}/README.md`
  );
}


/*──────────────── Main similarity switch ─────────*/
async function similarityWhole(a, b, method) {
  switch (method) {
    case "cosine":
      return cosineSimilarityTFIDF(a, b);

    case "embedding_cosine": {
      const [e1, e2] = await Promise.all([getEmbedding(a), getEmbedding(b)]);
      return cosineSimilarity(e1, e2);
    }

    case "euclidean": {
      const [e1, e2] = await Promise.all([getEmbedding(a), getEmbedding(b)]);
      return euclideanSimilarity(e1, e2);
    }

    case "damerau_levenshtein":
      return damerauSimilarity(a, b);

    case "sectional_embedding": {
      const secsA = Object.values(extractSections(a));
      const secsB = Object.values(extractSections(b));
      if (secsA.length === 0 || secsB.length === 0) return 0;

      /* compare each section in A to same‑index in B (fallback to empty) */
      const sims = await Promise.all(
        secsA.map(async (text, i) => {
          const other = secsB[i] || "";
          const [e1, e2] = await Promise.all([getEmbedding(text), getEmbedding(other)]);
          return cosineSimilarity(e1, e2);
        })
      );
      return sims.reduce((s, v) => s + v, 0) / sims.length;
    }

    default:                         // fallback
      return cosineSimilarityTFIDF(a, b);
  }
}


/* per‑section similarity (uses same switch) */
async function compareSectionSimilarities(cur, hist, method) {
  const curSecs = extractSections(cur);
  const histSecs = extractSections(hist);
  const out = [];

  for (const [header, curTxt] of Object.entries(curSecs)) {
    const histTxt = histSecs[header];
    if (!histTxt) {
      out.push({ header, similarity: 0, note: "Missing in historical" });
      continue;
    }

    let sim = 0;
    switch (method) {
      case "cosine":
        sim = cosineSimilarityTFIDF(curTxt, histTxt);
        break;
      case "embedding_cosine":
      case "euclidean":
      case "sectional_embedding": {
        const [e1, e2] = await Promise.all([getEmbedding(curTxt), getEmbedding(histTxt)]);
        sim = method === "euclidean" ? euclideanSimilarity(e1, e2) : cosineSimilarity(e1, e2);
        break;
      }
      case "damerau_levenshtein":
        sim = damerauSimilarity(curTxt, histTxt);
        break;
      default:
        sim = cosineSimilarityTFIDF(curTxt, histTxt);
    }
    out.push({ header, similarity: Math.round(sim * 100) });
  }
  return out;
}


// API route for cross-platform Markdown render comparison
app.post("/api/cross-platform-diff", async (req, res) => {
  const { markdown, compare } = req.body

  if (!markdown || !compare?.first || !compare?.second) {
    return res.status(400).json({
      error: "Missing required fields. 'markdown' and 'compare.first/second' are required."
    })
  }

  try {
    const result = await checkCrossPlatformDifferenceBackend(markdown, {
      first: compare.first,
      second: compare.second,
      image: compare.image        // <-- add this line
    });


    res.json({
      rendererA: result.rendererA,
      rendererB: result.rendererB,
      htmlA: result.htmlA,
      htmlB: result.htmlB,
      domDiff: result.domDiff,
      rawDiff: result.rawDiff,
      formattedRawDiff: result.formattedRawDiff,
      lineNumbers: result.lineNumbers, // ← add this line
      message: `Compared '${compare.first}' vs '${compare.second}'`,
      differences: {
        dom: result.domDiff.length,
        raw: result.rawDiff.length
      },
      pixelChanges: result.pixelChanges || 0,
      pngA: result.pngAPath || null,
      pngB: result.pngBPath || null,
      pngDiff: result.pngDiffPath || null
    })


  } catch (err) {
    console.error("Cross-platform diff error:", err)
    res.status(500).json({ error: err.message })
  }
})

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Linter backend running at http://localhost:${PORT}`);
});
