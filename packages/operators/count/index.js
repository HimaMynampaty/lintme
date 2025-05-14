/**
 * Count operator – consumes ctx.filtered (from filter) and
 *   1. emits diagnostics
 *   2. stores a summary in ctx.counts[target] for threshold
 */
export function run(ctx, cfg = {}) {
  const filtered = ctx.filtered;
  if (!filtered) {
    ctx.diagnostics.push({ line: 1, severity: 'error',
      message: 'count operator needs filter to run first' });
    return ctx;
  }

  const { target, scopes, data } = filtered;
  const level = cfg.level ?? 'info';

  /* ---------- roll‑up object ---------- */
  const summary = { document: 0, endoffile: 0, line: {}, paragraph: [] };

  /* ---------- helpers ---------- */
  const push = (ln, n, label) =>
    ctx.diagnostics.push({ line: ln, severity: level,
      message: `${label} contains ${n} × "${target}"` });

  /* ---------- document scope ---------- */
  if (scopes.includes('document')) {
    summary.document = data.document.length;
    push(1, summary.document, 'Document');
  }

  /* ---------- paragraph scope ---------- */
  if (scopes.includes('paragraph')) {
    summary.paragraph = data.paragraph.map(p => {
      const n = p.matches.length;
      push(p.line, n, `Paragraph at line ${p.line}`);
      return { line: p.line, count: n };
    });
  }

  /* ---------- line scope (full table, incl. zeros) ---------- */
  if (scopes.includes('line')) {
    const totalLines = (ctx.markdown ?? '').split('\n').length;

    for (let ln = 1; ln <= totalLines; ln++) {
      const n = (data.line[ln]?.length) ?? 0;
      summary.line[ln] = n;
      push(ln, n, `Line ${ln}`);
    }
  }

  /* ---------- end‑of‑file scope ---------- */
  if (scopes.includes('endoffile')) {
    summary.endoffile = data.endoffile.length;
    push(1, summary.endoffile, 'End of file');
  }

  /* ---------- stash for threshold ---------- */
  ctx.counts ??= {};
  ctx.counts[target] = Object.fromEntries(
    Object.entries(summary).filter(([k]) => scopes.includes(k))
  );

  return ctx;
}
