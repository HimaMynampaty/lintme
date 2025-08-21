import fs from "node:fs/promises";
import Handlebars from "handlebars";
import dayjs from "dayjs";
import admin from "firebase-admin";
import * as YAML from "yaml";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);

const saJson = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!saJson) {
  console.error("Missing FIREBASE_SERVICE_ACCOUNT env var (service account JSON).");
  process.exit(1);
}
const serviceAccount = JSON.parse(saJson);
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const db = admin.firestore();

function getDescriptionFromYaml(yamlText = "", fallback = "(No description)") {
  try {
    const parsed = YAML.parse(yamlText ?? "");
    const d = parsed?.description;
    return (typeof d === "string" && d.trim()) ? d.trim() : fallback;
  } catch {
    return fallback;
  }
}

function getOperatorsFromYaml(yamlText = "") {
  try {
    const parsed = YAML.parse(yamlText ?? "");
    const pipeline = Array.isArray(parsed?.pipeline) ? parsed.pipeline : [];
    const ops = pipeline
      .map(s => (s && typeof s.operator === "string" ? s.operator.trim() : null))
      .filter(Boolean);
    const seen = new Set();
    return ops.filter(o => (seen.has(o) ? false : (seen.add(o), true))).join(", ");
  } catch {
    return "";
  }
}

function norm(s, fallback = "") {
  return (s ?? fallback).toString().normalize("NFKD").trim();
}

async function fetchRules() {
  const snap = await db.collection("rules").get();
  const rules = snap.docs.map(d => {
    const data = d.data() ?? {};
    const name = norm(data.name, "(unnamed)");
    const category = norm(data.category, "(uncategorized)");
    const description =
      (norm(data.description) || getDescriptionFromYaml(data.yaml) || "(No description)");
    const operators = getOperatorsFromYaml(data.yaml);
    return { id: d.id, name, category, description, operators };
  });

  rules.sort((a, b) => {
    const byCat = a.category.localeCompare(b.category, undefined, {
      sensitivity: "base",
      numeric: true,
    });
    if (byCat) return byCat;
    return a.name.localeCompare(b.name, undefined, {
      sensitivity: "base",
      numeric: true,
    });
  });

  return rules;
}

function renderMarkdown(rules) {
  const tplSrc = `
# Lint Rules

_Last updated: {{generatedAt}}_

| Name | Category | Description | Operators Used |
|---|---|---|---|
{{#each rules}}
| {{name}} | {{category}} | {{description}} | {{operators}} |
{{/each}}

_Total rules: {{count}}_
`.trim();

  const tpl = Handlebars.compile(tplSrc, { noEscape: true });
  return tpl({
    rules,
    count: rules.length,
    generatedAt: dayjs.utc().format("YYYY-MM-DD HH:mm [UTC]"),
  });
}

async function main() {
  const rules = await fetchRules();
  const md = renderMarkdown(rules);
  await fs.writeFile("RULES.md", md, "utf-8");
  console.log("RULES.md generated.");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
