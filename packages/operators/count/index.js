export function run(ctx, cfg = {}) {
  /* ── validate pre‑condition ─────────────────────────────────────────── */
  if (!ctx.filtered) {
    ctx.diagnostics.push({
      line: 1, severity: 'error',
      message: 'count operator needs filter to run first'
    });
    return ctx;
  }

  const { target, scopes, data } = ctx.filtered;
  const summary = { document: 0, endoffile: 0, line: {}, paragraph: [] };

  /* ── scope‑specific counters in a map ───────────────────────────────── */
  const counters = {
    document: () => { summary.document = data.document.length; },

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

    endoffile: () => { summary.endoffile = data.endoffile.length; }
  };

  /* ── execute only requested scopes ──────────────────────────────────── */
  for (const s of scopes) counters[s]?.();

  /* ── update ctx ─────────────────────────────────────────────────────── */
  ctx.counted = { target, scopes, data: summary };

  ctx.counts ??= {};
  ctx.counts[target] = Object.fromEntries(
    Object.entries(summary).filter(([k]) => scopes.includes(k))
  );

  return ctx;
}
