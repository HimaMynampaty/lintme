import { parse } from 'node-html-parser';
import { createCanvas } from 'canvas';

function toRGB(css) {
  const ctx = createCanvas(1, 1).getContext('2d');
  try {
    ctx.fillStyle = css;
  } catch {
    return null;
  }

  const val = ctx.fillStyle;

  if (val.startsWith('#')) {
    const hex = val.slice(1);
    const full = hex.length === 3 ? [...hex].map(h => h + h).join('') : hex;
    const int = parseInt(full, 16);
    return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
  }

  const m = val.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  return m ? [+m[1], +m[2], +m[3]] : null;
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
  const prev = ctx.extracted;
  if (!prev?.data?.document) {
    ctx.diagnostics.push({
      line: 1,
      severity: 'error',
      message: 'calculateContrast needs an earlier extract (scope: document).'
    });
    return ctx;
  }

  const perLine = {};    // line-based summary
  const all = [];        // full contrast detail

  for (const { content, line } of prev.data.document) {
    if (typeof content !== 'string') continue;

    const root = parse(content, { style: true }).querySelector('*');
    if (!root) continue;

    const styleObj = Object.fromEntries(
      (root.getAttribute('style') || '')
        .split(';')
        .map(s => s.trim())
        .filter(Boolean)
        .map(s => s.split(':').map(x => x.trim()))
    );

    const fgCSS = styleObj['color'];
    const bgCSS = styleObj['background-color'];
    if (!fgCSS || !bgCSS) continue;

    const fg = toRGB(fgCSS);
    const bg = toRGB(bgCSS);
    if (!fg || !bg) {
      ctx.diagnostics.push({
        line,
        severity: 'warning',
        message: `Un‑parsable color "${fgCSS}" or "${bgCSS}" on line ${line}`
      });
      continue;
    }

    const r = +ratio(fg, bg).toFixed(2);

    all.push({
      line,
      content,
      foreground: fgCSS,
      background: bgCSS,
      contrastRatio: r
    });

    if (!perLine[line] || perLine[line] > r) {
      perLine[line] = r; // track lowest contrast for the line
    }
  }

  ctx.contrast = {
    scopes: ['line'],
    data: { line: perLine }
  };

  ctx.count ??= {};
  ctx.count.contrast = { line: perLine };

  ctx.previous = {
    target: 'contrast',
    scopes: ['line']
  };

  return {
    target: 'contrast',
    scopes: ['line'],
    data: { line: perLine }
  };
}
