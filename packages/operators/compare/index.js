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

  const stepA = steps[baseline - 1].data;
  const stepB = steps[against  - 1].data;

  const A = stepA.data ?? stepA;
  const B = stepB.data ?? stepB;

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
    const line = item?.line ?? 1;
    const label = item.content ?? item.url ?? item.slug ?? JSON.stringify(item);
    ctx.diagnostics.push({
      line,
      severity: level,
      message: `Compare failed for: ${label}`
    });
  });

  extra.forEach((item) => {
    const line = item?.line ?? 1;
    const label = item.content ?? item.url ?? item.slug ?? JSON.stringify(item);
    ctx.diagnostics.push({
      line,
      severity: level,
      message: `Compare found extra: ${label}`
    });
  });

  const summary = {
    [scope]: {
      missing: missing.map(pretty),
      extra:   extra.map(pretty)
    }
  };

  // 🖼️ Include image diff message if available
  const imgDiff = stepB?.pngDiff && stepB?.pngA && stepB?.pngB;

  if (imgDiff) {
    ctx.diagnostics.push({
      line: 1,
      severity: 'warning',
      message: [
        `🖼️ Visual difference found (${stepB.pixelChanges} pixels)`,
        `[View baseline](${stepB.pngA}) • [View new](${stepB.pngB}) • [View diff](${stepB.pngDiff})`
      ].join('\n')
    });
  }

  return { scopes: [scope], data: summary };

  function pretty(x) {
    return typeof x === 'string'
      ? x
      : x.content ?? x.url ?? x.slug ?? JSON.stringify(x);
  }
}
