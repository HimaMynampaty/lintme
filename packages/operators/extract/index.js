import { visit, EXIT } from 'unist-util-visit';
import { toString } from 'mdast-util-to-string';

const EMOJI_REGEX = /:[\w+-]+:|[\p{Emoji_Presentation}\p{Extended_Pictographic}\u{FE0F}\u{1F1E6}-\u{1F1FF}]/gu;
const DATE_REGEX  = /\b(?:\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\d{4}[\/-]\d{1,2}[\/-]\d{1,2})\b/g;
const BUILTIN_RX = { emoji: EMOJI_REGEX, newline: /\r?\n/g, date: DATE_REGEX };

// Known mdast node types (used to distinguish "no nodes" vs "invalid target")
const MDAST_KNOWN_TYPES = new Set([
  'root','paragraph','text','heading','thematicBreak','blockquote','list','listItem',
  'table','tableRow','tableCell','html','code','yaml','definition','footnoteDefinition',
  'break','emphasis','strong','delete','link','image','linkReference','imageReference',
  'footnote','footnoteReference'
]);

const escapeRE = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const toRegExp = t => BUILTIN_RX[t] || new RegExp(escapeRE(t), 'gi');

export function run(ctx, cfg = {}) {
  if (!ctx.ast) return pushErr(ctx, 'extract operator needs generateAST to run first');
  const { target, scopes } = cfg;
  if (!target) return pushErr(ctx, 'extract operator missing "target"');
  if (!scopes || scopes.length === 0) return pushErr(ctx, 'extract operator missing "scopes"');

  const md = ctx.markdown ?? '';
  const mdLines = md.split('\n');

  const isRegex = target in BUILTIN_RX || /^[./].*[./]$/.test(target);
  const re = isRegex ? toRegExp(target) : null;

  const isExternal = url => /^https?:\/\//i.test(url);
  const isInternal = url => !isExternal(url);

  // NOTE: Removed early “no nodes found” warning. We'll decide after collecting results.

  const checkLinkFormatting = markdown => {
    const RX = {
      missingCloseParen:   [/\[[^\]]*\]\([^\)]*$/, "Malformed link: missing closing parenthesis ')'."],
      missingCloseBracket: [/\[[^\]]*$/,           "Malformed link: missing closing bracket ']'."],
      missingOpenBracket:  [/^[^\[]+\][^\(]*\([^\)]*\)/, "Malformed link: missing opening bracket '['."],
      missingOpenParen:    [/\[[^\]]*\][^\(]*[^)]$/, "Malformed link: missing opening parenthesis '('."],
      emptyLinkPattern:    [/\[\s*\]\(\s*\)/, "Empty link: both text and URL are missing."],
    };
    const out = [];
    markdown.split('\n').forEach((ln, i) => {
      for (const [_k, [rx, msg]] of Object.entries(RX)) {
        if (rx.test(ln)) { out.push({ line: i + 1, content: ln.trim(), message: msg }); break; }
      }
    });
    return out;
  };

  const matchNode = n => {
    if (isRegex) return false;

    if (target === 'link') {
      if (n.type !== 'link') return false;
      const child = n.children?.[0];
      if (n.title == null && child?.type === 'text' && n.url === child.value) return false;
      return true;
    }

    if (target === 'internallink' || target === 'externallink') {
      if (n.type !== 'link') return false;
      if (n.title == null &&
          n.children?.length === 1 &&
          n.children[0].type === 'text' &&
          n.url === n.children[0].value) return false;

      return target === 'internallink'
        ? isInternal(n.url || '')
        : isExternal(n.url || '');
    }

    return n.type === target;
  };

  const matchText = txt =>
    isRegex
      ? [...txt.matchAll(re)]
          .map(m => m[0])
          .filter(s => !/^https?:\/\/\S+$/i.test(s))
      : [];

  const serializeNode = n => {
    if (ctx.markdown && n.position?.start && n.position?.end) {
      const { start, end } = n.position;
      if (start.line === end.line) {
        return mdLines[start.line - 1].slice(start.column - 1, end.column - 1);
      }
      const snippet = [mdLines[start.line - 1].slice(start.column - 1)];
      for (let i = start.line; i < end.line - 1; i++) snippet.push(mdLines[i]);
      snippet.push(mdLines[end.line - 1].slice(0, end.column - 1));
      return snippet.join('\n');
    }
    if (typeof n.value === 'string') return n.value;
    return toString(n);
  };

  const malformed = checkLinkFormatting(md);
  const result = { document: [], paragraph: [], line: {}, endoffile: [] };

  const attachRawExtras = (n, base) => {
    const ln = n.position?.start?.line;
    const rawLine = typeof ln === 'number' ? (mdLines[ln - 1] ?? '') : '';

    let bullet = null;
    if (n.type === 'listItem' && rawLine) {
      const m = rawLine.match(/^\s*([-*+])\s+/);
      bullet = m?.[1] ?? null;
    }

    return {
      ...base,
      ...(rawLine ? { raw: rawLine } : {}),
      ...(bullet ? { bullet } : {}),
    };
  };

  const handlers = {
    document() {
      if (isRegex) {
        visit(ctx.ast, 'text', n => {
          const hits = matchText(n.value);
          const ln = n.position?.start?.line;
          for (const h of hits) {
            result.document.push({ content: h, line: ln });
          }
        });
      } else {
        visit(ctx.ast, n => {
          if (!matchNode(n)) return;

          if (
            n.type === 'link' &&
            n.title == null &&
            n.children?.length === 1 &&
            n.children[0].type === 'text' &&
            n.url === n.children[0].value
          ) return;

          const base = {
            ...n,
            line: n.position?.start?.line ?? 1,
            content: serializeNode(n),
          };

          result.document.push(attachRawExtras(n, base));
        });

        if (target === 'internallink' || target === 'externallink') {
          malformed.forEach(iss => {
            if (iss.line === undefined) return;
            const urlMatch = iss.content.match(/\(([^()\s]*)/);
            const url = urlMatch?.[1] ?? '';
            const internal = isInternal(url);
            if ((target === 'internallink' && internal) || (target === 'externallink' && !internal)) {
              result.document.push({ type: 'malformedlink', url, ...iss });
            }
          });
        }
      }
    },

    paragraph() {
      visit(ctx.ast, 'paragraph', p => {
        const decorated = [];

        const matches = isRegex
          ? matchText(toString(p))
          : collectMatches(p, matchNode);

        if (matches.length) {
          decorated.push(
            ...matches.map(m => {
              if (typeof m === 'string') return { content: m };
              const base = { ...m, content: serializeNode(m) };
              return attachRawExtras(m, base);
            })
          );
        }

        if (target === 'internallink' || target === 'externallink') {
          const { line: start } = p.position.start;
          const { line: end } = p.position.end;

          malformed.forEach(iss => {
            if (iss.line < start || iss.line > end) return;

            const url = (iss.content.match(/\(([^()\s]*)/) || [])[1] ?? '';
            const same = target === 'internallink' ? isInternal(url) : isExternal(url);
            if (same) decorated.push({ type: 'malformedlink', url, ...iss });
          });
        }

        if (decorated.length) {
          result.paragraph.push({ line: p.position.start.line, matches: decorated });
        }
      });
    },

    line() {
      if (isRegex) {
        visit(ctx.ast, 'text', n => {
          const hits = matchText(n.value);
          if (hits.length) {
            const ln = n.position?.start?.line;
            (result.line[ln] ??= []).push(
              ...hits.map(h => ({ content: h }))
            );
          }
        });
      } else {
        visit(ctx.ast, n => {
          if (!matchNode(n)) return;

          if (
            n.type === 'link' &&
            n.title == null &&
            n.children?.length === 1 &&
            n.children[0].type === 'text' &&
            n.url === n.children[0].value
          ) return;

          const ln = n.position?.start?.line;
          const base = {
            ...n,
            content: serializeNode(n),
          };
          (result.line[ln] ??= []).push(attachRawExtras(n, base));
        });

        if (target === 'internallink' || target === 'externallink') {
          malformed.forEach(iss => {
            const urlMatch = iss.content.match(/\(([^()\s]*)/);
            const url = urlMatch?.[1] ?? '';
            const internal = isInternal(url);
            if ((target === 'internallink' && internal) || (target === 'externallink' && !internal)) {
              if (iss.line !== undefined) {
                (result.line[iss.line] ??= []).push({ type: 'malformedlink', url, ...iss });
              }
            }
          });
        }
      }
    },

    endoffile() {
      if (isRegex) {
        const endsWithNewline = /\r?\n$/.test(md);
        if (endsWithNewline) {
          const line = md.split('\n').length;
          result.endoffile.push({ content: '\\n', line });
        }
      } else {
        const endLine = md.split('\n').length;
        visit(ctx.ast, n => {
          if (n.position?.start?.line === endLine && matchNode(n)) {
            const base = {
              ...n,
              line: endLine,
              content: serializeNode(n),
            };
            result.endoffile.push(attachRawExtras(n, base));
          }
        });

        if (target === 'internallink' || target === 'externallink') {
          const malformed = checkLinkFormatting(md);
          malformed.forEach(iss => {
            if (iss.line !== endLine) return;
            const urlMatch = iss.content.match(/\(([^()\s]*)/);
            const url = urlMatch?.[1] ?? '';
            const internal = isInternal(url);
            if ((target === 'internallink' && internal) || (target === 'externallink' && !internal)) {
              result.endoffile.push({ type: 'malformedlink', url, ...iss });
            }
          });
        }
      }
    }
  };

  // de-duplicate document + paragraph
  for (const scope of ['document', 'paragraph']) {
    const seen = new Set();
    result[scope] = result[scope].filter(item => {
      const key = `${item.line}|${item.content}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // de-duplicate line items
  const lineSeen = new Set();
  for (const [ln, entries] of Object.entries(result.line)) {
    result.line[ln] = entries.filter(e => {
      const key = `${ln}|${e.content}`;
      if (lineSeen.has(key)) return false;
      lineSeen.add(key);
      return true;
    });
  }

  // run requested scopes
  for (const s of scopes) handlers[s]?.();

  // === Post-collection: decide whether to warn and tag the warning with a code ===
  const hasAny =
    result.document.length ||
    result.paragraph.length ||
    Object.keys(result.line).length ||
    result.endoffile.length;

  const isSpecial = ['internallink','externallink'].includes(target);
  const isKnownMdast = isRegex || isSpecial ? true : MDAST_KNOWN_TYPES.has(target);

  if (!hasAny) {
    if (!isKnownMdast) {
      ctx.diagnostics.push({
        line: 1,
        severity: 'warning',
        code: 'extract/invalid-target',
        message: `extract: unknown node type “${target}”. This does not match any known mdast node type.`
      });
    } else {
      ctx.diagnostics.push({
        line: 1,
        severity: 'warning',
        code: 'extract/no-nodes',
        message: `extract: no “${target}” nodes found in ${scopes.join(', ')}.`
      });
    }
  }

  // Provide meta for downstream operators (optional)
  ctx.extracted = { target, scopes, data: result, meta: { empty: !hasAny, isKnownMdast } };
  return { target, scopes, data: result };
}

function collectMatches(parent, predicate) {
  const out = [];
  visit(parent, n => predicate(n) && out.push(n));
  return out;
}

function pushErr(ctx, msg) {
  ctx.diagnostics.push({ line: 1, severity: 'error', message: msg });
  return ctx;
}
