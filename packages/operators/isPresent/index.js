export function run(ctx, cfg = {}) {
  const target = cfg.target
              ?? (ctx.filtered?.target === 'image' ? 'alt' : ctx.filtered?.target)
              ?? '';
  const level  = cfg.level ?? 'warning';
  const scope  = cfg.scope ?? ctx.filtered?.scopes?.[0] ?? 'document';

  if (!ctx.filtered) {
    ctx.diagnostics.push({
      line: 1,
      severity: 'error',
      message: 'isPresent operator needs a filter step first'
    });
    return ctx;
  }

  if (!target) {
    ctx.diagnostics.push({
      line: 1,
      severity: 'error',
      message: 'isPresent operator missing "target"'
    });
    return ctx;
  }

  const data = ctx.filtered.data ?? {};
  const push = (line, msg) =>
    ctx.diagnostics.push({ line, severity: level, message: msg });

  const checkObjectProp = node => {
    const val = node[target];
    return typeof val === 'string' ? val.trim().length > 0 : !!val;
  };

  const checkMatchArray = arr => Array.isArray(arr) && arr.length > 0;

  if (scope === 'document') {
    const doc = data.document ?? [];

    if (Array.isArray(doc)) {
      const isMatchArray = doc.length === 0 || typeof doc[0] === 'string';

      if (isMatchArray) {
        if (doc.length === 0) {
          push(1, `Missing any "${target}" in document`);
        }
      } else {
        for (const item of doc) {
          if (!checkObjectProp(item)) {
            const label = ctx.filtered.target ?? 'node';
            push(item.line ?? 1, `Missing "${target}" on ${label} node`);
          }
        }
      }
    }
  }

  else if (scope === 'paragraph') {
    (data.paragraph ?? []).forEach(p => {
      const ok = Array.isArray(p.matches)
        ? checkMatchArray(p.matches)
        : checkObjectProp(p);
      if (!ok) {
        push(p.line ?? 1, `Paragraph at line ${p.line} missing "${target}"`);
      }
    });
  }

  else if (scope === 'line') {
    const lines = ctx.markdown?.split('\n').length ?? 0;
    for (let ln = 1; ln <= lines; ln++) {
      const row = (data.line ?? {})[ln];
      const ok = row ? checkMatchArray(row) : false;
      if (!ok) {
        push(ln, `Line ${ln} missing "${target}"`);
      }
    }
  }

  else if (scope === 'endoffile') {
    if (!checkMatchArray(data.endoffile ?? [])) {
      push(1, `End of file missing "${target}"`);
    }
  }

  return ctx;
}
