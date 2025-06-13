export function run(ctx, cfg = {}) {
  let { target, conditions = {}, level = 'warning' } = cfg;
  const allViolations = {}; 
  if (!target && ctx.previous) {
    target = ctx.previous.target;
  }

  if (!target) {
    pushErr(ctx, 'threshold operator missing "target"');
    return ctx;
  }

  const counts = ctx.count?.[target];
  if (!counts) {
    pushErr(
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
    paragraph: () => (counts.paragraph ?? []).map(p => ({
      line: p.line,
      actual: p.count ?? p.length ?? 0
    }))
  };

  for (const [scope, rule] of Object.entries(conditions)) {
    const rows = adapters[scope]?.() ?? [];
    const { type, value } = rule;
    if (value == null) continue;
    const violations = [];
    for (const { line, actual } of rows) {
      if (!compare(actual, type, value)) {
        const message = formatMsg(scope, line, actual, target, type, value, ctx);
        ctx.diagnostics.push({ line, severity: level, message });
        violations.push({
          line,
          actual,
          scope,
          expected: { type, value },
          message
        });
      }
    }
    if (violations.length) {
      allViolations[scope] ??= [];
      allViolations[scope].push(...violations);
    }
  }

  return { target, data: { violations: allViolations } };
}

function compare(actual, type, expected) {
  const ops = {
    '<': (a, b) => a < b,
    '<=': (a, b) => a <= b,
    '>': (a, b) => a > b,
    '>=': (a, b) => a >= b,
    '=': (a, b) => a === b,
    '==': (a, b) => a === b
  };

  const alias = {
    lessthan: '<',
    greaterthan: '>',
    lessthanequal: '<=',
    lessthanequalto: '<=',
    greaterthanequal: '>=',
    greaterthanequalto: '>=',
    equal: '=',
    equalto: '='
  };

  const key = String(type).toLowerCase().trim();
  const sym = ops[key] || ops[alias[key]];
  return sym ? sym(actual, expected) : true;
}

function formatMsg(scope, line, actual, target, type, val, ctx) {
  const label =
    scope === 'document' ? 'Document' :
    scope === 'endoffile' ? 'End of file' :
    scope === 'line' ? `Line ${line}` :
    `Paragraph starting on line ${line}`;

  const comparison = {
    '<': 'less than',
    '<=': 'less than or equal to',
    '>': 'greater than',
    '>=': 'greater than or equal to',
    '=': 'equal to',
    '==': 'equal to'
  };

  const alias = {
    lessthan: '<',
    lessthanequal: '<=',
    lessthanequalto: '<=',
    greaterthan: '>',
    greaterthanequal: '>=',
    greaterthanequalto: '>=',
    equal: '=',
    equalto: '='
  };

  const op = comparison[alias[type] ?? type] ?? type;

  const isLength = !!(ctx.lengths?.data?.[scope]);

  const unit = isLength ? 'characters' : (target.endsWith('s') ? target : `${target}s`);

  return `${label} has ${actual} ${unit}; must be ${op} ${val}.`;
}

function pushErr(ctx, msg) {
  ctx.diagnostics.push({ line: 1, severity: 'error', message: msg });
}
