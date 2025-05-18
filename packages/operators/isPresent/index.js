export function run(ctx, cfg = {}) {
  const {
    target,
    scope = 'document',
    level = 'warning'
  } = cfg;

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
        // ✅ Fail if no matches at all
        if (doc.length === 0) {
          push(1, `Missing any "${target}" in document`);
        }
      } else {
        for (const item of doc) {
          if (!checkObjectProp(item)) {
            push(item.line ?? 1, `Missing "${target}" on ${ctx.filtered.target} node`);
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
      if (!ok)
        push(p.line ?? 1,
             `Paragraph at line ${p.line} missing "${target}"`);
    });

  } else if (scope === 'line') {
    const lines = ctx.markdown?.split('\n').length ?? 0;
    for (let ln = 1; ln <= lines; ln++) {
      const row = (data.line ?? {})[ln];
      const ok = row
        ? checkMatchArray(row)          
        : false;                         
      if (!ok)
        push(ln, `Line ${ln} missing "${target}"`);
    }

  } else if (scope === 'endoffile') {
    if (!checkMatchArray(data.endoffile ?? []))
      push(1, `End of file missing "${target}"`);
  }

  return ctx;
}
