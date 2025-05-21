export function run(ctx, cfg = {}) {
  if (!ctx.filtered) {
    ctx.diagnostics.push({
      line: 1,
      severity: 'error',
      message: 'regexMatch operator needs filter to run first'
    });
    return ctx;
  }

  console.log(ctx.filtered);

  const pattern = cfg.pattern;
  if (!pattern) {
    ctx.diagnostics.push({
      line: 1,
      severity: 'error',
      message: 'regexMatch operator missing "pattern"'
    });
    return ctx;
  }

 let re;
 try {
   re = new RegExp(pattern, 'i');
  } catch (err) {
    ctx.diagnostics.push({
      line: 1,
      severity: 'error',
      message: `Invalid regular expression: ${err.message}`
    });
    return ctx;
  }

  const strOf = e => {
    if (typeof e === 'string') return e;

    if (e?.url) {
      const text =
        e.alt ??
        e.content ??
        (e.children?.map(c => c.value).join('') || '');
      const title = e.title ? ` "${e.title}"` : ''; 
      return `[${text}](${e.url}${title})`;
    }

    return e?.content ?? e?.value ?? '';
  };

  const { scopes = [], data } = ctx.filtered;
  let failures = 0;

  const testEntry = (entry, line = 1) => {
    const txt = strOf(entry);
    if (txt && !re.test(txt)) {
      failures++;
      ctx.diagnostics.push({
        line,
        severity: 'error',
        message: `"${txt}" does not match /${pattern}/`
      });
    }
  };

  for (const scope of scopes) {
    const entries = data[scope];
    if (!entries) continue;

    if (scope === 'document' || scope === 'endoffile') {
      entries.forEach(e => testEntry(e, e.line ?? 1));
    }

    else if (scope === 'paragraph') {
      entries.forEach(p => p.matches.forEach(e => testEntry(e, e.line ?? p.line)));
    }

    else if (scope === 'line') {
      Object.entries(entries).forEach(([ln, arr]) =>
        arr.forEach(e => testEntry(e, Number(ln))));
    }
  }

  if (failures === 0) {
    ctx.diagnostics.push({
      line: 1,
      severity: 'info',
      message: `All entries match /${pattern}/`
    });
  }

  return { scopes, data: {} }; 
}
