export function run(ctx, cfg = {}) {
  const patterns = Array.isArray(cfg.patterns)
      ? cfg.patterns
      : cfg.pattern ? [cfg.pattern] : [];

  if (patterns.length === 0) {
    ctx.diagnostics.push({
      line: 1, severity: 'error',
      message: 'regexMatch operator missing "patterns"'
    });
    return ctx;
  }

  const regexes = [];
  for (const p of patterns) {
    try { regexes.push(new RegExp(p, 'i')); }
    catch (e) {
      ctx.diagnostics.push({ line: 1, severity: 'error',
        message: `Invalid regex "${p}": ${e.message}` });
    }
  }
  if (!regexes.length) return ctx;

  const mode  = cfg.mode === 'match' ? 'match' : 'unmatch';
  const scope = cfg.scope === 'previousstepoutput'
    ? 'previousstepoutput'
    : 'document';

  const isHit   = txt => regexes.some(r => r.test(txt));
  const keepHit = txt => mode === 'match'   ?  isHit(txt) : !isHit(txt);

  const result = { [scope]: [] };
  const push   = (ln, txt) => result[scope].push({ line: ln, content: txt.trim() });

  if (scope === 'document') {
    (ctx.markdown ?? '')
      .split('\n')
      .forEach((ln, i) => keepHit(ln) && push(i + 1, ln));
  } else {
    const prev =
      ctx.extracted?.data ??
      ctx.fetchResult?.data ??
      ctx.fetchResult       ??
      ctx.extracted         ?? {};

    const walk = (node, hint = 1) => {
      if (node == null) return;

      const t = typeof node;
      if (['string', 'number', 'boolean'].includes(t)) {
        const txt = String(node);
        if (keepHit(txt)) push(hint, txt);
        return;
      }

      if (Array.isArray(node)) { node.forEach((v, idx) => walk(v, idx + 1)); return; }

      if (t === 'object') {
        for (const [k, v] of Object.entries(node)) {
          if (keepHit(k)) push(hint, k);
          if (typeof v === 'string' && keepHit(v)) push(hint, `${k}: ${v}`);
          else walk(v, hint);
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
          : `All text matches /${patterns.join('|')}/`
    });
  }

  ctx.extracted = {
    target : patterns.join(' | '),
    scopes : [scope],
    data   : result
  };
  ctx.previous = { target: ctx.extracted.target, scopes: [scope] };

  return { patterns, scopes: [scope], data: result };
}
