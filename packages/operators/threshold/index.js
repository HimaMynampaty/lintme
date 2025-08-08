export function run(ctx, cfg = {}) {
  let { target, conditions = {}, level = 'warning', label } = cfg;

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
    pushErr(
      ctx,
      `No counts found for "${target}". Ensure a prior step (like 'count' or 'length') ran first.`
    );
    return ctx;
  }

  const prevScopes = ctx.previous?.scopes ?? [];

  const adapters = {
    document: () => [{ line: 1, actual: counts.document ?? 0 }],
    endoffile: () => [{ line: 1, actual: counts.endoffile ?? 0 }],
    previousstepoutput: () => [{ line: 1, actual: counts.previousstepoutput ?? 0 }],
    line: () => Object.entries(counts.line ?? {}).map(([ln, c]) => ({ line: +ln, actual: c })),
    paragraph: () => (counts.paragraph ?? []).map(p => ({ line: p.line, actual: p.count ?? p.length ?? 0 }))
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

function buildMessage({ scope, line, actual, type, expected, noun, examples }) {
  const where =
    scope === 'document'     ? 'Document' :
    scope === 'endoffile'    ? 'End of file' :
    scope === 'line'         ? `Line ${line}` :
    scope === 'paragraph'    ? `Paragraph starting at line ${line ?? 1}` :
                               'Defined scope';

  const opText = {
    '<':  'fewer than',
    '<=': 'at most',
    '>':  'more than',
    '>=': `${expected}+`,
    '=':  'exactly'
  }[type] || `(${type})`;

  const expect =
    type === '>='
      ? `${expected}+ ${pluralize(noun, expected)} expected`
      : `Expected ${opText} ${expected} ${pluralize(noun, expected)}`;

  const prefix = `${expect}; found ${actual}.`;

  const ex = Array.isArray(examples) && examples.length
    ? ` Examples: ${examples.slice(0,3).map(formatExample).join(' · ')}`
    : '';

  return `${where} — ${prefix}${ex}`;
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
