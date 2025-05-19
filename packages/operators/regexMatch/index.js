export function run(ctx, cfg = {}) {
  if (!ctx.filtered) {
    ctx.diagnostics.push({
      line: 1,
      severity: 'error',
      message: 'regexMatch operator needs filter to run first'
    });
    return ctx;
  }

  const { target, scopes = [], data } = ctx.filtered;
  const pattern = cfg.pattern;
  const level   = 'warning';

  if (!pattern) {
    ctx.diagnostics.push({
      line: 1,
      severity: 'error',
      message: 'regexMatch operator missing "pattern"'
    });
    return ctx;
  }

  const re = new RegExp(pattern, 'i');

  const matchFails = str => !re.test(str ?? '');

  const push = (line, msg) =>
    ctx.diagnostics.push({ line, severity: level, message: msg });

  const checkStringArray = (arr, line = 1) => {
    for (const str of arr) {
      if (typeof str === 'string' && matchFails(str)) {
        push(line, `Mismatch: "${str}" does not match pattern`);
      }
    }
  };

  const checkNodeProps = (nodes, line = 1) => {
    for (const n of nodes) {
      const value =
        n?.url ?? n?.alt ?? n?.title ?? (n.children?.[0]?.value ?? '');
      if (typeof value === 'string' && matchFails(value)) {
        push(n.line ?? line, `Link value "${value}" does not match pattern`);
      }
    }
  };

  for (const scope of scopes) {
    const entries = data[scope];

    if (!entries) continue;

    if (scope === 'document' || scope === 'endoffile') {
      const isStringArray = Array.isArray(entries) && typeof entries[0] === 'string';
      if (isStringArray) {
        checkStringArray(entries);
      } else {
        checkNodeProps(entries);
      }
    }

    else if (scope === 'paragraph') {
      for (const p of entries) {
        const content = p.matches;
        if (Array.isArray(content)) {
          checkStringArray(content, p.line);
        } else if (Array.isArray(p)) {
          checkNodeProps(p, p.line);
        }
      }
    }

    else if (scope === 'line') {
      for (const [line, arr] of Object.entries(entries)) {
        if (Array.isArray(arr)) {
          checkStringArray(arr, Number(line));
        }
      }
    }
  }

  return ctx;
}
