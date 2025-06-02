export function run(ctx, cfg = {}) {
  if (!ctx.filtered) {
    ctx.diagnostics.push({
      line: 1,
      severity: 'error',
      message: 'count operator needs any other operator like filter or search to run first'
    });
    return ctx;
  }

  const { target, scopes, data } = ctx.filtered;
  const summary = { document: 0, endoffile: 0, line: {}, paragraph: [] };

  const counters = {
    document: () => {
      summary.document = data.document.length;
    },

    paragraph: () => {
      summary.paragraph = data.paragraph.map(p => ({
        line: p.line,
        count: p.matches.length
      }));
    },

    line: () => {
      const lines = (ctx.markdown ?? '').split('\n');
      lines.forEach((_, i) => {
        const ln = i + 1;
        summary.line[ln] = (data.line[ln]?.length) ?? 0;
      });
    },

    endoffile: () => {
      summary.endoffile = data.endoffile.length;
    }
  };

  for (const s of scopes) counters[s]?.();

  ctx.counted = { target, scopes, data: summary };

  // ✅ FIX: write under ctx.count (not ctx.counts)
  ctx.count ??= {};
  ctx.count[target] = Object.fromEntries(
    Object.entries(summary).filter(([k]) => scopes.includes(k))
  );

  return { target, scopes, data: summary };
}
