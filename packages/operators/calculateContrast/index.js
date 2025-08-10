import { parse } from 'node-html-parser';
import { createCanvas } from 'canvas';

const _ctx = createCanvas(1, 1).getContext('2d');
const ASSUMED_BG_RGB = [255, 255, 255];
const MAX_ELEMENTS_PER_SNIPPET = 200;

function toRGB(css) {
  if (!css) return null;

  const hex = css.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const h = hex[1];
    const full = h.length === 3 ? [...h].map(c => c + c).join('') : h;
    const int = parseInt(full, 16);
    return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
  }
  const m = css.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (m) return [+m[1], +m[2], +m[3]];

  
  try {
    _ctx.fillStyle = css;
  } catch {
    return null;
  }
  const val = _ctx.fillStyle;
  if (val.startsWith('#')) {
    const h2 = val.slice(1);
    const full2 = h2.length === 3 ? [...h2].map(c => c + c).join('') : h2;
    const int2 = parseInt(full2, 16);
    return [(int2 >> 16) & 255, (int2 >> 8) & 255, int2 & 255];
  }
  const m2 = val.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  return m2 ? [+m2[1], +m2[2], +m2[3]] : null;
}

const relLum = ([r, g, b]) => {
  const c = x => {
    x /= 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * c(r) + 0.7152 * c(g) + 0.0722 * c(b);
};

const ratio = (fg, bg) => {
  const [L1, L2] = [relLum(fg), relLum(bg)].sort((a, b) => b - a);
  return (L1 + 0.05) / (L2 + 0.05);
};

export function run(ctx, _cfg = {}) {
  
  ctx.diagnostics ??= [];

  const prev = ctx.extracted;
  const prevScopes = prev?.scopes ?? prev?.data?.scopes ?? [];
  const hasDocScope =
    prevScopes.includes?.('document') ||
    (Array.isArray(prev?.data?.document) && prev?.target === 'html');

  if (!(prev?.target === 'html' && hasDocScope && Array.isArray(prev?.data?.document))) {
    ctx.diagnostics.push({
      line: 1,
      severity: 'error',
      message: 'calculateContrast needs an earlier extract step (target: html, scope: document).'
    });
    return ctx;
  }

  const perLine = {}; 

  for (const { content, line } of prev.data.document) {
    if (typeof content !== 'string') continue;

    const root = parse(content, { style: true });
    const elements = root.querySelectorAll('*');
    let visited = 0;

    for (const el of elements) {
      if (++visited > MAX_ELEMENTS_PER_SNIPPET) break;

      const style = (el.getAttribute('style') || '').trim();
      if (!style) continue;

      
      const styleObj = Object.fromEntries(
        style
          .split(';')
          .map(s => s.trim())
          .filter(Boolean)
          .map(s => {
            const i = s.indexOf(':');
            return i === -1 ? [s, ''] : [s.slice(0, i).trim().toLowerCase(), s.slice(i + 1).trim()];
          })
      );

      const fgCSS = styleObj['color'];
      let bgCSS = styleObj['background-color'];

      
      if (!bgCSS || /^transparent$/i.test(bgCSS)) bgCSS = '#ffffff';

      if (!fgCSS || !bgCSS) continue;

      const fg = toRGB(fgCSS);
      const bg = toRGB(bgCSS);
      if (!fg || !bg) {
        ctx.diagnostics.push({
          line,
          severity: 'warning',
          message: `Unparsable color "${fgCSS ?? '∅'}" or "${bgCSS ?? '∅'}" on line ${line}`
        });
        continue;
      }

      const r = +ratio(fg, bg).toFixed(2);
      if (perLine[line] === undefined || r < perLine[line]) perLine[line] = r;
    }
  }

  ctx.contrast = { scopes: ['line'], data: { line: perLine } };

  ctx.count ??= {};
  ctx.count.contrast = { line: perLine };

  ctx.previous = { target: 'contrast', scopes: ['line'] };

  return { target: 'contrast', scopes: ['line'], data: { line: perLine } };
}
