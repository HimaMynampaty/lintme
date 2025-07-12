var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// netlify/functions-src/runPipeline.js
var runPipeline_exports = {};
__export(runPipeline_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(runPipeline_exports);

// packages/pipeline-runner/utils/parseRules.js
var import_js_yaml = __toESM(require("js-yaml"), 1);
function parseRules(yamlText) {
  try {
    return import_js_yaml.default.load(yamlText);
  } catch {
    return { error: "Invalid YAML format. Check syntax." };
  }
}

// packages/pipeline-runner/operator-registry.js
var OPERATORS = {
  "generateAST": () => import("@himamynampaty/operator-generate-ast").then((m) => m.run),
  "extract": () => import("@himamynampaty/operator-extract").then((m) => m.run),
  "count": () => import("@himamynampaty/operator-count").then((m) => m.run),
  "threshold": () => import("@himamynampaty/operator-threshold").then((m) => m.run),
  "isPresent": () => import("@himamynampaty/operator-ispresent").then((m) => m.run),
  "regexMatch": () => import("@himamynampaty/operator-regexmatch").then((m) => m.run),
  "sage": () => import("@himamynampaty/operator-sage").then((m) => m.run),
  "compare": () => import("@himamynampaty/operator-compare").then((m) => m.run),
  "length": () => import("@himamynampaty/operator-length").then((m) => m.run),
  "search": () => import("@himamynampaty/operator-search").then((m) => m.run),
  "fixUsingLLM": () => import("@himamynampaty/operator-fixusingllm").then((m) => m.run),
  "detectHateSpeech": () => import("@himamynampaty/operator-detecthatespeech").then((m) => m.run)
};

// packages/pipeline-runner/index.js
async function runPipeline(yamlText, markdown) {
  const parsed = parseRules(yamlText);
  if (parsed.error) throw new Error(parsed.error);
  const { pipeline = [] } = parsed;
  const ctx = {
    markdown,
    diagnostics: [],
    rule: parsed.rule || "Unnamed Rule",
    description: parsed.description || "",
    pipeline,
    ruleYaml: yamlText
  };
  const generateAST = await OPERATORS["generateAST"]();
  await generateAST(ctx);
  for (const step of pipeline) {
    const opName = step.operator;
    const loader = OPERATORS[opName];
    if (!loader) {
      ctx.diagnostics.push({
        severity: "error",
        message: `Unknown operator "${opName}"`
      });
      continue;
    }
    const run = await loader();
    const opOutput = await run(ctx, step);
    if (opOutput && typeof opOutput === "object" && opOutput !== ctx) {
      ctx.pipelineResults ??= [];
      ctx.pipelineResults.push({ name: opName, data: opOutput });
    }
  }
  return ctx;
}

// netlify/functions-src/runPipeline.js
async function handler(event) {
  try {
    const { yamlText, markdown } = JSON.parse(event.body);
    const ctx = await runPipeline(yamlText, markdown);
    let lastOperator = null;
    const parsed = parseRules(yamlText);
    if (!parsed.error) {
      const steps = parsed?.pipeline ?? [];
      lastOperator = steps[steps.length - 1]?.operator;
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ ...ctx, lastOperator })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
