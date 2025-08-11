// apps/lintme-ui/scripts/generate-op-readme.mjs
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** OUTPUT file */
const README_PATH = path.resolve(__dirname, '../src/components/README.md');

/** Sources */
const SCHEMAS_DIR     = path.resolve(__dirname, '../src/lib/operatorSchemas');
const COMPONENTS_DIR  = path.resolve(__dirname, '../src/components');
// NOTE: from apps/lintme-ui/scripts -> up to repo root -> packages/backend/operators
const BACKEND_OPS_DIR = path.resolve(__dirname, '../../../packages/backend/operators');

/** Markers to safely replace only the table */
const START = '<!-- BEGIN:OPS-TABLE -->';
const END   = '<!-- END:OPS-TABLE -->';

/* ---------------- helpers ---------------- */

async function exists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

function fieldList(fields = {}) {
  return Object.keys(fields).map(n => `\`${n}\``).join(', ') || '—';
}

function requiredList(fields = {}) {
  const req = Object.entries(fields)
    .filter(([, f]) => f && f.required)
    .map(([n]) => `\`${n}\``);
  return req.join(', ') || '—';
}

function escapeNewlines(s = '') {
  return String(s).replaceAll('\n', ' ');
}

/** Convert operator name to PascalCase */
function toPascalCase(name) {
  return String(name)
    .replace(/[-_ ]+([a-zA-Z0-9])/g, (_, c) => c.toUpperCase())
    .replace(/^[a-z]/, c => c.toUpperCase());
}

/** Component file name, with a few overrides that don’t match straight PascalCase */
function componentFileForOperator(op) {
  const overrides = {
    isLinkAlive: 'LinkAliveOperator.svelte',
    readmeLocationCheck: 'ReadmeLocationCheckOperator.svelte',
  };
  if (overrides[op]) return overrides[op];
  return `${toPascalCase(op)}Operator.svelte`;
}

/** Markdown link builder (relative links for the repo) */
function mdLink(label, relFromReadme) {
  return `[${label}](${relFromReadme})`;
}

function rel(fromAbs, toAbs) {
  return path.relative(path.dirname(fromAbs), toAbs).split(path.sep).join('/');
}

/* --------------- core builders --------------- */

async function makeTable(operatorSchemas) {
  const rows = [];

  for (const [name, s] of Object.entries(operatorSchemas).sort((a, b) => a[0].localeCompare(b[0]))) {
    const desc      = s?.description ?? s?.label ?? '';
    const fieldsTxt = fieldList(s?.fields);
    const reqTxt    = requiredList(s?.fields);

    // schema.json
    const schemaAbs = path.join(SCHEMAS_DIR, `${name}.json`);
    const schemaRel = rel(README_PATH, schemaAbs);
    const schemaLink = (await exists(schemaAbs)) ? mdLink('Schema', schemaRel) : 'Schema: —';

    // svelte component
    const compAbs = path.join(COMPONENTS_DIR, componentFileForOperator(name));
    const compRel = rel(README_PATH, compAbs);
    const compLink = (await exists(compAbs)) ? mdLink('Component', compRel) : 'Component: —';

    // backend operator implementation (…/packages/backend/operators/<op>/index.js)
    const implAbs = path.join(BACKEND_OPS_DIR, name, 'index.js');
    const implRel = rel(README_PATH, implAbs);
    const implLink = (await exists(implAbs)) ? mdLink('Implementation', implRel) : 'Implementation: —';

    // single “Links” column (no Schema Index)
    const links = [schemaLink, compLink, implLink].join(' · ');

    rows.push(`| \`${name}\` | ${escapeNewlines(desc)} | ${fieldsTxt} | ${reqTxt} | ${links} |`);
  }

  return `| Operator | Description | Fields | Required | Links |
|---|---|---|---|---|
${rows.join('\n')}
`;
}

/** Read all JSON files from the schemas dir into an object */
async function loadOperatorSchemas() {
  const files = (await fs.readdir(SCHEMAS_DIR)).filter(f => f.endsWith('.json'));
  const map = {};
  for (const f of files) {
    const raw = await fs.readFile(path.join(SCHEMAS_DIR, f), 'utf8');
    map[f.replace(/\.json$/i, '')] = JSON.parse(raw);
  }
  return map;
}

/** Create the README skeleton on first run */
async function ensureReadmeSkeleton() {
  const has = await fs.readFile(README_PATH, 'utf8').then(() => true).catch(() => false);
  if (!has) {
    const skeleton = `# LintMe Operators

This file is generated from the JSON schemas in \`src/lib/operatorSchemas/*\`.
Edit above/below the markers freely; the table between them is auto-generated.

${START}
${END}
`;
    await fs.mkdir(path.dirname(README_PATH), { recursive: true });
    await fs.writeFile(README_PATH, skeleton, 'utf8');
  }
}

async function run() {
  await ensureReadmeSkeleton();

  const operatorSchemas = await loadOperatorSchemas();
  const table = await makeTable(operatorSchemas);

  const current = await fs.readFile(README_PATH, 'utf8');
  const block = `${START}\n\n${table}\n${END}`;

  let next;
  if (current.includes(START) && current.includes(END)) {
    next = current.replace(new RegExp(`${START}[\\s\\S]*?${END}`, 'm'), block);
  } else {
    next = `${current.trim()}\n\n${block}\n`;
  }

  if (next !== current) {
    await fs.writeFile(README_PATH, next, 'utf8');
    console.log('✅ Operators table updated:', README_PATH);
  } else {
    console.log('ℹ️  Operators table already up to date.');
  }
}

run().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
