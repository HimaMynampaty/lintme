export function run(ctx, cfg = {}) {
  const target = cfg.target?.trim();          
  const level  = cfg.level ?? 'warning';
  const scope  = ctx.filtered?.scopes?.[0] ?? 'document';

  if (!ctx.filtered) {
    ctx.diagnostics.push({
      line: 1,
      severity: 'error',
      message: 'isPresent operator needs a filter step first'
    });
    return ctx;
  }

  if (!target) {
    ctx.diagnostics.push({
      line: 1,
      severity: 'error',
      message: 'isPresent operator missing "target" field name'
    });
    return ctx;
  }

  const data = ctx.filtered.data ?? {};
  const label = ctx.filtered.target ?? 'node';

  const push = (line, msg) =>
    ctx.diagnostics.push({ line, severity: level, message: msg });

  const hasField = n => {
    const val = n?.[target];
    return typeof val === 'string' ? val.trim().length > 0 : !!val;
  };

  const getLine = n =>
    n.line ?? n.position?.start?.line ?? 1;

  if (scope === 'document' || scope === 'endoffile') {
    for (const n of data[scope] ?? []) {
      if (!hasField(n)) push(getLine(n), `Missing "${target}" on ${label} node`);
    }
  }

  else if (scope === 'paragraph') {
    for (const p of data.paragraph ?? []) {
      for (const n of p.matches ?? []) {
        if (!hasField(n)) push(getLine(n), `Missing "${target}" on ${label} node`);
      }
    }
  }

  else if (scope === 'line') {
    for (const [ln, arr] of Object.entries(data.line ?? {})) {
      for (const n of arr) {
        if (!hasField(n)) push(+ln, `Missing "${target}" on ${label} node`);
      }
    }
  }

  return { target, scopes: [scope], data: {} };
}
