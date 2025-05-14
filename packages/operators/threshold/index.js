/* -----------------------------------------------------------
 *  threshold operator
 *  – one pass, no copy‑pasted loops
 * ---------------------------------------------------------- */
export function run(ctx, cfg = {}) {
  const { conditions = {}, target, level = 'warning' } = cfg;

  /* ---------- early guards ---------- */
  if (!target) {
    pushErr(ctx, 'threshold operator missing "target"');          return ctx;
  }
  const counts = ctx.counts?.[target];
  if (!counts) {
    pushErr(ctx, `No counts for "${target}". Run 'count' first.`); return ctx;
  }

  /* ---------- per‑scope adapters ---------- */
  const adapters = {
    document : () => [{ line: 1, actual: counts.document ?? 0 }],
    endoffile: () => [{ line: 1, actual: counts.endoffile ?? 0 }],
    line     : () => Object.entries(counts.line ?? {}).map(
                     ([ln, c]) => ({ line: Number(ln), actual: c })),
    paragraph: () => (counts.paragraph ?? [])
                     .map(p => ({ line: p.line, actual: p.count }))
  };

  /* ---------- apply thresholds ---------- */
  for (const [scope, cfg] of Object.entries(conditions)) {
    const rows = adapters[scope]?.() ?? [];
    const { type, value } = cfg;
    if (value == null) continue;

    for (const { line, actual } of rows) {
      if (!compare(actual, type, value)) {
        ctx.diagnostics.push({
          line,
          severity: level,
          message : formatMsg(scope, line, actual, target, type, value)
        });
      }
    }
  }
  return ctx;
}

/* -----------------------------------------------------------
 * helpers
 * ---------------------------------------------------------- */
function compare(actual, type, expected) {
  const ops = {
    '<'  : (a,b) => a <  b,
    '<=' : (a,b) => a <= b,
    '>'  : (a,b) => a >  b,
    '>=' : (a,b) => a >= b,
    '='  : (a,b) => a === b,
    '==' : (a,b) => a === b          // explicit so no alias lookup needed
  };

  // alias map → canonical symbol
  const alias = {
    lessthan              : '<',
    greaterthan           : '>',
    lessthanequal         : '<=',
    lessthanequalto       : '<=',   // <-- your earlier value
    greaterthanequal      : '>=',
    greaterthanequalto    : '>=',   // <-- your earlier value
    equal                 : '=',
    equalto               : '='
  };

  const key = String(type).toLowerCase().trim();
  const sym = ops[key]            // direct hit
           || ops[alias[key]];    // alias hit

  // if still missing, treat as “pass” so linter doesn’t crash
  return sym ? sym(actual, expected) : true;
}

function formatMsg(scope, line, n, tgt, type, val) {
  const where = scope === 'document' ? 'Document'
            : scope === 'endoffile' ? 'End of file'
            : scope === 'line'      ? `Line ${line}`
            :                        `Paragraph at line ${line}`;
  return `${where} has ${n} × "${tgt}" → threshold (${type} ${val}) violated`;
}

function pushErr(ctx, msg) {
  ctx.diagnostics.push({ line: 1, severity: 'error', message: msg });
}
