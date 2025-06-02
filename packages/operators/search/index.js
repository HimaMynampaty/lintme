// operators/search/index.js
export function run(ctx, cfg = {}) {
  const query = (cfg.query ?? '').trim();
  if (!query) {
    ctx.diagnostics.push({
      line: 1, severity: 'error',
      message: 'search operator missing "query" string'
    });
    return ctx;
  }

  const result = { document: [] };
  const add = (line, text) =>
    result.document.push({ line, content: text.trim() });

  if (!ctx.filtered) {
    (ctx.markdown ?? '')
      .split('\n')
      .forEach((txt, i) => txt.includes(query) && add(i + 1, txt));
    ctx.filtered = { target: query, scopes: ['document'], data: result };
    return { query, scopes: ['document'], data: result };
  }

  const prev = ctx.filtered.data ?? {};

  const walk = node => {
    if (!node) return;
    if (typeof node === 'string') return;                 
    if (Array.isArray(node)) return node.forEach(walk);

    if (node.content) {
      if (node.content.includes(query)) {
        const line = node.line ?? node.position?.start?.line ?? 1;
        add(line, node.content);
      }
      return;                                         
    }

    const text = node.value ?? node.raw ?? '';
    if (typeof text === 'string' && text.includes(query)) {
      const line = node.line ?? node.position?.start?.line ?? 1;
      add(line, text);
    }

    if (node.matches) walk(node.matches);
    if (node.children) walk(node.children);
  };

  Object.values(prev).forEach(walk);

  ctx.filtered = { target: query, scopes: ['document'], data: result };
  return { query, scopes: ['document'], data: result };
}
