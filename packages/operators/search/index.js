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
    .filter(Boolean);

  if (queries.length === 0) {
    ctx.diagnostics.push({
      line: 1,
      severity: 'error',
      message: 'no valid search terms found'
    });
    return ctx;
  }

  const scopeName =
    cfg.scope === 'previousstepoutput' ? 'previousstepoutput' : 'document';

  const result = { [scopeName]: [] };
  const add = (line, content) =>
    result[scopeName].push({ line, content: content.trim() });

  const matches = text =>
    queries.some(q => text.toLowerCase().includes(q.toLowerCase()));

  if (scopeName === 'document') {
    (ctx.markdown ?? '').split('\n').forEach((line, i) => {
      if (matches(line)) add(i + 1, line);
    });
  } else {
    const previous =
      ctx.extracted?.data ??
      ctx.fetchResult?.data ??
      ctx.fetchResult ??
      ctx.extracted ??
      {};

    const walk = (node, lineHint = 1) => {
      if (node == null) return;

      if (['string', 'number', 'boolean'].includes(typeof node)) {
        const str = String(node);
        if (matches(str)) add(lineHint, str);
        return;
      }

      if (Array.isArray(node)) {
        node.forEach((v, idx) => walk(v, idx + 1));
        return;
      }

      if (typeof node === 'object') {
        for (const [k, v] of Object.entries(node)) {
          if (matches(k)) add(lineHint, k);

          if (typeof v === 'string' && matches(v)) {
            add(lineHint, `${k}: ${v}`);
          } else {
            walk(v, lineHint);
          }
        }
      }
    };

    walk(previous);

    if (result[scopeName].length === 0) {
      const asJson = JSON.stringify(previous);
      if (matches(asJson)) add(1, asJson);
    }
  }

  ctx.extracted = {
    target : queries.join(', '),
    scopes : [scopeName],
    data   : result
  };

  return { query: queries, scopes: [scopeName], data: result };
}
