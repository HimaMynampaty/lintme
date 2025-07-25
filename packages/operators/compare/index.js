export async function run(ctx, cfg = {}) {
  const {
    baseline,
    against,
    level = 'error',
    crossPlatform = false,
    //apiBase = 'http://localhost:5000'
    apiBase = 'https://lintme-backend.onrender.com'
  } = cfg;

  const steps = ctx.pipelineResults ?? [];
  if (!steps[baseline - 1] || !steps[against - 1]) {
    ctx.diagnostics.push({
      line: 1,
      severity: 'error',
      message: 'compare: invalid baseline / against index'
    });
    return {};
  }

  const stepA = steps[baseline - 1];
  const stepB = steps[against - 1];

  const dataA = stepA.data?.data ?? stepA.data ?? {};
  const dataB = stepB.data?.data ?? stepB.data ?? {};

  const renderMetaA = stepA.markdownRender || stepA.data?.markdownRender;
  const renderMetaB = stepB.markdownRender || stepB.data?.markdownRender;

  if (isImageRender(renderMetaA) && isImageRender(renderMetaB)) {
    const imgA = extractImageURL(dataA);
    const imgB = extractImageURL(dataB);

    if (imgA && imgB) {
      try {
        const resp = await fetch(`${apiBase}/api/image-diff`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageA: imgA, imageB: imgB })
        });

        if (!resp.ok) {
          const txt = await safeText(resp);
          ctx.diagnostics.push({
            line: 1,
            severity: 'error',
            message: `image-diff backend error (${resp.status}) ${txt}`
          });
          return {};
        }

        const diffResult = await resp.json();
        ctx.diagnostics.push({
          line: 1,
          severity: diffResult.changedPixels ? level : 'info',
          message: `Image diff: ${diffResult.changedPixels} pixels changed · [diff](${diffResult.diff})`
        });

        return {
          scopes: ['image_diff'],
          data: {
            image_diff: diffResult
          }
        };
      } catch (err) {
        ctx.diagnostics.push({
          line: 1,
          severity: 'error',
          message: `image-diff call failed: ${err.message}`
        });
        return {};
      }
    }
  }

  const shouldCrossPlatform =
    crossPlatform ||
    (isHtmlLike(renderMetaA) && isHtmlLike(renderMetaB));

  if (shouldCrossPlatform && ctx.markdown) {
    try {
      const body = {
        markdown: ctx.markdown,
        compare : {
          first : renderMetaA?.renderer || 'marked',
          second: renderMetaB?.renderer || 'puppeteer',
          image : { enabled: false }
        }
      };

      const resp = await fetch(`${apiBase}/api/cross-platform-diff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!resp.ok) {
        const txt = await safeText(resp);
        ctx.diagnostics.push({
          line: 1,
          severity: 'error',
          message: `cross-platform backend error (${resp.status}) ${txt}`
        });
        return {};
      }

      const result = await resp.json();

      if (result.formattedRawDiff) {
        result.formattedRawDiff.split('\n').forEach((line, idx) => {
          if (!line.trim()) return;
          ctx.diagnostics.push({
            line: result.lineNumbers?.[idx] || 1,
            severity: level,
            message: line
          });
        });
      }

      if (Array.isArray(result.domDiff)) {
        result.domDiff.forEach((d, i) => {
          ctx.diagnostics.push({
            line: result.lineNumbers?.[i] || 1,
            severity: level,
            message: `DOM diff: ${truncate(JSON.stringify(d), 200)}`
          });
        });
      }

      if (result.pngDiff) {
        ctx.diagnostics.push({
          line: 1,
          severity: level,
          message: `Screenshot diff: ${result.pixelChanges} pixel changes`
        });
      }

      return {
        scopes: ['dom_diff', 'raw_html_diff'],
        data: {
          dom_diff: result.domDiff || [],
          raw_html_diff: result.formattedRawDiff || '',
          cross_platform_meta: {
            rendererA: result.rendererA,
            rendererB: result.rendererB,
            pixelChanges: result.pixelChanges ?? null,
            pngDiff: result.pngDiff || null
          }
        }
      };
    } catch (err) {
      ctx.diagnostics.push({
        line: 1,
        severity: 'error',
        message: `cross-platform call failed: ${err.message}`
      });
    }
  }

  return classicObjectCompare(dataA, dataB, ctx, level);
}

function isImageRender(meta) {
  return meta?.output === 'image';
}

function isHtmlLike(meta) {
  return meta?.output === 'html' || meta?.output === 'dom';
}

function extractImageURL(data) {
  const txt = data?.document?.[0]?.content;
  if (!txt) return null;
  const mdMatch = txt.match(/\((https?:\/\/[^\s)]+\.(?:png|jpe?g|gif))\)/i);
  if (mdMatch) return mdMatch[1];
  const direct = txt.trim();
  if (/^https?:\/\/.+\.(png|jpe?g|gif)$/i.test(direct)) return direct;
  return null;
}

async function safeText(resp) {
  try { return await resp.text(); } catch { return '<no-body>'; }
}

function truncate(str, n) {
  return str.length > n ? str.slice(0, n - 1) + '…' : str;
}

function classicObjectCompare(A, B, ctx, severity) {
  const scope = (A.document && B.document) ? 'document'
    : Object.keys(A)[0] || 'document';

  const aVal = A[scope] ?? [];
  const bVal = B[scope] ?? [];

  const keyOf = (x) => {
    if (typeof x === 'string') return x.toLowerCase();
    if (x && typeof x === 'object') {
      return (
        x.url ?? x.slug ?? x.content ?? JSON.stringify(x)
      ).toLowerCase();
    }
    return String(x);
  };

  const setA = new Set(aVal.map(keyOf));
  const setB = new Set(bVal.map(keyOf));
  const missing = aVal.filter(x => !setB.has(keyOf(x)));
  const extra   = bVal.filter(x => !setA.has(keyOf(x)));

  missing.forEach(item => {
    ctx.diagnostics.push({
      line: item?.line ?? 1,
      severity,
      message: `Compare failed for: ${pretty(item)}`
    });
  });

  extra.forEach(item => {
    ctx.diagnostics.push({
      line: item?.line ?? 1,
      severity,
      message: `Compare found extra: ${pretty(item)}`
    });
  });

  return {
    scopes: [scope],
    data: {
      [scope]: {
        missing: missing.map(pretty),
        extra:   extra.map(pretty)
      }
    }
  };

  function pretty(x) {
    return typeof x === 'string'
      ? x
      : x.content ?? x.url ?? x.slug ?? JSON.stringify(x);
  }
}
