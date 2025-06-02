export function run(ctx, cfg = {}) {
  const query = (cfg.query ?? '').trim();
  if (!query) {
    ctx.diagnostics.push({
      line: 1,
      severity: 'error',
      message: 'search operator missing "query" string'
    });
    return ctx;
  }

  const scopeName =
    cfg.scope === 'previousstepoutput' && ctx.filtered
      ? 'previousstepoutput'
      : 'document';

  const result = { [scopeName]: [] };
  const add = (line, text) =>
    result[scopeName].push({ line, content: text.trim() });

  if (scopeName === 'document') {
    (ctx.markdown ?? '').split('\n').forEach((l, i) => {
      if (l.includes(query)) add(i + 1, l);
    });

  } else {
    const prev = ctx.filtered.data ?? {};

    const walk = node => {
      if (!node) return;
      if (typeof node === 'string') return;
      if (Array.isArray(node)) return node.forEach(walk);

      if (node.content && node.content.includes(query)) {
        add(node.line ?? node.position?.start?.line ?? 1, node.content);
        return;                        
      }

      const raw = node.value ?? node.raw ?? '';
      if (typeof raw === 'string' && raw.includes(query)) {
        add(node.line ?? node.position?.start?.line ?? 1, raw);
      }

      if (node.matches) walk(node.matches);
      if (node.children) walk(node.children);
    };

    Object.values(prev).forEach(walk);
  }

  ctx.filtered = {
    target : query,            
    scopes : [scopeName],
    data   : result
  };
  return { query, scopes: [scopeName], data: result };
}
