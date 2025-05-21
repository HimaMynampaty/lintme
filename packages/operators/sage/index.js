import { toString } from 'mdast-util-to-string';

export async function run(ctx, cfg = {}) {
  if (!ctx.filtered) {
    ctx.diagnostics.push({
      line: 1,
      severity: 'error',
      message: 'sage operator needs a previous filter step'
    });
    return {};
  }

  const { target, scopes = ['document'], data } = ctx.filtered;
  if (target !== 'heading') {
    ctx.diagnostics.push({
      line: 1,
      severity: 'warning',
      message: 'sage should be run after a heading filter'
    });
  }

  const slugify = (txt) =>
    '#' +
    txt
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  const result = {
    document: data.document.map((h) => ({
      line: h.line,
      slug: slugify(toString(h))
    }))
  };

  ctx.slugs = { scopes: ['document'], data: result };

  return { scopes: ['document'], data: result };
}
