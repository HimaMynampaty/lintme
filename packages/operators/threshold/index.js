export function run(ctx, cfg = {}) {
  let {
    target,
    conditions = {},
    level = 'warning',
    label,
    enforceOnEmpty = false,
    silenceOnPass = {
      severities: ['warning'],
      codes: ['extract/no-nodes'], 
      patterns: []               
    }
  } = cfg;

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

  if (!target) {
    pushErr(ctx, 'threshold operator missing "target"');
    return ctx;
  }

  const friendlyLabel =
    (typeof label === 'string' && label.trim()) ||
    ctx.metricLabel ||
    ctx.previous?.target ||
    target ||
    'matches';

  const counts = ctx.count?.[target];
  if (!counts) {
    pushErr(ctx, `No counts found for "${target}". Ensure a prior step (like 'count' or 'length') ran first.`);
    return ctx;
  }

  const prevScopes = ctx.previous?.scopes ?? [];

  const adapters = {
    document: () => (counts.document == null ? [] : [{ line: 1, actual: counts.document }]),
    endoffile: () => (counts.endoffile == null ? [] : [{ line: 1, actual: counts.endoffile }]),
    previousstepoutput: () => (counts.previousstepoutput == null ? [] : [{ line: 1, actual: counts.previousstepoutput }]),
    line: () => {
      const m = counts.line ?? {};
      const entries = Object.entries(m);
      return entries.length ? entries.map(([ln, c]) => ({ line: +ln, actual: c })) : [];
    },
    paragraph: () => {
      const arr = counts.paragraph ?? [];
      return arr.length ? arr.map(p => ({ line: p.line, actual: p.count ?? p.length ?? 0 })) : [];
    }
  };

  const exampleSources = {
    document:
      ctx.extracted?.data?.document ??
      ctx.fetchResult?.data?.document ??
      ctx.fetchResult?.document ??
      [],
    previousstepoutput:
      ctx.extracted?.data?.previousstepoutput ??
      ctx.fetchResult?.data?.previousstepoutput ??
      ctx.fetchResult?.previousstepoutput ??
      [],
    line: flattenLineMap(ctx.extracted?.data?.line ?? counts.line ?? {}),
    paragraph: ctx.extracted?.data?.paragraph ?? counts.paragraph ?? []
  };

  const allViolations = {};

  for (const [scopeKey, rule] of Object.entries(conditions)) {
    if (!rule || rule.value == null) continue;

    let effectiveScope = scopeKey;
    let rows = adapters[effectiveScope]?.() ?? [];

    const allZero = rows.every(r => (r.actual ?? 0) === 0);
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

    if (rows.length === 0) {
      if (!enforceOnEmpty) continue;
    }

    const { type, value } = normalizeRule(rule);

    const violations = [];
    for (const { line, actual } of rows) {
      if (!compareOp(actual, type, value)) {
        const message = buildMessage({
          scope: effectiveScope,
          line,
          actual,
          type,
          expected: value,
          noun: friendlyLabel,
          examples: pickExamples(exampleSources, effectiveScope)
        });

        ctx.diagnostics.push({ line, severity: level, message });
        violations.push({ line, actual, scope: effectiveScope, expected: { type, value }, message });
      }
    }

    if (violations.length) {
      allViolations[effectiveScope] ??= [];
      allViolations[effectiveScope].push(...violations);
    }
  }

  const hasViolations = Object.values(allViolations).some(v => Array.isArray(v) && v.length > 0);
  if (!hasViolations && Array.isArray(ctx.diagnostics) && silenceOnPass) {
    const severities = (silenceOnPass.severities || ['warning']).map(s => String(s).toLowerCase());
    const codeSet = Array.isArray(silenceOnPass.codes) ? new Set(silenceOnPass.codes) : null;
    const regexes = (silenceOnPass.patterns || [])
      .map(p => { try { return new RegExp(p, 'i'); } catch { return null; } })
      .filter(Boolean);

    ctx.diagnostics = ctx.diagnostics.filter(d => {
      const sevMatch = severities.includes(String(d.severity || '').toLowerCase());
      const codeMatch = codeSet ? codeSet.has(d.code) : false;
      const patMatch = regexes.length ? regexes.some(rx => rx.test(String(d.message || ''))) : false;
      return !(sevMatch && (codeMatch || patMatch));
    });
  }

  return { target, data: { violations: allViolations } };
}

function normalizeRule(rule) {
  const alias = {
    lessthan: '<',
    lessthanequal: '<=',
    lessthanequalto: '<=',
    greaterthan: '>',
    greaterthanequal: '>=',
    greaterthanequalto: '>=',
    equalto: '=',
    eq: '='
  };
  const t = String(rule.type ?? '').toLowerCase().trim();
  const type = alias[t] || rule.type || '>';
  const value = Number(rule.value ?? 0);
  return { type, value };
}

function compareOp(actual, type, expected) {
  switch (type) {
    case '<':  return actual <  expected;
    case '<=': return actual <= expected;
    case '>':  return actual >  expected;
    case '>=': return actual >= expected;
    case '=':
    case '==': return actual === expected;
    default:   return true;
  }
}

function buildMessage({ actual, type, expected, noun, examples }) {
  const want =
    type === '>=' ? `at least ${expected}` :
    type === '>'  ? `more than ${expected}` :
    type === '<=' ? `at most ${expected}` :
    type === '<'  ? `fewer than ${expected}` :
    (type === '=' || type === '==') ? `exactly ${expected}` :
    `${type} ${expected}`;

  const base = `Expected ${want} ${pluralize(noun, expected)}; found ${actual}.`;

  const ex = Array.isArray(examples) && examples.length
    ? ` Examples: ${examples.slice(0, 3).map(formatExample).join(' · ')}`
    : '';

  return base + ex;
}


function pickExamples(sources, scope) {
  const fromScope = arrayLike(sources[scope]) ? sources[scope] : null;
  const pool = fromScope && fromScope.length ? fromScope : (arrayLike(sources.document) ? sources.document : []);
  return pool.slice(0, 3);
}

function formatExample(e) {
  const ln = e?.line != null ? `L${e.line}: ` : '';
  const txt = (e?.content ?? e?.value ?? '').toString().trim().replace(/\s+/g, ' ');
  return (ln + txt).slice(0, 120);
}

function pluralize(noun, n) {
  if (!noun) return 'items';
  if (n === 1) return noun.replace(/s$/, '');
  return /s$/.test(noun) ? noun : `${noun}s`;
}

function flattenLineMap(lineMap) {
  const out = [];
  for (const [ln, arr] of Object.entries(lineMap || {})) {
    if (Array.isArray(arr)) {
      for (const item of arr) {
        out.push({ line: Number(ln), content: item?.content ?? '' });
      }
    }
  }
  return out;
}

function arrayLike(x) {
  return Array.isArray(x);
}

function pushErr(ctx, msg) {
  ctx.diagnostics.push({ line: 1, severity: 'error', message: msg });
}
