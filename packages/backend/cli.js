#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { lintMe } from '../../apps/lintme-ui/src/lib/linter.js'; // adjust path as needed

async function run() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error("Usage: node cli.js <README.md> <rules.yaml>");
    process.exit(1);
  }

  const [readmePath, rulesPath] = args;
  const readmeContent = fs.readFileSync(readmePath, "utf-8");
  const rulesContent = fs.readFileSync(rulesPath, "utf-8");

  const result = await lintMe(rulesContent, readmeContent);

  console.log(result.output);

  // optionally: write the fixed version to a new file
  if (result.fixedMarkdown && result.fixedMarkdown !== readmeContent) {
    const outPath = path.join(process.cwd(), "README.fixed.md");
    fs.writeFileSync(outPath, result.fixedMarkdown);
    console.log(`\n Fixed version written to: ${outPath}`);
  }

  
  // optionally: write the fixed version to original file
//   if (result.fixedMarkdown && result.fixedMarkdown !== readmeContent) {
//     fs.writeFileSync(readmePath, result.fixedMarkdown);
//     console.log(`\nFixed version saved to original file: ${readmePath}`);
//   }

  // non-zero exit if errors
  const hasErrors = result.diagnostics?.some(d => d.severity === 'error');
  process.exit(hasErrors ? 1 : 0);
}

run();
