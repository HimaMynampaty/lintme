export async function run(ctx, cfg = {}) {
  const { baseline, against, level = 'error' } = cfg;

  const steps = ctx.pipelineResults ?? [];
  if (!steps[baseline - 1] || !steps[against - 1]) {
    ctx.diagnostics.push({
      line: 1,
      severity: 'error',
      message: 'compare: invalid baseline / against index'
    });
    return {};
  }

  const A = steps[baseline - 1].data.data ?? steps[baseline - 1].data;
  const B = steps[against  - 1].data.data ?? steps[against  - 1].data;

  const scope =
    (A.document && B.document) ? 'document'
    : Object.keys(A)[0]        || 'document';

  const aVal = A[scope] ?? [];
  const bVal = B[scope] ?? [];

  const keyOf = (x) => {
    if (typeof x === 'string') return x.toLowerCase();
    if (x && typeof x === 'object') {
      return (
        x.url     ||
        x.slug    ||
        x.content ||
        JSON.stringify(x)
      ).toLowerCase();
    }
    return String(x);
  };

  const setA = new Set(aVal.map(keyOf));
  const setB = new Set(bVal.map(keyOf));

  const missing = aVal.filter(x => !setB.has(keyOf(x)));
  const extra   = bVal.filter(x => !setA.has(keyOf(x)));

  missing.forEach((item) => {
    const line = item && typeof item === 'object' && item.line ? item.line : 1;
    const label =
      item.content ?? item.url ?? item.slug ?? JSON.stringify(item);
    ctx.diagnostics.push({
      line,
      severity: level,
      message: `Compare failed for: ${label}`
    });
  });


  const summary = {
    [scope]: {
      missing: missing.map(pretty),
      extra:   extra.map(pretty)
    }
  };

  return { scopes: [scope], data: summary };

  function pretty(x) {
    return typeof x === 'string'
      ? x
      : x.content ?? x.url ?? x.slug ?? JSON.stringify(x);
  }
}
