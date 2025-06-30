export function run(ctx, cfg = {}) {
  const rawQuery = (cfg.query ?? '').trim();
  if (!rawQuery) {
    ctx.diagnostics.push({
      line: 1,
      severity: 'error',
      message: 'search operator missing "query" string'
    });
    return ctx;
  }

  const queries = rawQuery
    .split(',')
    .map(q => q.trim())
    .filter(q => q.length > 0);

  if (queries.length === 0) {
    ctx.diagnostics.push({
      line: 1,
      severity: 'error',
      message: 'no valid search terms found'
    });
    return ctx;
  }

  const scopeName =
    cfg.scope === 'previousstepoutput' && ctx.extracted
      ? 'previousstepoutput'
      : 'document';

  const result = { [scopeName]: [] };
  const add = (line, text) =>
    result[scopeName].push({ line, content: text.trim() });

  const matchesQuery = text =>
    queries.some(q => text.includes(q));

  if (scopeName === 'document') {
    (ctx.markdown ?? '').split('\n').forEach((l, i) => {
      if (matchesQuery(l)) add(i + 1, l);
    });
  } else {
    const prev = ctx.extracted.data ?? {};

    const walk = node => {
      if (!node) return;
      if (typeof node === 'string') return;
      if (Array.isArray(node)) return node.forEach(walk);

      if (node.content && matchesQuery(node.content)) {
        add(node.line ?? node.position?.start?.line ?? 1, node.content);
        return;
      }

      const raw = node.value ?? node.raw ?? '';
      if (typeof raw === 'string' && matchesQuery(raw)) {
        add(node.line ?? node.position?.start?.line ?? 1, raw);
      }

      if (node.matches) walk(node.matches);
      if (node.children) walk(node.children);
    };

    Object.values(prev).forEach(walk);
  }

  ctx.extracted = {
    target : queries.join(', '),
    scopes : [scopeName],
    data   : result
  };
  return { query: queries, scopes: [scopeName], data: result };
}
