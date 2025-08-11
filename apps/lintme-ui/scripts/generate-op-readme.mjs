// apps/lintme-ui/scripts/gen-operators-readme.mjs
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Path to output README file
const README_PATH = path.resolve(
  __dirname,
  '../src/components/OPERATORS_README.md'
);

// Path to directory containing all operator schema JSON files
const SCHEMAS_DIR = path.resolve(
  __dirname,
  '../src/lib/operatorSchemas'
);

// Markers so we can update only the table part
const START = '<!-- BEGIN:OPS-TABLE -->';
const END = '<!-- END:OPS-TABLE -->';

// Helpers to format table
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

// Build Markdown table from schemas
function makeTable(operatorSchemas) {
  const rows = Object.entries(operatorSchemas)
    .map(([name, s]) => ({
      name,
      desc: s?.description ?? s?.label ?? '',
      fieldsTxt: fieldList(s?.fields),
      reqTxt: requiredList(s?.fields)
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(r => `| \`${r.name}\` | ${escapeNewlines(r.desc)} | ${r.fieldsTxt} | ${r.reqTxt} |`)
    .join('\n');

  return `| Operator | Description | Fields | Required |
|---|---|---|---|
${rows}
`;
}

// Read all JSON schemas from folder into an object
async function loadOperatorSchemas() {
  const files = (await fs.readdir(SCHEMAS_DIR)).filter(f => f.endsWith('.json'));
  const map = {};
  for (const f of files) {
    const raw = await fs.readFile(path.join(SCHEMAS_DIR, f), 'utf8');
    map[f.replace(/\.json$/i, '')] = JSON.parse(raw);
  }
  return map;
}

// Create README skeleton if it doesn't exist
async function ensureReadmeSkeleton() {
  try {
    const exists = await fs.readFile(README_PATH, 'utf8').then(() => true).catch(() => false);
    if (!exists) {
      const skeleton = `# LintMe Operators

This file is generated from the JSON schemas in \`src/lib/operatorSchemas/*\`.

${START}
${END}
`;
      await fs.mkdir(path.dirname(README_PATH), { recursive: true });
      await fs.writeFile(README_PATH, skeleton, 'utf8');
    }
  } catch (e) {
    console.error('Failed to create README skeleton:', e);
    throw e;
  }
}

// Main run
async function run() {
  await ensureReadmeSkeleton();

  const operatorSchemas = await loadOperatorSchemas();
  const table = makeTable(operatorSchemas);

  const current = await fs.readFile(README_PATH, 'utf8');
  const hasMarkers = current.includes(START) && current.includes(END);

  const block = `${START}\n\n${table}\n${END}`;

  let next;
  if (hasMarkers) {
    next = current.replace(
      new RegExp(`${START}[\\s\\S]*?${END}`, 'm'),
      block
    );
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
