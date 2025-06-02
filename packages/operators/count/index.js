export function run(ctx, cfg = {}) {
  if (!ctx.filtered) {
    ctx.diagnostics.push({
      line: 1, severity: 'error',
      message: 'count operator needs a previous step (filter/search/etc.)'
    });
    return ctx;
  }

  const { target, scopes, data } = ctx.filtered;
  const summary = {};                 

  for (const s of scopes) {
    if (s === 'line') {
      const totalPerLine = {};
      (ctx.markdown ?? '').split('\n').forEach((_, i) => {
        const ln = i + 1;
        totalPerLine[ln] = (data.line?.[ln]?.length) ?? 0;
      });
      summary.line = totalPerLine;
    } else if (s === 'paragraph') {
      summary.paragraph = (data.paragraph ?? []).map(p => ({
        line : p.line,
        count: p.matches.length
      }));
    } else {
      summary[s] = Array.isArray(data[s]) ? data[s].length : 0;
    }
  }

  ctx.counted = { target, scopes, data: summary };

  ctx.count ??= {};
  ctx.count[target] = summary;   

  return { target, scopes, data: summary };
}
