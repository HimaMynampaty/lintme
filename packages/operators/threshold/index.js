export function run(ctx, cfg = {}) {
  /* ── locate target ──────────────────────────────────────── */
  let { target, conditions = {}, level = 'warning' } = cfg;

  // If YAML omitted target, try to inherit the ONLY one we have in ctx.counts
  if (!target && ctx.counts) {
    const keys = Object.keys(ctx.counts);
    if (keys.length === 1) target = keys[0];
  }

  if (!target) {
    pushErr(ctx, 'threshold operator missing "target"');
    return ctx;
  }

  const counts = ctx.counts?.[target];
  if (!counts) {
    pushErr(ctx, `No counts for "${target}". Run 'count' first.`);
    return ctx;
  }

  /* ── adapters + evaluation (unchanged) ─────────────────── */
  const adapters = {
    document : () => [{ line: 1, actual: counts.document  ?? 0 }],
    endoffile: () => [{ line: 1, actual: counts.endoffile ?? 0 }],
    line     : () => Object.entries(counts.line ?? {}).map(
                      ([ln, c]) => ({ line: +ln, actual: c }) ),
    paragraph: () => (counts.paragraph ?? [])
                      .map(p => ({ line: p.line, actual: p.count }))
  };

  for (const [scope, rule] of Object.entries(conditions)) {
    const rows = adapters[scope]?.() ?? [];
    const { type, value } = rule;
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


function compare(actual, type, expected) {
  const ops = {
    '<'  : (a,b) => a <  b,
    '<=' : (a,b) => a <= b,
    '>'  : (a,b) => a >  b,
    '>=' : (a,b) => a >= b,
    '='  : (a,b) => a === b,
    '==' : (a,b) => a === b         
  };

  const alias = {
    lessthan              : '<',
    greaterthan           : '>',
    lessthanequal         : '<=',
    lessthanequalto       : '<=',   
    greaterthanequal      : '>=',
    greaterthanequalto    : '>=',   
    equal                 : '=',
    equalto               : '='
  };

  const key = String(type).toLowerCase().trim();
  const sym = ops[key]            
           || ops[alias[key]];   

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
