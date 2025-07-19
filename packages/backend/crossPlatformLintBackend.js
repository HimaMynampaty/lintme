// crossPlatformLintBackend.js
import { JSDOM }    from 'jsdom';
import * as DiffDOM from 'diff-dom';
import puppeteer    from 'puppeteer';
import { chromium } from 'playwright';
import { marked }   from 'marked';
import MarkdownIt   from 'markdown-it';
import { diffLines } from 'diff';
import pixelmatch   from 'pixelmatch';
import { PNG }      from 'pngjs';
import fs           from 'node:fs/promises';
import path         from 'node:path';

const dd = new DiffDOM.DiffDOM();

/* ------------------------------------------------------------------ */
/*  MAIN ENTRY                                                        */
/* ------------------------------------------------------------------ */
export async function checkCrossPlatformDifferenceBackend(
  markdown,
  cfg = { first: 'marked', second: 'puppeteer' }
) {
  /* render – first renderer receives data‑line attributes */
  const htmlA = await renderByType(markdown, cfg.first, true);
  const htmlB = await renderByType(markdown, cfg.second, false);

  const result = {};                      // collect optional fields

  const imgCfg = cfg.image || {};
  if (imgCfg.enabled) {
    const view   = imgCfg.viewport || {};
    const outDir = imgCfg.outDir   || '.cross-platform-screens';
    await fs.mkdir(outDir, { recursive: true });

    /* render screenshots */
    const [pngA, pngB] = await Promise.all([
      htmlToPNG(htmlA, view),
      htmlToPNG(htmlB, view)
    ]);

    /* diff screenshots */
    const { changedPixels, diffBuffer } = diffPNGs(
      pngA, pngB, imgCfg.threshold
    );

    /* save screenshots to disk */
    const fileA  = path.join(outDir, `${cfg.first}.png`);
    const fileB  = path.join(outDir, `${cfg.second}.png`);
    const diffF  = path.join(
      outDir,
      `diff_${cfg.first}_vs_${cfg.second}.png`
    );
    await Promise.all([
      fs.writeFile(fileA,  pngA),
      fs.writeFile(fileB,  pngB),
      fs.writeFile(diffF, diffBuffer)
    ]);

    /* expose in result */
    result.pixelChanges = changedPixels;
    result.pngAPath     = fileA;
    result.pngBPath     = fileB;
    result.pngDiffPath  = diffF;
  }

  /* ---------- DOM + raw HTML diffs -------------------------------- */
  const domDiff = dd.diff(
    new JSDOM(htmlA).window.document.body,
    new JSDOM(htmlB).window.document.body
  );

  const rawDiffParts     = diffLines(htmlA, htmlB);
  const rawDiff          = rawDiffParts.filter(p => p.added || p.removed);
  const formattedRawDiff = formatRawDiff(rawDiffParts);

  /* map raw‑HTML diff → Markdown line numbers */
  const lineNumbers = extractLinesFromDiff(rawDiffParts, markdown);

  return {
    rendererA: cfg.first,
    rendererB: cfg.second,
    htmlA,
    htmlB,
    domDiff,
    rawDiff,
    formattedRawDiff,
    lineNumbers,
    ...result
  };
}

/* ------------------------------------------------------------------ */
/*  RENDER HELPERS                                                    */
/* ------------------------------------------------------------------ */
function renderMarkedWithLines(md) {
  marked.use({
    gfm: true,
    headerIds: false,
    mangle: false,
    walkTokens(token) {
      if (token?.position?.start?.line != null) {
        token.attrs = token.attrs || [];
        token.attrs.push(['data-line', String(token.position.start.line)]);
      }
    }
  });
  return marked.parse(md, { sourcepos: true });
}

export async function renderByType(md, engine, withLines = false) {
  switch (engine) {
    case 'marked':      return withLines ? renderMarkedWithLines(md) : marked.parse(md);
    case 'markdown-it': return new MarkdownIt().render(md);
    case 'puppeteer':
    case 'playwright':  return renderInBrowser(md, engine);
    default:            throw new Error(`Unsupported renderer: ${engine}`);
  }
}

/* ------------------------------------------------------------------ */
/*  DIFF ⇒ LINE MAPPING                                               */
/* ------------------------------------------------------------------ */
function extractLinesFromDiff(parts, markdown) {
  const mdLines = markdown.split(/\r?\n/);
  const list    = [];

  parts.forEach(part => {
    if (!(part.added || part.removed)) return;
    const probe = stripEntities(part.value.replace(/<[^>]+>/g, '')).trim();
    if (!probe) return;

    mdLines.forEach((ln, idx) => {
      if (ln.includes(probe)) list.push(idx + 1);
    });
  });

  return list.sort((a, b) => a - b);
}

function stripEntities(txt) {
  return txt
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/* colourful +/- diff for summary */
function formatRawDiff(parts) {
  return parts
    .filter(p => p.added || p.removed)
    .map(p => (p.added ? '+ ' : '- ') + p.value.trimEnd())
    .join('\n');
}

/* ------------------------------------------------------------------ */
/*  HEADLESS‑BROWSER RENDER                                           */
/* ------------------------------------------------------------------ */
async function renderInBrowser(markdown, tool) {
  async function renderWith(page) {
    await page.setContent('<div id="preview">Loading…</div>', { waitUntil: 'domcontentloaded' });
    await page.addScriptTag({ url: 'https://cdn.jsdelivr.net/npm/marked/marked.min.js' });

    await page.evaluate(md => {
      document.querySelector('#preview').innerHTML = window.marked.parse(md);
    }, markdown);

    return page.$eval('#preview', el => el.innerHTML);
  }

  if (tool === 'puppeteer') {
    //const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page    = await browser.newPage();
    const html    = await renderWith(page);
    await browser.close();
    return html;
  }

  if (tool === 'playwright') {
    const browser = await chromium.launch({ args: ['--no-sandbox'] });
    const page    = await browser.newPage();
    const html    = await renderWith(page);
    await browser.close();
    return html;
  }

  throw new Error(`Unsupported browser tool: ${tool}`);
}

/* ------------------------------------------------------------------ */
/*  PNG HELPERS                                                       */
/* ------------------------------------------------------------------ */
export async function htmlToPNG(html, { width = 800, height = 600 } = {}) {
  //const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  console.log('Resolved Chromium path:', (await import('puppeteer')).executablePath());

  const page    = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const buffer  = await page.screenshot({ type: 'png', fullPage: false });
  await browser.close();
  return buffer;
}

function diffPNGs(bufA, bufB, threshold = 0.10) {
  const imgA = PNG.sync.read(bufA);
  const imgB = PNG.sync.read(bufB);
  const { width, height } = imgA;

  const diff = new PNG({ width, height });
  const changedPixels = pixelmatch(
    imgA.data,
    imgB.data,
    diff.data,
    width,
    height,
    { threshold }
  );

  return {
    changedPixels,
    diffBuffer: PNG.sync.write(diff)
  };
}
