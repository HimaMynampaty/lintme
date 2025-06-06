import { toString } from 'mdast-util-to-string';

export function run(ctx, cfg = {}) {
  if (!ctx.extracted) {
    ctx.diagnostics.push({
      line: 1,
      severity: 'error',
      message: 'length operator needs any other operator like extract to run first'
    });
    return ctx;
  }

  const { target, scopes, data } = ctx.extracted;
  const summary = { document: 0, endoffile: 0, line: {}, paragraph: [] };

  const textLength = txt => (txt ? txt.length : 0);

  const calculators = {
    document: () => {
      summary.document = data.document
        ?.map(n => toString(n))
        .reduce((acc, txt) => acc + textLength(txt), 0);
    },

    line: () => {
      for (const [lineNum, matches] of Object.entries(data.line ?? {})) {
        const total = matches
          .map(n => toString(n))
          .reduce((acc, txt) => acc + textLength(txt), 0);
        summary.line[lineNum] = total;
      }
    },

    paragraph: () => {
      for (const para of data.paragraph ?? []) {
        const total = para.matches
          .map(n => toString(n))
          .reduce((acc, txt) => acc + textLength(txt), 0);
        summary.paragraph.push({ line: para.line, length: total });
      }
    },

    endoffile: () => {
      summary.endoffile = data.endoffile
        ?.map(n => toString(n))
        .reduce((acc, txt) => acc + textLength(txt), 0);
    }
  };

  for (const s of scopes) calculators[s]?.();

  ctx.lengths = { target, scopes, data: summary };

  ctx.counts ??= {};
  ctx.counts['length'] = Object.fromEntries(
    Object.entries(summary).extract(([k]) => scopes.includes(k))
  );

  return { target: 'length', scopes, data: summary };
}
