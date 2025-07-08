export function run(ctx, cfg = {}) {
  if (!ctx.extracted) {
    ctx.diagnostics.push({
      line: 1,
      severity: 'error',
      message: 'regexMatch operator needs extract to run first'
    });
    return ctx;
  }

  console.log(ctx.extracted);

  const patterns = Array.isArray(cfg.patterns) ? cfg.patterns :
                  cfg.pattern ? [cfg.pattern] : [];

  if (patterns.length === 0) {
    ctx.diagnostics.push({
      line: 1,
      severity: 'error',
      message: 'regexMatch operator missing "patterns"'
    });
    return ctx;
  }

  const regexes = [];
  for (const p of patterns) {
    try {
      regexes.push(new RegExp(p, 'i'));
    } catch (err) {
      ctx.diagnostics.push({
        line: 1,
        severity: 'error',
        message: `Invalid regex "${p}": ${err.message}`
      });
    }
  }
  if (regexes.length === 0) return ctx;

  const strOf = (entry) => {
    if (typeof entry === 'string') return entry;

    if (entry?.raw) return entry.raw;
    if (entry?.value) return entry.value;
    if (entry?.content) return entry.content;

    if (entry?.children?.length) {
      return entry.children.map(c => c.value ?? '').join('');
    }

    return JSON.stringify(entry);
  };


  const { scopes = [], data } = ctx.extracted;
  let failures = 0;

  const test = (entry, line = 1) => {
    const txt = strOf(entry);
    if (!txt) return;
    const ok = regexes.some(r => r.test(txt));
    if (!ok) {
      failures++;
      ctx.diagnostics.push({
        line,
        severity: 'error',
        message: `"${txt}" does not match any of: ${patterns.join(' , ')}`
      });
    }
  };

  for (const scope of scopes) {
    const entries = data[scope];
    if (!entries) continue;

    if (scope === 'document' || scope === 'endoffile') {
      entries.forEach(e => test(e, e.line ?? 1));
    }

    else if (scope === 'paragraph') {
      entries.forEach(p => p.matches.forEach(e => test(e, e.line ?? p.line)));
    }

    else if (scope === 'line') {
      Object.entries(entries).forEach(([ln, arr]) =>
        arr.forEach(e => test(e, Number(ln))));
    }
  }

  if (failures === 0) {
    ctx.diagnostics.push({
      line: 1,
      severity: 'info',
      message: `All entries match /${patterns.join(' | ')}/`
    });
  }

  return { scopes, data: {} }; 
}
