#!/usr/bin/env node
import { Command } from "commander";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import yaml from "js-yaml";
import { pathToFileURL } from "node:url";
import { runPipeline } from "lintme-pipeline-runner";

const program = new Command();
program
  .name("lintme")
  .description("Lint README style and substance with LintMe")
  .version("0.1.0");

function collect(val, prev) { prev.push(val); return prev; }

/* ---------------------- fix/write cleanliness helpers --------------------- */

const MARKER = "---FIXED MARKDOWN BELOW---";

function stripCodeFence(s = "") {
  return s.replace(/^\s*```(?:\w+)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");
}
function dedupeExactDouble(s = "") {
  const t = s.trim();
  const n = t.length;
  if (n % 2 !== 0) return s;
  const a = t.slice(0, n / 2), b = t.slice(n / 2);
  return a === b ? a.trimEnd() + "\n" : s;
}
function normalizeFixed(original, candidate) {
  if (typeof candidate !== "string") return original;
  let s = String(candidate).replace(/\uFEFF/g, "");
  const i = s.indexOf(MARKER);
  if (i !== -1) s = s.slice(i + MARKER.length);
  s = stripCodeFence(s);
  s = s.replace(/^\s*\n?/, "");
  s = dedupeExactDouble(s);
  const origHadFinalNL = /\n$/.test(original);
  const sHasFinalNL = /\n$/.test(s);
  if (origHadFinalNL && !sHasFinalNL) s += "\n";
  return s;
}
function muteStdoutLogs() {
  const orig = { log: console.log, info: console.info };
  console.log = (...a) => console.error(...a);
  console.info = (...a) => console.error(...a);
  return () => { console.log = orig.log; console.info = orig.info; };
}

/* ------------------------------ preset helpers ---------------------------- */

async function loadPresetsModule(presetsPath) {
  const full = path.resolve(process.cwd(), presetsPath);
  const mod = await import(pathToFileURL(full).href);
  const presets = mod.rulePresets ?? mod.default;
  if (!presets || typeof presets !== "object") {
    throw new Error(
      `Invalid presets file "${presetsPath}" — export { rulePresets } or default.`
    );
  }
  return presets;
}

function ruleNameCandidates(name, rulesDir) {
  const base = String(name).trim();
  const stems = Array.from(new Set([
    base,
    base.replace(/\s+/g, "-"),
    base.replace(/[^\w.-]+/g, "-"),
    base.replace(/[^\w]+/g, ""), // super tight
  ]));
  return stems.flatMap(stem => [
    path.join(rulesDir, `${stem}.yaml`),
    path.join(rulesDir, `${stem}.yml`),
  ]);
}

async function resolvePresetRuleFiles(presetNames, presetsPath, rulesDir) {
  const presets = await loadPresetsModule(presetsPath);
  const wanted = (Array.isArray(presetNames) ? presetNames : [presetNames]).filter(Boolean);

  const resolved = [];
  for (const key of wanted) {
    const p = presets[key];
    if (!p) {
      console.error(`Preset "${key}" not found in ${presetsPath}`);
      continue;
    }
    for (const ruleName of (p.rulesByName || [])) {
      const candidates = ruleNameCandidates(ruleName, rulesDir);
      let winner = null;
      for (const f of candidates) {
        try { await fs.access(f); winner = f; break; } catch {}
      }
      if (winner) resolved.push(winner);
      else console.error(`Warning: could not find YAML for rule "${ruleName}" in ${rulesDir}`);
    }
  }
  // dedupe while preserving order
  return Array.from(new Set(resolved));
}

/* --------------------------------- command -------------------------------- */

program
  .command("run")
  .option("-r, --rule <file>", "YAML rule file (repeatable)", collect, [])
  .option("-p, --preset <name>", "Preset key (repeatable)", collect, [])
  .option("--presets <file>", "Path to rulePresets.js", "rulePresets.js")
  .option("--rules-dir <dir>", "Folder containing YAML rules for presets", "rules")
  .option("--list-presets", "List available presets from --presets and exit")
  .option("--in <file>", "Markdown file to lint (e.g., README.md)")
  .option("--json", "Print raw JSON diagnostics")
  .option("--fix", "Print final (possibly fixed) Markdown to stdout (only markdown)")
  .option("--write", "Write final (possibly fixed) Markdown back to the input file (implies --fix)")
  .action(async (opts) => {
    try {
      // 1) list presets early and exit (no --in needed)
      if (opts.listPresets) {
        const presets = await loadPresetsModule(opts.presets);
        for (const [k, p] of Object.entries(presets)) {
          console.log(`${k}\t${p?.label ?? ""}`);
        }
        process.exit(0);
      }

      // 2) build ordered list of rule files: presets first, then explicit --rule
      let ruleFiles = [];

      if (opts.preset?.length) {
        const fromPresets = await resolvePresetRuleFiles(
          opts.preset,
          opts.presets,
          opts.rulesDir
        );
        ruleFiles.push(...fromPresets);
      }

      // allow comma-separated form
      if (opts.rule?.length) {
        const expanded = [];
        for (const r of opts.rule) {
          if (r.includes(",")) expanded.push(...r.split(",").map(s => s.trim()).filter(Boolean));
          else expanded.push(r);
        }
        ruleFiles.push(...expanded.map(f => path.resolve(process.cwd(), f)));
      }

      // need at least one rule to do anything
      if (ruleFiles.length === 0) {
        console.error("No rules provided. Use --preset <key> (with --presets/--rules-dir) or --rule <file>.");
        process.exit(2);
      }

      // from here on we need an input file
      if (!opts.in) {
        console.error("Required: --in <file> (the Markdown to lint).");
        process.exit(2);
      }

      const mdPath = path.resolve(process.cwd(), opts.in);
      const originalInput = await fs.readFile(mdPath, "utf8");
      let working = originalInput;
      const allDiagnostics = [];

      // silence operator console.log noise when producing --fix/--write output
      const restoreLogs = (opts.fix || opts.write) ? muteStdoutLogs() : () => {};
      try {
        for (const rf of ruleFiles) {
          const ruleYaml = await fs.readFile(rf, "utf8");
          yaml.load(ruleYaml); // validate YAML
          const ctx = await runPipeline(ruleYaml, working);

          const tagged = (ctx.diagnostics || []).map(d => ({ ...d, rule: path.basename(rf) }));
          allDiagnostics.push(...tagged);

          if (ctx.fixedMarkdown && ctx.fixedMarkdown !== working) {
            working = normalizeFixed(working, ctx.fixedMarkdown);
          }
        }
      } finally {
        restoreLogs();
      }

      const hasIssues = allDiagnostics.some(d =>
        d.severity === "error" || d.severity === "warning"
      );

      // 3) fix/write modes: ONLY markdown to stdout or write back
      if (opts.fix || opts.write) {
        const finalOut = normalizeFixed(originalInput, working);
        if (opts.write) {
          await fs.writeFile(mdPath, finalOut, "utf8");
          console.error(`Applied fixes to ${opts.in}`);
          process.exit(0);
        } else {
          process.stdout.write(finalOut);
          process.exit(0);
        }
      }

      // 4) human report or JSON
      if (opts.json) {
        console.log(JSON.stringify({ diagnostics: allDiagnostics }, null, 2));
      } else {
        printHumanReport(allDiagnostics);
      }
      process.exit(hasIssues ? 1 : 0);
    } catch (err) {
      console.error("lintme: error:", err?.message || err);
      process.exit(2);
    }
  });

program.parseAsync(process.argv);

/* --------------------------------- reporter -------------------------------- */

function printHumanReport(diags = []) {
  const errs = diags.filter(d => d.severity === "error").length;
  const warns = diags.filter(d => d.severity === "warning").length;

  if (errs || warns) {
    console.log(`Lint failed with ${errs} error(s) and ${warns} warning(s).\n`);
    for (const d of diags) {
      const sev = (d.severity || "info").toUpperCase();
      const line = d.line ?? "-";
      const src = d.rule ? ` (${d.rule})` : "";
      console.log(`${sev} [${line}]${src}: ${d.message}`);
    }
  } else {
    console.log("All rules passed. No issues found.");
  }
}
