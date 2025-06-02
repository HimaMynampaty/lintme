export function run(ctx, cfg = {}) {
  let { target, conditions = {}, level = 'warning' } = cfg;

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
    pushErr(ctx, `No counts found for "${target}". Ensure a prior step (like 'count' or 'length') ran first.`);
    return ctx;
  }

  const adapters = {
    document: () => [{ line: 1, actual: counts.document ?? 0 }],
    endoffile: () => [{ line: 1, actual: counts.endoffile ?? 0 }],
    line: () => Object.entries(counts.line ?? {}).map(
      ([ln, c]) => ({ line: +ln, actual: c })
    ),
    paragraph: () => (counts.paragraph ?? []).map(p => ({
      line: p.line,
      actual: p.count ?? p.length ?? 0  
    }))
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
          message: formatMsg(scope, line, actual, target, type, value)
        });
      }
    }
  }

  return { target, data: {} };
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
