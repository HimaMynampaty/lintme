import { visit }   from 'unist-util-visit';
import { toString} from 'mdast-util-to-string';

const EMOJI_REGEX = /:[\w+-]+:|[\p{Emoji_Presentation}\p{Extended_Pictographic}\u{FE0F}\u{1F1E6}-\u{1F1FF}]/gu;
const BUILTIN_RX  = { emoji: EMOJI_REGEX, newline: /\n/g };

const escapeRE = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const toRegExp = t => BUILTIN_RX[t] || new RegExp(escapeRE(t), 'gi');

export function run (ctx, cfg = {}) {
  /* ── early‑exit checks ─────────────────────────────────────────────────── */
  if (!ctx.ast)
    return pushErr(ctx, 'filter operator needs generateAST to run first');
  const { target, scopes = ['document'] } = cfg;
  if (!target) return pushErr(ctx, 'filter operator missing "target"');

  /* ── shared helpers ────────────────────────────────────────────────────── */
  const md        = ctx.markdown ?? '';
  const isRegex   = target in BUILTIN_RX || /^[./].*[./]$/.test(target);
  const re        = isRegex ? toRegExp(target) : null;

  const matchNode = n  => !isRegex && n.type === target;
  const matchText = txt=> isRegex ? [...txt.matchAll(re)].map(m => m[0]) : [];

  const result = { document: [], paragraph: [], line: {}, endoffile: [] };

  /* ── scope‑specific handlers in one map ─────────────────────────────────── */
  const handlers = {
    document () {
      if (isRegex) {
        result.document = matchText(md);
      } else {
        visit(ctx.ast, n => {
          if (matchNode(n)) {
            result.document.push({ ...n, line: n.position?.start?.line ?? 1 });
          }
        });
      }
    },

    paragraph () {
      visit(ctx.ast, 'paragraph', p => {
        const matches = isRegex
          ? matchText(toString(p))
          : collectMatches(p, matchNode);
        result.paragraph.push({ line: p.position?.start?.line ?? 1, matches });
      });
    },

    line () {
      if (isRegex) {
        visit(ctx.ast, 'text', n => {
          const hits = matchText(n.value);
          if (hits.length) {
            const ln = n.position?.start?.line;
            (result.line[ln] ??= []).push(...hits);
          }
        });
      } else {
        visit(ctx.ast, n => {
          if (!matchNode(n)) return;
          const ln = n.position?.start?.line;
          (result.line[ln] ??= []).push(n);
        });
      }
    },

    endoffile () {
      const lines     = md.split('\n');
      const lastLine  = lines.at(-1) ?? '';

      if (isRegex) {
        const hits = matchText(lastLine);
        if (hits.length) result.endoffile = hits;
      } else {
        visit(ctx.ast, n => {
          if (n.position?.start?.line === lines.length && matchNode(n))
            result.endoffile.push({ ...n, line: lines.length });
        });
      }
    }
  };

  /* ── run only requested scopes ──────────────────────────────────────────── */
  for (const s of scopes) handlers[s]?.();

  ctx.filtered = { target, scopes, data: result };
  return ctx;
}

/* ═══════════════════════════════════════════════════════════════════════════ */

function collectMatches (parent, predicate) {
  const out = [];
  visit(parent, n => predicate(n) && out.push(n));
  return out;
}

function pushErr (ctx, msg) {
  ctx.diagnostics.push({ line: 1, severity: 'error', message: msg });
  return ctx;
}
