export async function run(ctx, cfg = {}) {
  const {
    apiBase = 'https://lintme-backend.onrender.com',
    //apiBase = 'http://localhost:5000',
    timeout = 5000,
    allowed_status_codes = [200, 301, 302, 308, 204],
  } = cfg;

  const allowed = Array.isArray(allowed_status_codes)
    ? allowed_status_codes.map(Number)
    : [200, 301, 302, 308, 204];

  const prev =
    ctx.extracted?.data?.document ??
    ctx.fetchResult?.data?.document ??
    ctx.fetchResult?.document ??
    [];

  const urls = [];
  for (const row of prev) {
    const line = row?.line ?? 1;
    const content = String(row?.content ?? '');
    const md = content.match(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/);
    if (md?.[1]) {
      urls.push({ url: md[1], line });
      continue;
    }
    const raw = content.match(/\bhttps?:\/\/\S+/);
    if (raw?.[0]) urls.push({ url: raw[0], line });
  }

  const byUrl = new Map();
  for (const u of urls) if (!byUrl.has(u.url)) byUrl.set(u.url, u);
  const unique = [...byUrl.values()];

  if (!unique.length) {
    ctx.diagnostics.push({
      line: 1,
      severity: 'info',
      message: 'No external links to validate.',
    });
    return { scopes: ['document'], data: { checks: [] } };
  }

  const pool = 8;
  const results = [];
  let i = 0;

  async function worker() {
    while (i < unique.length) {
      const item = unique[i++];
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), timeout);

        const resp = await fetch(`${apiBase}/api/check-link`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: item.url }),
          signal: ctrl.signal,
        });

        clearTimeout(t);

        let status = 0;
        try {
          const json = await resp.json();
          status = Number(json?.status ?? 0);
        } catch {}

        const ok = allowed.includes(status);
        results.push({ ...item, status, ok });
      } catch (err) {
        results.push({ ...item, status: 0, ok: false, error: err.message });
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(pool, unique.length) }, worker));

  for (const r of results.filter(x => !x.ok)) {
    const msg = r.status
      ? `External link failed (${r.status}): ${r.url}`
      : `External link request failed/timeout: ${r.url}`;
    ctx.diagnostics.push({ line: r.line ?? 1, severity: 'error', message: msg });
  }

  ctx.linkAvailability = {
    ok: results.filter(r => r.ok),
    bad: results.filter(r => !r.ok),
  };

  return {
    scopes: ['document'],
    data: { checks: results },
  };
}
