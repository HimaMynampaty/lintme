import { fromMarkdown } from 'mdast-util-from-markdown';

export function run(ctx, cfg = {}) {
  const level = cfg.level ?? 'warning';
  const scope = cfg.scope === 'previousstepoutput'
    ? 'previousstepoutput'
    : 'document';

  let sentences = [];
  const normalize = s => s.trim().replace(/\s+/g, ' ').toLowerCase();

  if (scope === 'document') {
    (ctx.markdown ?? '').split('\n').forEach((line, idx) => {
      const norm = normalize(line);
      if (norm && norm.length >= 10) sentences.push({ norm, raw: line, line: idx + 1 });
    });
  } else {
    const prev = ctx.extracted?.data ?? ctx.extracted ?? {};
    const walk = (node, hint = 1) => {
      if (node == null) return;
      if (typeof node === 'string') {
        const norm = normalize(node);
        if (norm && norm.length >= 10) sentences.push({ norm, raw: node, line: hint });
        return;
      }
      if (Array.isArray(node)) node.forEach((n, i) => walk(n, i + 1));
      else if (typeof node === 'object') Object.values(node).forEach(v => walk(v, hint));
    };
    walk(prev);
  }

  const seen = new Map();
  const dups = [];
  for (const { norm, raw, line } of sentences) {
    const entry = seen.get(norm);
    if (entry) {
      entry.lines.push(line);
    } else {
      seen.set(norm, { sentence: raw, lines: [line] });
    }
  }
  seen.forEach(v => {
    if (v.lines.length > 1) dups.push(v);
  });

  dups.forEach(dup => {
    ctx.diagnostics.push({
      line     : dup.lines[0],
      severity : level,
      message  : `Duplicate sentence “${dup.sentence}” (lines ${dup.lines.join(', ')})`,
    });
  });

  ctx.duplicateSentences = { scope, duplicates: dups };

  return {
    target : 'duplicateSentences',
    scopes : [scope],
    data   : { [scope]: dups },
  };
}
