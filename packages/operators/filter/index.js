import { visit }   from 'unist-util-visit';
import { toString} from 'mdast-util-to-string';

const EMOJI_REGEX  = /:[a-zA-Z0-9_+-]+:|[\p{Emoji_Presentation}\p{Extended_Pictographic}\u{FE0F}\u{1F1E6}-\u{1F1FF}]/gu;
const BUILTIN_RX   = { emoji: EMOJI_REGEX, newline: /\n/g };

const escapeRE  = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const toRegExp  = t => BUILTIN_RX[t] || new RegExp(escapeRE(t), 'gi');
const rxTargets = new Set(Object.keys(BUILTIN_RX));  

export function run(ctx, cfg = {}) {
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
  const md     = ctx.markdown ?? '';

  const isRegex = rxTargets.has(target) || target.startsWith('/') || target.endsWith('/');
  const re      = isRegex ? toRegExp(target) : null;

  const matchNode = node =>
    !isRegex && node.type === target;            

  const matchText = txt =>
    isRegex ? [...txt.matchAll(re)].map(m => m[0]) : [];  

  const res = { document: [], paragraph: [], line: {}, endoffile: [] };

  if (scopes.includes('document')) {
    if (isRegex) {
      res.document = matchText(md);
    } else {
      visit(ctx.ast, node => { if (matchNode(node)) res.document.push(node); });
    }
  }

  if (scopes.includes('paragraph')) {
    visit(ctx.ast, 'paragraph', para => {
      let matches = [];

      if (isRegex) {
        matches = matchText(toString(para));
      } else {
        visit(para, node => { if (matchNode(node)) matches.push(node); });
      }

      res.paragraph.push({
        line: para.position?.start?.line ?? 1,
        matches
      });
    });
  }

  if (scopes.includes('line')) {
    if (isRegex) {
      visit(ctx.ast, 'text', node => {
        const hits = matchText(node.value);
        if (hits.length) {
          const ln = node.position?.start?.line;
          res.line[ln] ??= [];
          res.line[ln].push(...hits);
        }
      });
    }

    if (!isRegex) {
      visit(ctx.ast, node => {
        if (!matchNode(node)) return;
        const ln = node.position?.start?.line;
        res.line[ln] ??= [];
        res.line[ln].push(node);
      });
    }
  }

  if (scopes.includes('endoffile')) {
    if (target === 'newline') {
      res.endoffile = md.endsWith('\n') ? ['\n'] : [];
    }
  }

  ctx.filtered = { target, scopes, data: res };
  return ctx;
}
