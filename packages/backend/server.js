import express from "express";
import cors    from "cors";
import fetch   from "node-fetch";
import Groq    from "groq-sdk";
import dotenv  from "dotenv";
import fs      from "fs";
import path    from "path";
import os      from "os";
import { exec } from "child_process";
import natural from "natural";

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const damerauPkg            = require("talisman/metrics/damerau-levenshtein.js");
const damerauLevenshtein    = damerauPkg.default || damerauPkg;

import { pipeline } from "@xenova/transformers";
import { checkCrossPlatformDifferenceBackend } from './crossPlatformLintBackend.js'


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const shell = os.platform() === "win32" ? "cmd.exe" : "/bin/sh";

let embedder;                          // lazy‑loaded
const readmeCache = new Map();         // url → { ts, text }
const CACHE_TTL   = 1000 * 60 * 30;    // 30 minutes
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

// Helper function to get files from a directory
// function getFilesFromDirectory(directoryPath) {
//     try {
//         return fs.readdirSync(directoryPath).filter(file => fs.statSync(path.join(directoryPath, file)).isFile());
//     } catch (error) {
//         console.error("Error reading directory:", error);
//         return [];
//     }
// }

// API to list files from specified folders
// app.get("/api/files", (req, res) => {
//     const { type } = req.query;

//     const rulesPath = "C:\\Users\\Hima\\Documents\\Utah-edu-summer\\LintMe\\apps\\lintme-ui\\examples\\rules";
//     const readmePath = "C:\\Users\\Hima\\Documents\\Utah-edu-summer\\LintMe\\apps\\lintme-ui\\examples\\readMe";

//     const directoryPath = type === "rules" ? rulesPath : readmePath;
//     const files = getFilesFromDirectory(directoryPath);

//     res.json({ files });
// });

// API to read file content
// app.get("/api/file-content", (req, res) => {
//     const { type, fileName } = req.query;

//     const rulesPath = "C:\\Users\\Hima\\Documents\\Utah-edu-summer\\LintMe\\apps\\lintme-ui\\examples\\rules";
//     const readmePath = "C:\\Users\\Hima\\Documents\\Utah-edu-summer\\LintMe\\apps\\lintme-ui\\examples\\readMe";

//     const directoryPath = type === "rules" ? rulesPath : readmePath;
//     const filePath = path.join(directoryPath, fileName);

//     if (!fs.existsSync(filePath)) {
//         return res.status(404).json({ error: "File not found" });
//     }

//     try {
//         const content = fs.readFileSync(filePath, "utf-8");
//         res.json({ content });
//     } catch (error) {
//         console.error("Error reading file:", error);
//         res.status(500).json({ error: "Failed to read file" });
//     }
// });

