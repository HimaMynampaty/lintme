import { visit } from 'unist-util-visit';
import { toString } from 'mdast-util-to-string';

const EMOJI_REGEX = /:[a-zA-Z0-9_+-]+:|[\p{Emoji_Presentation}\p{Extended_Pictographic}\u{FE0F}\u{1F1E6}-\u{1F1FF}]/gu;
const BUILTIN     = { emoji: EMOJI_REGEX, newline: /\n/g };

const escapeRE  = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const toRegExp  = tgt => BUILTIN[tgt] || new RegExp(escapeRE(tgt), 'gi');
const matchesOf = (text, re) => [...text.matchAll(re)].map(m => m[0]);

export function run(ctx, cfg = {}) {
  /* ---------- guards ---------- */
  if (!ctx.ast) {
    ctx.diagnostics.push({ line: 1, severity: 'error',
      message: 'filter operator needs generateAST to run first' });
    return ctx;
  }
  const target = cfg.target;
  if (!target) {
    ctx.diagnostics.push({ line: 1, severity: 'error',
      message: 'filter operator missing "target"' });
    return ctx;
  }

  const scopes = cfg.scopes ?? ['document'];
  const re     = toRegExp(target);
  const md     = ctx.markdown ?? '';

  /* ---------- result skeleton ---------- */
  const res = { document: [], paragraph: [], line: {}, endoffile: [] };

  /* ---------- document scope ---------- */
  if (scopes.includes('document'))
    res.document = matchesOf(md, re);

  /* ---------- paragraph scope ---------- */
  if (scopes.includes('paragraph')) {
    visit(ctx.ast, 'paragraph', node => {
      const txt  = toString(node);
      const line = node.position?.start?.line ?? 1;
      res.paragraph.push({ line, matches: matchesOf(txt, re) });
    });
  }

  /* ---------- line scope (AST‑only) ---------- */
  if (scopes.includes('line')) {
    visit(ctx.ast, 'text', node => {
      const line = node.position?.start?.line;
      if (!line) return;

      const hits = matchesOf(node.value, re);
      if (hits.length === 0) return;

      res.line[line] ??= [];
      res.line[line].push(...hits);
    });
  }

  /* ---------- end‑of‑file scope ---------- */
  if (scopes.includes('endoffile')) {
    const m = md.match(new RegExp(`(${re.source})+$`, re.flags));
    res.endoffile = m ? matchesOf(m[0], re) : [];
  }

  ctx.filtered = { target, scopes, data: res };
  return ctx;
}
