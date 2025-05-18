export function run(ctx, cfg = {}) {
  const filtered = ctx.filtered;
  if (!filtered) {
    ctx.diagnostics.push({
      line: 1,
      severity: 'error',
      message: 'count operator needs filter to run first'
    });
    return ctx;
  }

  const { target, scopes, data } = filtered;
  const summary = { document: 0, endoffile: 0, line: {}, paragraph: [] };

  if (scopes.includes('document')) {
    summary.document = data.document.length;
  }

  if (scopes.includes('paragraph')) {
    summary.paragraph = data.paragraph.map(p => ({
      line: p.line,
      count: p.matches.length
    }));
  }

  if (scopes.includes('line')) {
    const totalLines = (ctx.markdown ?? '').split('\n').length;
    for (let ln = 1; ln <= totalLines; ln++) {
      const n = (data.line[ln]?.length) ?? 0;
      summary.line[ln] = n;
    }
  }

  if (scopes.includes('endoffile')) {
    summary.endoffile = data.endoffile.length;
  }

  ctx.counted = {
    target,
    scopes,
    data: summary
  };

  ctx.counts ??= {};
  ctx.counts[target] = Object.fromEntries(
    Object.entries(summary).filter(([k]) => scopes.includes(k))
  );

  return ctx;
}
