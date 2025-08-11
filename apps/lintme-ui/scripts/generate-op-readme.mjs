import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const README_PATH = path.resolve(__dirname, '../src/components/README.md');
const SCHEMAS_DIR = path.resolve(__dirname, '../src/lib/operatorSchemas');
const COMPONENTS_DIR = path.resolve(__dirname, '../src/components');
const BACKEND_OPS_DIR = path.resolve(__dirname, '../../../packages/operators');

const START = '<!-- BEGIN:OPS-TABLE -->';
const END = '<!-- END:OPS-TABLE -->';

const exists = async (p) => !!(await fs.stat(p).catch(() => null));
const rel = (from, to) => path.relative(path.dirname(from), to).replaceAll('\\', '/');

const fieldList = (fields = {}) =>
  Object.keys(fields).map(n => `\`${n}\``).join(', ') || '—';

const requiredList = (fields = {}) => {
  const req = Object.entries(fields)
    .filter(([, f]) => f && f.required)
    .map(([n]) => `\`${n}\``);
  return req.join(', ') || '—';
};

const escapeNewlines = (s = '') => String(s).replaceAll('\n', ' ');

const componentOverrides = {
  isLinkAlive: 'LinkAliveOperator.svelte'
};

const pascal = (name) => {
  if (!name) return '';
  if (/[-_\s]/.test(name)) {
    return name
      .split(/[-_\s]+/)
      .filter(Boolean)
      .map(w => w[0].toUpperCase() + w.slice(1))
      .join('');
  }
  return name[0].toUpperCase() + name.slice(1);
};

const mdLink = (label, relPath) => `[${label}](${relPath})`;

async function makeTable(operatorSchemas) {
  const rows = [];
  for (const [name, s] of Object.entries(operatorSchemas).sort((a, b) => a[0].localeCompare(b[0]))) {
    const schemaAbs = path.join(SCHEMAS_DIR, `${name}.json`);
    const schemaLink = (await exists(schemaAbs)) ? mdLink('Json Schema', rel(README_PATH, schemaAbs)) : '—';

    const compFile = componentOverrides[name] || `${pascal(name)}Operator.svelte`;
    const compAbs = path.join(COMPONENTS_DIR, compFile);
    const compLink = (await exists(compAbs)) ? mdLink('Svelte Component', rel(README_PATH, compAbs)) : '—';

    const implAbs = path.join(BACKEND_OPS_DIR, name, 'index.js');
    const implLink = (await exists(implAbs)) ? mdLink('Implementation', rel(README_PATH, implAbs)) : '—';

    const links = [schemaLink, compLink, implLink].join(' · ');

    rows.push(
      `| \`${name}\` | ${escapeNewlines(s?.description ?? s?.label ?? '')} | ${fieldList(s?.fields)} | ${requiredList(s?.fields)} | ${links} |`
    );
  }

  return `| Operator | Description | Fields | Required | Links |
|---|---|---|---|---|
${rows.join('\n')}
`;
}

async function loadOperatorSchemas() {
  const files = (await fs.readdir(SCHEMAS_DIR)).filter(f => f.endsWith('.json'));
  const map = {};
  for (const f of files) {
    const raw = await fs.readFile(path.join(SCHEMAS_DIR, f), 'utf8');
    map[f.replace(/\.json$/i, '')] = JSON.parse(raw);
  }
  return map;
}

async function ensureReadmeSkeleton() {
  const has = await exists(README_PATH);
  if (!has) {
    const skeleton = `# LintMe Operators

This file is generated from the JSON schemas in \`src/lib/operatorSchemas/*\`.

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
  const next = current.includes(START) && current.includes(END)
    ? current.replace(new RegExp(`${START}[\\s\\S]*?${END}`, 'm'), block)
    : `${current.trim()}\n\n${block}\n`;

  if (next !== current) {
    await fs.writeFile(README_PATH, next, 'utf8');
    console.log('Operators table updated:', README_PATH);
  } else {
    console.log('Operators table already up to date.');
  }
}

run().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