// Keep the existing routes

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

  /*────────────────────────  ROUTE  ────────────────────────*/
  app.post("/api/compare-readmes", async (req, res) => {
    const {
      current,
      historical,
      repo,
      versionCount = 2,
      method = "embedding_cosine"
    } = req.body;
  
    if (!current) return res.status(400).json({ error: "Missing current README content." });
  
    /* Resolve URLs */
    let urls = historical;
    if ((!urls || !urls.length) && repo) {
      try { urls = await fetchReadmeVersions(repo, versionCount); }
      catch (err) {
        console.error("GitHub fetch error:", err);
        return res.status(500).json({ error: "Could not retrieve historical versions from GitHub." });
      }
    }
    if (!urls || !urls.length) return res.status(400).json({ error: "No historical versions provided." });
  
    /* Pre‑embed current README (if needed) */
    let currentEmbeddingPromise = null;
    if (["embedding_cosine","euclidean","sectional_embedding"].includes(method))
      currentEmbeddingPromise = getEmbedding(current);
  
    /* Pre‑embed current sections (if needed) */
    let currentSectionEmbeds = null;
    if (method === "sectional_embedding") {
      const curSecs = Object.values(extractSections(current));
      currentSectionEmbeds = await Promise.all(curSecs.map(getEmbedding));
    }
  
    /* Fetch historical READMEs (cached) */
    const docs = await Promise.all(
      urls.map(async url => {
        try { return { url, content: await getReadmeCached(url) }; }
        catch (e) { return { url, error: e.message, content: "" }; }
      })
    );
  
    /* Compute similarities */
    const comparison = await Promise.all(
      docs.map(async ({ url, content, error }) => {
        if (!content) return { url, similarity: 0, error, sectionSimilarity: [] };
  
        let simDoc = 0;
  
        switch (method) {
          case "cosine":
            simDoc = cosineSimilarityTFIDF(current, content);
            break;
  
          case "embedding_cosine": {
            const [curEmb, histEmb] = await Promise.all([
              currentEmbeddingPromise,
              getEmbedding(content)
            ]);
            simDoc = cosineSimilarity(curEmb, histEmb);
            break;
          }
  
          case "euclidean": {
            const [curEmb, histEmb] = await Promise.all([
              currentEmbeddingPromise,
              getEmbedding(content)
            ]);
            simDoc = euclideanSimilarity(curEmb, histEmb);
            break;
          }
  
          case "damerau_levenshtein":
            simDoc = damerauSimilarity(current, content);
            break;
  
          case "sectional_embedding": {
            const histSecs = Object.values(extractSections(content));
            const embHist  = await Promise.all(histSecs.map(getEmbedding));
            const sims     = embHist.map((e,i)=>cosineSimilarity(currentSectionEmbeds[i], e));
            simDoc = sims.reduce((s,v)=>s+v,0) / sims.length;
            break;
          }
  
          default:
            simDoc = cosineSimilarityTFIDF(current, content);
        }
  
        const secSim = await compareSectionSimilarities(current, content, method);
        return {
          url,
          similarity: Math.round(simDoc * 100),
          sectionSimilarity: secSim
        };
      })
    );
  
    res.json({ comparison });
  });
  
 
  /**
   * Helpers below
   */
  function cosineSimilarity(v1, v2) {
    let dot = 0, n1 = 0, n2 = 0;
    for (let i = 0; i < v1.length; i++) {
      dot += v1[i] * v2[i];
      n1  += v1[i] * v1[i];
      n2  += v2[i] * v2[i];
    }
    return dot / (Math.sqrt(n1) * Math.sqrt(n2));
  }
  
  /* TF‑IDF cosine (unchanged from previous code) */
  function cosineSimilarityTFIDF(a, b) {
    const tfidf = new natural.TfIdf();
    tfidf.addDocument(a); tfidf.addDocument(b);
    const vec = (i) => tfidf.listTerms(i).reduce((m,t)=>(m[t.term]=t.tfidf,m),{});
    const vA = vec(0), vB = vec(1), terms = new Set([...Object.keys(vA),...Object.keys(vB)]);
    let dot=0,n1=0,n2=0;
    terms.forEach(t=>{const x=vA[t]||0,y=vB[t]||0;dot+=x*y;n1+=x*x;n2+=y*y;});
    return n1 && n2 ? dot/Math.sqrt(n1*n2) : 0;
  }

  function damerauSimilarity(a,b){
    const dist=damerauLevenshtein(a,b);
    const max=Math.max(a.length,b.length)||1;
    return 1-dist/max;
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
  function extractSections(md){
    const sections={}, lines=md.split("\n"); let cur=null;
    for(const line of lines){
      if (/^#{1,6} /.test(line)){ cur=line.trim(); sections[cur]=""; }
      else if (cur){ sections[cur]+=line+"\n"; }
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
      first : compare.first,
      second: compare.second,
      image : compare.image        // <-- add this line
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
      pixelChanges : result.pixelChanges || 0,
      pngA         : result.pngAPath        || null,
      pngB         : result.pngBPath        || null,
      pngDiff      : result.pngDiffPath     || null
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
