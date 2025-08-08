export function run(ctx, cfg = {}) {
  const patterns = Array.isArray(cfg.patterns)
    ? cfg.patterns
    : cfg.pattern
      ? [cfg.pattern]
      : [];

  if (patterns.length === 0) {
    ctx.diagnostics.push({
      line: 1,
      severity: 'error',
      message: 'regexMatch operator missing "patterns"',
    });
    return ctx;
  }

  const regexes = [];
  for (const p of patterns) {
    try { regexes.push(new RegExp(p, 'i')); }
    catch (e) {
      ctx.diagnostics.push({
        line: 1,
        severity: 'error',
        message: `Invalid regex "${p}": ${e.message}`,
      });
    }
  }
  if (!regexes.length) return ctx;

  const mode  = cfg.mode  === 'unmatch' ? 'unmatch' : 'match';
  const scope = cfg.scope === 'previousstepoutput' ? 'previousstepoutput' : 'document';

  const isHit   = (txt) => regexes.some((r) => r.test(txt));
  const keepHit = (txt) => (mode === 'match' ? isHit(txt) : !isHit(txt));

  const looksLikeDashBullet = patterns.length === 1 && patterns[0] === '^\\s*-\\s+';
  const targetLabel =
    mode === 'unmatch'
      ? (looksLikeDashBullet ? 'non-dash list items' : `lines NOT matching /${patterns.join(' | ')}/`)
      : (looksLikeDashBullet ? 'dash list items'     : `lines matching /${patterns.join(' | ')}/`);

  const result = { [scope]: [] };
  const push = (ln, txt) => {
    const trimmed = (txt || '').trim();
    if (trimmed !== '') result[scope].push({ line: ln, content: trimmed });
  };

  if (scope === 'document') {
    (ctx.markdown ?? '')
      .split('\n')
      .forEach((ln, i) => keepHit(ln) && push(i + 1, ln));
  } else {
    const prev =
      ctx.extracted?.data ??
      ctx.fetchResult?.data ??
      ctx.fetchResult ??
      ctx.extracted ??
      {};

    const walk = (node, hint = 1, parentKey = '') => {
      if (node == null) return;

      const t = typeof node;

      if (t === 'string') {
        if ((parentKey === 'raw' || parentKey === 'content') && keepHit(node)) {
          push(hint, node);
        }
        return;
      }
      if (t === 'number' || t === 'boolean') return;

      if (Array.isArray(node)) {
        node.forEach((v) => {
          const ln = typeof v?.line === 'number' ? v.line : hint;
          walk(v, ln, parentKey);
        });
        return;
      }

      if (t === 'object') {
        const nextHint = typeof node.line === 'number' ? node.line : hint;

        if (typeof node.raw === 'string') {
          if (keepHit(node.raw)) push(nextHint, node.raw);
          return;
        }

        if (typeof node.content === 'string') {
          if (keepHit(node.content)) push(nextHint, node.content);
        }

        for (const [k, v] of Object.entries(node)) {
          if (k === 'raw' || k === 'content') continue;
          walk(v, nextHint, k);
        }
      }
    };

    walk(prev);

    if (!result[scope].length) {
      const asJson = JSON.stringify(prev);
      if (keepHit(asJson)) push(1, asJson);
    }
  }

  if (!result[scope].length) {
    ctx.diagnostics.push({
      line: 1,
      severity: 'info',
      message:
        mode === 'match'
          ? `No text matches /${patterns.join('|')}/`
          : `All text matches /${patterns.join('|')}/`,
    });
  }

  ctx.extracted = {
    target: targetLabel,
    scopes: [scope],
    data: result,
    meta: { kind: 'regex', mode, patterns }
  };

  ctx.target = ctx.extracted.target;
  ctx.previous = {
    target: ctx.extracted.target,
    scopes: [scope],
    meta: { kind: 'regex', mode, patterns }
  };

  ctx.metricLabel = targetLabel;

  return { patterns, scopes: [scope], data: result };
}
