var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// packages/operators/generate-ast/index.js
var generate_ast_exports = {};
__export(generate_ast_exports, {
  run: () => run
});
import { fromMarkdown } from "mdast-util-from-markdown";
import { gfm } from "micromark-extension-gfm";
import { gfmFromMarkdown } from "mdast-util-gfm";
function run(ctx, config = {}) {
  const ast = fromMarkdown(ctx.markdown, {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()]
  });
  ctx.ast = ast;
  return ctx;
}
var init_generate_ast = __esm({
  "packages/operators/generate-ast/index.js"() {
  }
});

// packages/operators/extract/index.js
var extract_exports = {};
__export(extract_exports, {
  run: () => run2
});
import { visit, EXIT } from "unist-util-visit";
import { toString } from "mdast-util-to-string";
function run2(ctx, cfg = {}) {
  if (!ctx.ast) return pushErr(ctx, "extract operator needs generateAST to run first");
  const { target, scopes } = cfg;
  if (!target) return pushErr(ctx, 'extract operator missing "target"');
  if (!scopes || scopes.length === 0) return pushErr(ctx, 'extract operator missing "scopes"');
  const md = ctx.markdown ?? "";
  const isRegex = target in BUILTIN_RX || /^[./].*[./]$/.test(target);
  const re = isRegex ? toRegExp(target) : null;
  const isExternal = (url) => /^https?:\/\//i.test(url);
  const isInternal = (url) => !isExternal(url);
  if (!isRegex && !["internallink", "externallink"].includes(target)) {
    let found = false;
    visit(ctx.ast, (n) => {
      if (n.type === target) {
        found = true;
        return EXIT;
      }
    });
    if (!found) {
      ctx.diagnostics.push({
        line: 1,
        severity: "warning",
        message: `extract: no \u201C${target}\u201D nodes found. Either this markdown doesn\u2019t contain that node type or \u201C${target}\u201D isn\u2019t a valid mdast node type.`
      });
    }
  }
  const checkLinkFormatting = (markdown) => {
    const RX = {
      missingCloseParen: [/\[[^\]]*\]\([^\)]*$/, "Malformed link: missing closing parenthesis ')'."],
      missingCloseBracket: [/\[[^\]]*$/, "Malformed link: missing closing bracket ']'."],
      missingOpenBracket: [/^[^\[]+\][^\(]*\([^\)]*\)/, "Malformed link: missing opening bracket '['."],
      missingOpenParen: [/\[[^\]]*\][^\(]*[^)]$/, "Malformed link: missing opening parenthesis '('."],
      emptyLinkPattern: [/\[\s*\]\(\s*\)/, "Empty link: both text and URL are missing."]
    };
    const out = [];
    markdown.split("\n").forEach((ln, i) => {
      for (const [_k, [rx, msg]] of Object.entries(RX)) {
        if (rx.test(ln)) {
          out.push({ line: i + 1, content: ln.trim(), message: msg });
          break;
        }
      }
    });
    return out;
  };
  const matchNode = (n) => {
    if (isRegex) return false;
    if (target === "link") {
      if (n.type !== "link") return false;
      const child = n.children?.[0];
      if (n.title == null && child?.type === "text" && n.url === child.value) {
        return false;
      }
      return true;
    }
    if (target === "internallink" || target === "externallink") {
      if (n.type !== "link") return false;
      if (n.title == null && n.children?.length === 1 && n.children[0].type === "text" && n.url === n.children[0].value) {
        return false;
      }
      return target === "internallink" ? isInternal(n.url || "") : isExternal(n.url || "");
    }
    return n.type === target;
  };
  const matchText = (txt) => isRegex ? [...txt.matchAll(re)].map((m) => m[0]).filter((s) => !/^https?:\/\/\S+$/i.test(s)) : [];
  const serializeNode = (n) => {
    if (ctx.markdown && n.position?.start && n.position?.end) {
      const lines = ctx.markdown.split("\n");
      const { start, end } = n.position;
      if (start.line === end.line) {
        return lines[start.line - 1].slice(start.column - 1, end.column - 1);
      }
      const snippet = [lines[start.line - 1].slice(start.column - 1)];
      for (let i = start.line; i < end.line - 1; i++) {
        snippet.push(lines[i]);
      }
      snippet.push(lines[end.line - 1].slice(0, end.column - 1));
      return snippet.join("\n");
    }
    if (typeof n.value === "string") return n.value;
    return toString(n);
  };
  const malformed = checkLinkFormatting(md);
  const result = { document: [], paragraph: [], line: {}, endoffile: [] };
  const handlers = {
    document() {
      if (isRegex) {
        visit(ctx.ast, "text", (n) => {
          const hits = matchText(n.value);
          const ln = n.position?.start?.line;
          for (const h of hits) {
            result.document.push({ content: h, line: ln });
          }
        });
      } else {
        visit(ctx.ast, (n) => {
          if (!matchNode(n)) return;
          if (n.type === "link" && n.title == null && n.children?.length === 1 && n.children[0].type === "text" && n.url === n.children[0].value) return;
          result.document.push({
            ...n,
            line: n.position?.start?.line ?? 1,
            content: serializeNode(n)
          });
        });
        if (target === "internallink" || target === "externallink") {
          malformed.forEach((iss) => {
            if (iss.line === void 0) return;
            const urlMatch = iss.content.match(/\(([^()\s]*)/);
            const url = urlMatch?.[1] ?? "";
            const internal = isInternal(url);
            if (target === "internallink" && internal || target === "externallink" && !internal) {
              result.document.push({ type: "malformedlink", url, ...iss });
            }
          });
        }
      }
    },
    paragraph() {
      visit(ctx.ast, "paragraph", (p) => {
        const decorated = [];
        const matches = isRegex ? matchText(toString(p)) : collectMatches(p, matchNode);
        if (matches.length) {
          decorated.push(
            ...matches.map(
              (m) => typeof m === "string" ? { content: m } : { ...m, content: serializeNode(m) }
            )
          );
        }
        if (target === "internallink" || target === "externallink") {
          const { line: start } = p.position.start;
          const { line: end } = p.position.end;
          malformed.forEach((iss) => {
            if (iss.line < start || iss.line > end) return;
            const url = (iss.content.match(/\(([^()\s]*)/) || [])[1] ?? "";
            const same = target === "internallink" ? isInternal(url) : isExternal(url);
            if (same) decorated.push({ type: "malformedlink", url, ...iss });
          });
        }
        if (decorated.length) {
          result.paragraph.push({ line: p.position.start.line, matches: decorated });
        }
      });
    },
    line() {
      if (isRegex) {
        visit(ctx.ast, "text", (n) => {
          const hits = matchText(n.value);
          if (hits.length) {
            const ln = n.position?.start?.line;
            (result.line[ln] ??= []).push(
              ...hits.map((h) => ({ content: h }))
            );
          }
        });
      } else {
        visit(ctx.ast, (n) => {
          if (!matchNode(n)) return;
          if (n.type === "link" && n.title == null && n.children?.length === 1 && n.children[0].type === "text" && n.url === n.children[0].value) return;
          const ln = n.position?.start?.line;
          (result.line[ln] ??= []).push({
            ...n,
            content: serializeNode(n)
          });
        });
        if (target === "internallink" || target === "externallink") {
          malformed.forEach((iss) => {
            const urlMatch = iss.content.match(/\(([^()\s]*)/);
            const url = urlMatch?.[1] ?? "";
            const internal = isInternal(url);
            if (target === "internallink" && internal || target === "externallink" && !internal) {
              if (iss.line !== void 0) {
                (result.line[iss.line] ??= []).push({ type: "malformedlink", url, ...iss });
              }
            }
          });
        }
      }
    },
    endoffile() {
      if (isRegex) {
        const endsWithNewline = /\r?\n$/.test(md);
        if (endsWithNewline) {
          const line = md.split("\n").length;
          result.endoffile.push({
            content: "\\n",
            line
          });
        }
      } else {
        const endLine = md.split("\n").length;
        visit(ctx.ast, (n) => {
          if (n.position?.start?.line === endLine && matchNode(n)) {
            result.endoffile.push({
              ...n,
              line: endLine,
              content: serializeNode(n)
            });
          }
        });
        if (target === "internallink" || target === "externallink") {
          malformed.forEach((iss) => {
            if (iss.line !== endLine) return;
            const urlMatch = iss.content.match(/\(([^()\s]*)/);
            const url = urlMatch?.[1] ?? "";
            const internal = isInternal(url);
            if (target === "internallink" && internal || target === "externallink" && !internal) {
              result.endoffile.push({ type: "malformedlink", url, ...iss });
            }
          });
        }
      }
    }
  };
  for (const scope of ["document", "paragraph"]) {
    const seen = /* @__PURE__ */ new Set();
    result[scope] = result[scope].filter((item) => {
      const key = `${item.line}|${item.content}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  const lineSeen = /* @__PURE__ */ new Set();
  for (const [ln, entries] of Object.entries(result.line)) {
    result.line[ln] = entries.filter((e) => {
      const key = `${ln}|${e.content}`;
      if (lineSeen.has(key)) return false;
      lineSeen.add(key);
      return true;
    });
  }
  for (const s of scopes) handlers[s]?.();
  ctx.extracted = { target, scopes, data: result };
  return { target, scopes, data: result };
}
function collectMatches(parent, predicate) {
  const out = [];
  visit(parent, (n) => predicate(n) && out.push(n));
  return out;
}
function pushErr(ctx, msg) {
  ctx.diagnostics.push({ line: 1, severity: "error", message: msg });
  return ctx;
}
var EMOJI_REGEX, DATE_REGEX, BUILTIN_RX, escapeRE, toRegExp;
var init_extract = __esm({
  "packages/operators/extract/index.js"() {
    EMOJI_REGEX = /:[\w+-]+:|[\p{Emoji_Presentation}\p{Extended_Pictographic}\u{FE0F}\u{1F1E6}-\u{1F1FF}]/gu;
    DATE_REGEX = /\b(?:\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\d{4}[\/-]\d{1,2}[\/-]\d{1,2})\b/g;
    BUILTIN_RX = { emoji: EMOJI_REGEX, newline: /\r?\n/g, date: DATE_REGEX };
    escapeRE = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    toRegExp = (t) => BUILTIN_RX[t] || new RegExp(escapeRE(t), "gi");
  }
});

// packages/operators/count/index.js
var count_exports = {};
__export(count_exports, {
  run: () => run3
});
function run3(ctx, cfg = {}) {
  if (!ctx.extracted) {
    ctx.diagnostics.push({
      line: 1,
      severity: "error",
      message: "count operator needs a previous step (extract/search/etc.)"
    });
    return ctx;
  }
  const { target, scopes, data } = ctx.extracted;
  const summary = {};
  for (const s of scopes) {
    if (s === "line") {
      const totalPerLine = {};
      (ctx.markdown ?? "").split("\n").forEach((_, i) => {
        const ln = i + 1;
        totalPerLine[ln] = data.line?.[ln]?.length ?? 0;
      });
      summary.line = totalPerLine;
    } else if (s === "paragraph") {
      summary.paragraph = (data.paragraph ?? []).map((p) => ({
        line: p.line,
        count: p.matches.length
      }));
    } else {
      summary[s] = Array.isArray(data[s]) ? data[s].length : 0;
    }
  }
  ctx.counted = { target, scopes, data: summary };
  ctx.count ??= {};
  ctx.count[target] = summary;
  ctx.previous = { target, scopes };
  return { target, scopes, data: summary };
}
var init_count = __esm({
  "packages/operators/count/index.js"() {
  }
});

// packages/operators/threshold/index.js
var threshold_exports = {};
__export(threshold_exports, {
  run: () => run4
});
function run4(ctx, cfg = {}) {
  let { target, conditions = {}, level = "warning" } = cfg;
  if (!target) {
    if (ctx.previous?.target) {
      target = ctx.previous.target;
    } else if (ctx.count && Object.keys(ctx.count).length === 1) {
      target = Object.keys(ctx.count)[0];
    }
    if (target) {
      cfg.target = target;
      cfg._inferred = true;
    }
  }
  const allViolations = {};
  if (!target && ctx.previous) {
    target = ctx.previous.target;
  }
  if (!target) {
    pushErr2(ctx, 'threshold operator missing "target"');
    return ctx;
  }
  const counts = ctx.count?.[target];
  if (!counts) {
    pushErr2(
      ctx,
      `No counts found for "${target}". Ensure a prior step (like 'count' or 'length') ran first.`
    );
    return ctx;
  }
  const adapters = {
    document: () => [{ line: 1, actual: counts.document ?? 0 }],
    endoffile: () => [{ line: 1, actual: counts.endoffile ?? 0 }],
    previousstepoutput: () => [{ line: 1, actual: counts.previousstepoutput ?? 0 }],
    line: () => Object.entries(counts.line ?? {}).map(
      ([ln, c]) => ({ line: +ln, actual: c })
    ),
    paragraph: () => (counts.paragraph ?? []).map((p) => ({
      line: p.line,
      actual: p.count ?? p.length ?? 0
    }))
  };
  const prevScopes = ctx.previous?.scopes ?? [];
  for (const [scopeKey, rule] of Object.entries(conditions)) {
    let effectiveScope = scopeKey;
    let rows = adapters[effectiveScope]?.() ?? [];
    const allZero = rows.every((r) => (r.actual ?? 0) === 0);
    if (allZero && prevScopes.length === 1) {
      const altScope = prevScopes[0];
      if (altScope !== effectiveScope && adapters[altScope]) {
        const altRows = adapters[altScope]();
        if (altRows.length > 0) {
          effectiveScope = altScope;
          rows = altRows;
        }
      }
    }
    const { type, value } = rule;
    if (value == null) continue;
    const violations = [];
    for (const { line, actual } of rows) {
      if (!compare(actual, type, value)) {
        const message = formatMsg(effectiveScope, line, actual, target, type, value, ctx);
        ctx.diagnostics.push({ line, severity: level, message });
        violations.push({
          line,
          actual,
          scope: effectiveScope,
          expected: { type, value },
          message
        });
      }
    }
    if (violations.length) {
      allViolations[effectiveScope] ??= [];
      allViolations[effectiveScope].push(...violations);
    }
  }
  return { target, data: { violations: allViolations } };
}
function compare(actual, type, expected) {
  const ops = {
    "<": (a, b) => a < b,
    "<=": (a, b) => a <= b,
    ">": (a, b) => a > b,
    ">=": (a, b) => a >= b,
    "=": (a, b) => a === b,
    "==": (a, b) => a === b
  };
  const alias = {
    lessthan: "<",
    greaterthan: ">",
    lessthanequal: "<=",
    lessthanequalto: "<=",
    greaterthanequal: ">=",
    greaterthanequalto: ">=",
    equalto: "="
  };
  const key = String(type).toLowerCase().trim();
  const sym = ops[key] || ops[alias[key]];
  return sym ? sym(actual, expected) : true;
}
function formatMsg(scope, line, actual, target, type, val, ctx) {
  const label = scope === "document" ? "Document" : scope === "endoffile" ? "End of file" : scope === "line" ? `Line ${line}` : `Defined scope`;
  const comparison = {
    "<": "less than",
    "<=": "less than or equal to",
    ">": "greater than",
    ">=": "greater than or equal to",
    "=": "equal to"
  };
  const alias = {
    lessthan: "<",
    lessthanequal: "<=",
    lessthanequalto: "<=",
    greaterthan: ">",
    greaterthanequal: ">=",
    greaterthanequalto: ">=",
    equalto: "="
  };
  const op = comparison[alias[type] ?? type] ?? type;
  const isLength = !!ctx.lengths?.data?.[scope];
  const unit = isLength ? "characters" : target.endsWith("s") ? target : `${target}s`;
  return `${label} has ${actual} ${unit}; must be ${op} ${val}.`;
}
function pushErr2(ctx, msg) {
  ctx.diagnostics.push({ line: 1, severity: "error", message: msg });
}
var init_threshold = __esm({
  "packages/operators/threshold/index.js"() {
  }
});

// packages/operators/isPresent/index.js
var isPresent_exports = {};
__export(isPresent_exports, {
  run: () => run5
});
function run5(ctx, cfg = {}) {
  const target = cfg.target?.trim();
  const level = cfg.level ?? "warning";
  const scope = ctx.extracted?.scopes?.[0] ?? "document";
  if (!ctx.extracted) {
    ctx.diagnostics.push({
      line: 1,
      severity: "error",
      message: "isPresent operator needs a extract step first"
    });
    return ctx;
  }
  if (!target) {
    ctx.diagnostics.push({
      line: 1,
      severity: "error",
      message: 'isPresent operator missing "target" field name'
    });
    return ctx;
  }
  const data = ctx.extracted.data ?? {};
  const label = ctx.extracted.target ?? "node";
  const push = (line, msg) => ctx.diagnostics.push({ line, severity: level, message: msg });
  const hasField = (n) => {
    const val = n?.[target];
    return typeof val === "string" ? val.trim().length > 0 : !!val;
  };
  const getLine = (n) => n.line ?? n.position?.start?.line ?? 1;
  if (scope === "document" || scope === "endoffile") {
    for (const n of data[scope] ?? []) {
      if (!hasField(n)) push(getLine(n), `Missing "${target}" on ${label} node`);
    }
  } else if (scope === "paragraph") {
    for (const p of data.paragraph ?? []) {
      for (const n of p.matches ?? []) {
        if (!hasField(n)) push(getLine(n), `Missing "${target}" on ${label} node`);
      }
    }
  } else if (scope === "line") {
    for (const [ln, arr] of Object.entries(data.line ?? {})) {
      for (const n of arr) {
        if (!hasField(n)) push(+ln, `Missing "${target}" on ${label} node`);
      }
    }
  }
  return { target, scopes: [scope], data: {} };
}
var init_isPresent = __esm({
  "packages/operators/isPresent/index.js"() {
  }
});

// packages/operators/regexMatch/index.js
var regexMatch_exports = {};
__export(regexMatch_exports, {
  run: () => run6
});
function run6(ctx, cfg = {}) {
  if (!ctx.extracted) {
    ctx.diagnostics.push({
      line: 1,
      severity: "error",
      message: "regexMatch operator needs extract to run first"
    });
    return ctx;
  }
  console.log(ctx.extracted);
  const patterns = Array.isArray(cfg.patterns) ? cfg.patterns : cfg.pattern ? [cfg.pattern] : [];
  if (patterns.length === 0) {
    ctx.diagnostics.push({
      line: 1,
      severity: "error",
      message: 'regexMatch operator missing "patterns"'
    });
    return ctx;
  }
  const regexes = [];
  for (const p of patterns) {
    try {
      regexes.push(new RegExp(p, "i"));
    } catch (err) {
      ctx.diagnostics.push({
        line: 1,
        severity: "error",
        message: `Invalid regex "${p}": ${err.message}`
      });
    }
  }
  if (regexes.length === 0) return ctx;
  const strOf = (entry) => {
    if (typeof entry === "string") return entry;
    if (entry?.raw) return entry.raw;
    if (entry?.value) return entry.value;
    if (entry?.content) return entry.content;
    if (entry?.children?.length) {
      return entry.children.map((c) => c.value ?? "").join("");
    }
    return JSON.stringify(entry);
  };
  const { scopes = [], data } = ctx.extracted;
  let failures = 0;
  const test = (entry, line = 1) => {
    const txt = strOf(entry);
    if (!txt) return;
    const ok = regexes.some((r) => r.test(txt));
    if (!ok) {
      failures++;
      ctx.diagnostics.push({
        line,
        severity: "error",
        message: `"${txt}" does not match any of: ${patterns.join(" , ")}`
      });
    }
  };
  for (const scope of scopes) {
    const entries = data[scope];
    if (!entries) continue;
    if (scope === "document" || scope === "endoffile") {
      entries.forEach((e) => test(e, e.line ?? 1));
    } else if (scope === "paragraph") {
      entries.forEach((p) => p.matches.forEach((e) => test(e, e.line ?? p.line)));
    } else if (scope === "line") {
      Object.entries(entries).forEach(([ln, arr]) => arr.forEach((e) => test(e, Number(ln))));
    }
  }
  if (failures === 0) {
    ctx.diagnostics.push({
      line: 1,
      severity: "info",
      message: `All entries match /${patterns.join(" | ")}/`
    });
  }
  return { scopes, data: {} };
}
var init_regexMatch = __esm({
  "packages/operators/regexMatch/index.js"() {
  }
});

// packages/operators/sage/index.js
var sage_exports = {};
__export(sage_exports, {
  run: () => run7
});
import { toString as toString2 } from "mdast-util-to-string";
async function run7(ctx, cfg = {}) {
  if (!ctx.extracted) {
    ctx.diagnostics.push({
      line: 1,
      severity: "error",
      message: "sage operator needs a previous extract step"
    });
    return {};
  }
  const { target, scopes = ["document"], data } = ctx.extracted;
  if (target !== "heading") {
    ctx.diagnostics.push({
      line: 1,
      severity: "warning",
      message: "sage should be run after a heading extract"
    });
  }
  const slugify = (txt) => "#" + txt.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const result = {
    document: data.document.map((h) => ({
      line: h.line,
      slug: slugify(toString2(h))
    }))
  };
  ctx.slugs = { scopes: ["document"], data: result };
  return { scopes: ["document"], data: result };
}
var init_sage = __esm({
  "packages/operators/sage/index.js"() {
  }
});

// packages/operators/compare/index.js
var compare_exports = {};
__export(compare_exports, {
  run: () => run8
});
async function run8(ctx, cfg = {}) {
  const { baseline, against, level = "error" } = cfg;
  const steps = ctx.pipelineResults ?? [];
  if (!steps[baseline - 1] || !steps[against - 1]) {
    ctx.diagnostics.push({
      line: 1,
      severity: "error",
      message: "compare: invalid baseline / against index"
    });
    return {};
  }
  const A = steps[baseline - 1].data.data ?? steps[baseline - 1].data;
  const B = steps[against - 1].data.data ?? steps[against - 1].data;
  const scope = A.document && B.document ? "document" : Object.keys(A)[0] || "document";
  const aVal = A[scope] ?? [];
  const bVal = B[scope] ?? [];
  const keyOf = (x) => {
    if (typeof x === "string") return x.toLowerCase();
    if (x && typeof x === "object") {
      return (x.url || x.slug || x.content || JSON.stringify(x)).toLowerCase();
    }
    return String(x);
  };
  const setA = new Set(aVal.map(keyOf));
  const setB = new Set(bVal.map(keyOf));
  const missing = aVal.filter((x) => !setB.has(keyOf(x)));
  const extra = bVal.filter((x) => !setA.has(keyOf(x)));
  missing.forEach((item) => {
    const line = item && typeof item === "object" && item.line ? item.line : 1;
    const label = item.content ?? item.url ?? item.slug ?? JSON.stringify(item);
    ctx.diagnostics.push({
      line,
      severity: level,
      message: `Compare failed for: ${label}`
    });
  });
  extra.forEach((item) => {
    const line = item && typeof item === "object" && item.line ? item.line : 1;
    const label = item.content ?? item.url ?? item.slug ?? JSON.stringify(item);
    ctx.diagnostics.push({
      line,
      severity: level,
      message: `Compare found extra: ${label}`
    });
  });
  const summary = {
    [scope]: {
      missing: missing.map(pretty),
      extra: extra.map(pretty)
    }
  };
  return { scopes: [scope], data: summary };
  function pretty(x) {
    return typeof x === "string" ? x : x.content ?? x.url ?? x.slug ?? JSON.stringify(x);
  }
}
var init_compare = __esm({
  "packages/operators/compare/index.js"() {
  }
});

// packages/operators/length/index.js
var length_exports = {};
__export(length_exports, {
  run: () => run9
});
import { toString as toString3 } from "mdast-util-to-string";
function run9(ctx, cfg = {}) {
  if (!ctx.extracted) {
    ctx.diagnostics.push({
      line: 1,
      severity: "error",
      message: "length operator needs any other operator like extract to run first"
    });
    return ctx;
  }
  const { target, scopes, data } = ctx.extracted;
  const summary = { document: 0, endoffile: 0, line: {}, paragraph: [] };
  const textLength = (txt) => txt ? txt.length : 0;
  const calculators = {
    document: () => {
      summary.document = data.document?.map((n) => toString3(n)).reduce((acc, txt) => acc + textLength(txt), 0);
    },
    line: () => {
      for (const [lineNum, matches] of Object.entries(data.line ?? {})) {
        const total = matches.map((n) => toString3(n)).reduce((acc, txt) => acc + textLength(txt), 0);
        summary.line[lineNum] = total;
      }
    },
    paragraph: () => {
      for (const para of data.paragraph ?? []) {
        const total = para.matches.map((n) => toString3(n)).reduce((acc, txt) => acc + textLength(txt), 0);
        summary.paragraph.push({ line: para.line, length: total });
      }
    },
    endoffile: () => {
      summary.endoffile = data.endoffile?.map((n) => toString3(n)).reduce((acc, txt) => acc + textLength(txt), 0);
    }
  };
  for (const s of scopes) calculators[s]?.();
  ctx.lengths = { target, scopes, data: summary };
  ctx.counts ??= {};
  ctx.counts[target] = Object.fromEntries(
    Object.entries(summary).filter(([k]) => scopes.includes(k))
  );
  ctx.count = ctx.counts;
  ctx.previous = { target, scopes };
  return { target, scopes, data: summary };
}
var init_length = __esm({
  "packages/operators/length/index.js"() {
  }
});

// packages/operators/search/index.js
var search_exports = {};
__export(search_exports, {
  run: () => run10
});
function run10(ctx, cfg = {}) {
  const rawQuery = (cfg.query ?? "").trim();
  if (!rawQuery) {
    ctx.diagnostics.push({
      line: 1,
      severity: "error",
      message: 'search operator missing "query" string'
    });
    return ctx;
  }
  const queries = rawQuery.split(",").map((q) => q.trim()).filter((q) => q.length > 0);
  if (queries.length === 0) {
    ctx.diagnostics.push({
      line: 1,
      severity: "error",
      message: "no valid search terms found"
    });
    return ctx;
  }
  const scopeName = cfg.scope === "previousstepoutput" && ctx.extracted ? "previousstepoutput" : "document";
  const result = { [scopeName]: [] };
  const add = (line, text) => result[scopeName].push({ line, content: text.trim() });
  const matchesQuery = (text) => queries.some((q) => text.toLowerCase().includes(q.toLowerCase()));
  if (scopeName === "document") {
    (ctx.markdown ?? "").split("\n").forEach((l, i) => {
      if (matchesQuery(l)) add(i + 1, l);
    });
  } else {
    const prev = ctx.extracted.data ?? {};
    const walk = (node) => {
      if (!node) return;
      if (typeof node === "string") return;
      if (Array.isArray(node)) return node.forEach(walk);
      if (node.content && matchesQuery(node.content)) {
        add(node.line ?? node.position?.start?.line ?? 1, node.content);
        return;
      }
      const raw = node.value ?? node.raw ?? "";
      if (typeof raw === "string" && matchesQuery(raw)) {
        add(node.line ?? node.position?.start?.line ?? 1, raw);
      }
      if (node.matches) walk(node.matches);
      if (node.children) walk(node.children);
    };
    Object.values(prev).forEach(walk);
  }
  ctx.extracted = {
    target: queries.join(", "),
    scopes: [scopeName],
    data: result
  };
  return { query: queries, scopes: [scopeName], data: result };
}
var init_search = __esm({
  "packages/operators/search/index.js"() {
  }
});

// packages/operators/fixUsingLLM/index.js
var fixUsingLLM_exports = {};
__export(fixUsingLLM_exports, {
  run: () => run11
});
import yaml2 from "js-yaml";
async function run11(ctx, cfg = {}) {
  const {
    prompt = "",
    model = "llama-3.3-70b-versatile"
  } = cfg;
  if (!prompt.trim()) {
    ctx.diagnostics.push({
      line: 1,
      severity: "error",
      message: "fixUsingLLM: Prompt is required"
    });
    return ctx;
  }
  const ruleDefinition = {
    name: ctx.name || ctx.rule || "Unnamed Rule",
    description: ctx.description || "",
    pipeline: ctx.pipeline || []
  };
  const ruleYaml = yaml2.dump({
    rule: ruleDefinition.name,
    description: ruleDefinition.description,
    pipeline: ruleDefinition.pipeline
  });
  const operatorOutputs = (ctx.pipelineResults || []).map((step) => ({
    name: step.name,
    output: step.data
  }));
  const diagnosticText = (ctx.diagnostics || []).map((d) => `${d.severity.toUpperCase()} [${d.line}]: ${d.message}`).join("\n");
  const fullPrompt = `
  You are a Markdown linter. Your job is to fix ONLY the issues that violate the specific rule defined below.

  ## Rule Definition (YAML):
  ${ruleYaml}

  ## Operator-Specific Prompt:
  ${prompt}

  ## Diagnostics from Previous Steps:
  ${diagnosticText || "(none)"}

  ## Markdown Document:
  \`\`\`markdown
  ${ctx.markdown}
  \`\`\`

  ## Very Important Instructions:

  - ONLY fix issues that are directly and clearly covered by the rule above.
  - DO NOT make any changes based on grammar, tone, inclusivity, or clarity unless the rule *explicitly* calls for it.
  - DO NOT invent improvements or infer intent not stated in the rule.
  - If the Markdown content does NOT violate the rule, return the **original input exactly as is** \u2014 unchanged.
  - You MUST behave like a deterministic function: same input \u2192 same output.
  - If there is even slight ambiguity in whether something violates the rule, you MUST NOT change it.
  - DO NOT change headings, formatting, phrasing, or terms unless they clearly break the rule.
  - If the original Markdown ends with a blank line, your output must preserve that exact trailing newline.

  ## Output Format:

  - ONLY include the corrected (or unmodified) Markdown **below** the marker.
  - NEVER include explanations, comments, anything after markdown or wrap it in a code block.

  ---FIXED MARKDOWN BELOW---
  `;
  console.log("[fixUsingLLM] Prompt sent to LLM:\n", fullPrompt);
  const llmResult = await callGroqModel(model, fullPrompt);
  console.log("[fixUsingLLM] Raw LLM response:\n", llmResult);
  const marker = "---FIXED MARKDOWN BELOW---";
  let fixedText = ctx.markdown;
  const markerIndex = llmResult.indexOf(marker);
  if (markerIndex !== -1) {
    fixedText = llmResult.slice(markerIndex + marker.length);
  } else {
    ctx.diagnostics.push({
      line: 1,
      severity: "warning",
      message: "fixUsingLLM: Marker not found \u2014 falling back to raw LLM output."
    });
    ctx.rawLLMFallback = llmResult;
    fixedText = llmResult.replace(/```(markdown)?/g, "");
  }
  fixedText = stripCodeFence(fixedText);
  ctx.fixedMarkdown = fixedText;
  ctx.llmResponse = llmResult;
  if (fixedText.trim() !== ctx.markdown.trim()) {
    ctx.diagnostics.push({
      line: 1,
      severity: "error",
      message: "Lint failed \u2014 issues detected and corrected by the LLM."
    });
  } else {
    ctx.diagnostics.push({
      line: 1,
      severity: "info",
      message: "Lint successful! No issues found."
    });
  }
  return { prompt, model };
}
function stripCodeFence(text = "") {
  text = text.replace(/^\s*```(?:\w+)?\s*\n?/i, "");
  text = text.replace(/\n?```\s*$/i, "");
  return text;
}
async function callGroqModel(model, prompt) {
  try {
    const response = await fetch("https://lintme-backend.onrender.com/api/groq-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt })
    });
    console.log("Calling backend from render");
    const data = await response.json();
    return data.result || "No valid response.";
  } catch (error) {
    console.error("fixUsingLLM: Error calling Groq API", error);
    return "Error generating suggestions.";
  }
}
var init_fixUsingLLM = __esm({
  "packages/operators/fixUsingLLM/index.js"() {
  }
});

// packages/operators/detectHateSpeech/index.js
var detectHateSpeech_exports = {};
__export(detectHateSpeech_exports, {
  run: () => run12
});
async function run12(ctx, cfg = {}) {
  const markdown = ctx.markdown ?? "";
  if (!markdown.trim()) {
    ctx.diagnostics.push({
      line: 1,
      severity: "error",
      message: "No markdown input found for hate-speech detection"
    });
    return ctx;
  }
  const scope = cfg.scope === "previousstepoutput" && ctx.extracted ? "previousstepoutput" : "document";
  const file = await retext().use(retextEquality).use(retextProfanities).process(markdown);
  const lines = markdown.split("\n");
  const results = [];
  const seen = /* @__PURE__ */ new Set();
  const level = "warning";
  function findLineForWord(word) {
    const normalized = word.toLowerCase();
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(normalized)) {
        return i + 1;
      }
    }
    return 1;
  }
  for (const msg of file.messages) {
    const word = (msg.actual || msg.source || "unknown").toLowerCase();
    const suggestion = msg.expected?.[0] || msg.note || null;
    const line = msg?.position?.start?.line || findLineForWord(word);
    const key = `${line}-${word}`;
    if (seen.has(key)) continue;
    seen.add(key);
    ctx.diagnostics.push({
      line,
      severity: level,
      message: msg.message
    });
    results.push({
      line,
      word,
      message: msg.message,
      suggestion
    });
  }
  const data = { [scope]: results };
  ctx.extracted = {
    target: "hate_speech",
    scopes: [scope],
    data
  };
  return {
    target: "hate_speech",
    scopes: [scope],
    data
  };
}
var retext, retextEquality, retextProfanities;
var init_detectHateSpeech = __esm({
  async "packages/operators/detectHateSpeech/index.js"() {
    ({ retext } = await import("retext"));
    retextEquality = (await import("retext-equality")).default;
    retextProfanities = (await import("retext-profanities")).default;
  }
});

// packages/operators/fetchFromGithub/index.js
var fetchFromGithub_exports = {};
__export(fetchFromGithub_exports, {
  run: () => run13
});
import fetch2 from "node-fetch";
async function run13(ctx, cfg = {}) {
  const {
    repo = "",
    branch = "main",
    fileName = "README.md",
    fetchType = "content",
    apiBase = "https://lintme-backend.onrender.com"
    //apiBase   = "http://localhost:5000"
  } = cfg;
  const endpoint = `${apiBase}/api/github-file`;
  console.log("[fetchFromGithub] Calling:", endpoint);
  if (!repo) {
    ctx.diagnostics.push({
      line: 1,
      severity: "error",
      message: "fetchFromGithub: 'repo' is required."
    });
    return ctx;
  }
  try {
    const res = await fetch2(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repo, branch, fileName, fetchType })
    });
    if (!res.ok) {
      const text = await res.text();
      let message = `fetchFromGithub: backend returned ${res.status}`;
      try {
        const json = JSON.parse(text);
        if (json?.error) {
          message = `fetchFromGithub: ${json.error}`;
        }
      } catch (_) {
      }
      ctx.diagnostics.push({
        line: 1,
        severity: "error",
        message
      });
      return ctx;
    }
    const payload = await res.json();
    ctx.fetchResult = payload;
    const readmes = payload.readmes || [];
    if (!readmes.length) {
      ctx.diagnostics.push({
        line: 1,
        severity: "error",
        message: `No README.md files found in '${repo}'`
      });
      return ctx;
    }
    ctx.internalInfo = [];
    if (fetchType === "path") {
      for (const { path, url } of readmes) {
        ctx.internalInfo.push({
          line: 1,
          severity: "info",
          message: `README found: ${url}`
        });
      }
      ctx.debug = {
        foundPaths: readmes.map((r) => r.path),
        foundURLs: readmes.map((r) => r.url)
      };
      return {
        data: {
          paths: readmes.map((r) => r.path),
          urls: readmes.map((r) => r.url)
        }
      };
    }
    if (fetchType === "content") {
      ctx.markdown = "";
      for (const { path, content, url } of readmes) {
        ctx.markdown += `

## ${path}

${content}`;
        ctx.internalInfo.push({
          line: 1,
          severity: "info",
          message: `Loaded README: ${url}`
        });
      }
      ctx.debug = {
        readmeCount: readmes.length,
        combinedLength: ctx.markdown.length
      };
      return {
        data: {
          files: readmes.map((r) => ({
            path: r.path,
            url: r.url,
            content: r.content
          }))
        }
      };
    }
  } catch (err) {
    ctx.diagnostics.push({
      line: 1,
      severity: "error",
      message: `fetchFromGithub: ${err.message}`
    });
  }
  return ctx;
}
var init_fetchFromGithub = __esm({
  "packages/operators/fetchFromGithub/index.js"() {
  }
});

// packages/operators/readmeLocationCheck/index.js
var readmeLocationCheck_exports = {};
__export(readmeLocationCheck_exports, {
  run: () => run14
});
async function run14(ctx) {
  const readmes = ctx.fetchResult?.readmes || [];
  if (readmes.length === 0) {
    const msg = `No README.md files were found from the previous step. Make sure you ran 'fetchFromGithub' with fetchType: "path" first.`;
    ctx.diagnostics.push({ line: 1, severity: "error", message: msg });
    return {
      data: {
        success: false,
        violations: [{ line: 1, severity: "error", message: msg }]
      }
    };
  }
  const counts = { root: 0, folder: 0, nested: 0 };
  for (const { path } of readmes) {
    counts[classify(path)]++;
  }
  const violations = [];
  if (counts.root === 0) {
    violations.push({
      line: 1,
      severity: "warning",
      message: "Top level README.md is missing. Add one to the repository root for better discoverability."
    });
    ctx.diagnostics.push(...violations);
  }
  return {
    data: {
      success: violations.length === 0,
      violations,
      counts,
      paths: readmes.map((r) => r.path)
    }
  };
}
function classify(path) {
  const depth = path.split("/").length - 1;
  if (depth === 0) return "root";
  if (depth === 1) return "folder";
  return "nested";
}
var init_readmeLocationCheck = __esm({
  "packages/operators/readmeLocationCheck/index.js"() {
  }
});

// packages/operators/markdownRender/index.js
var markdownRender_exports = {};
__export(markdownRender_exports, {
  run: () => run15
});
async function run15(ctx, cfg = {}) {
  const {
    renderer = "marked",
    output = "html",
    apiBase = "http://localhost:5000"
  } = cfg;
  const markdown = ctx.markdown ?? "";
  if (!markdown.trim()) {
    ctx.diagnostics.push({
      line: 1,
      severity: "error",
      message: "markdownRender: No Markdown content to render."
    });
    return ctx;
  }
  const endpoint = `${apiBase}/api/markdown-render`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ markdown, renderer, output })
  });
  if (!res.ok) {
    ctx.diagnostics.push({
      line: 1,
      severity: "error",
      message: `markdownRender: Server error \u2014 ${res.status} ${res.statusText}`
    });
    return ctx;
  }
  const { result } = await res.json();
  if (!result) {
    ctx.diagnostics.push({
      line: 1,
      severity: "warning",
      message: "markdownRender: No output received from server."
    });
    return ctx;
  }
  if (output === "html" || output === "dom") {
    ctx.output = result;
  }
  ctx.markdownRender = { renderer, output, result };
  ctx.debug = { renderedLength: String(result).length };
  const scopes = ["document"];
  const data = {
    document: [
      {
        line: 1,
        content: output === "image" ? `[Click the link to view the rendered image](${result})` : result
      }
    ]
  };
  return { scopes, data };
}
var init_markdownRender = __esm({
  "packages/operators/markdownRender/index.js"() {
  }
});

// packages/pipeline-runner/utils/parseRules.js
import yaml from "js-yaml";
function parseRules(yamlText) {
  try {
    return yaml.load(yamlText);
  } catch {
    return { error: "Invalid YAML format. Check syntax." };
  }
}

// packages/pipeline-runner/operator-registry.js
var OPERATORS = {
  "generateAST": () => Promise.resolve().then(() => (init_generate_ast(), generate_ast_exports)).then((m) => m.run),
  "extract": () => Promise.resolve().then(() => (init_extract(), extract_exports)).then((m) => m.run),
  "count": () => Promise.resolve().then(() => (init_count(), count_exports)).then((m) => m.run),
  "threshold": () => Promise.resolve().then(() => (init_threshold(), threshold_exports)).then((m) => m.run),
  "isPresent": () => Promise.resolve().then(() => (init_isPresent(), isPresent_exports)).then((m) => m.run),
  "regexMatch": () => Promise.resolve().then(() => (init_regexMatch(), regexMatch_exports)).then((m) => m.run),
  "sage": () => Promise.resolve().then(() => (init_sage(), sage_exports)).then((m) => m.run),
  "compare": () => Promise.resolve().then(() => (init_compare(), compare_exports)).then((m) => m.run),
  "length": () => Promise.resolve().then(() => (init_length(), length_exports)).then((m) => m.run),
  "search": () => Promise.resolve().then(() => (init_search(), search_exports)).then((m) => m.run),
  "fixUsingLLM": () => Promise.resolve().then(() => (init_fixUsingLLM(), fixUsingLLM_exports)).then((m) => m.run),
  "detectHateSpeech": () => init_detectHateSpeech().then(() => detectHateSpeech_exports).then((m) => m.run),
  "fetchFromGithub": () => Promise.resolve().then(() => (init_fetchFromGithub(), fetchFromGithub_exports)).then((m) => m.run),
  "readmeLocationCheck": () => Promise.resolve().then(() => (init_readmeLocationCheck(), readmeLocationCheck_exports)).then((m) => m.run),
  "markdownRender": () => Promise.resolve().then(() => (init_markdownRender(), markdownRender_exports)).then((m) => m.run)
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
    const run16 = await loader();
    const opOutput = await run16(ctx, step);
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
    console.log("[runPipeline] pipeline input:");
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
export {
  handler
};
