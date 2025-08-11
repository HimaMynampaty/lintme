export async function run(ctx, cfg = {}) {
  ctx.diagnostics ??= [];

  const {
    //apiBase = 'http://localhost:5000',
    apiBase = 'https://lintme-backend.onrender.com',
    timeout = 5000
  } = cfg;

  const commands = collectInlineCommands(ctx)
    .map(({ content, line }) => ({
      command: stripBackticks(String(content || '')).trim(),
      position: Number.isFinite(line) ? line : null
    }))
    .filter(c => c.command.length > 0);

  if (!commands.length) {
    ctx.diagnostics.push({
      line: 1,
      severity: 'info',
      message: 'execute: no inline commands found to run.'
    });
    return { data: { commands: [], results: [] } };
  }

  let results = [];
  try {
    const res = await fetch(`${apiBase}/api/validate-commands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        commands,
        timeout,
        safe_mode: true
      })
    });
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    results = await res.json();
  } catch (err) {
    ctx.diagnostics.push({
      line: 1,
      severity: 'error',
      message: `execute: backend call failed: ${err.message}`
    });
    return { data: { commands, results: [] } };
  }

  results.forEach(r => {
    if (!r.success) {
      ctx.diagnostics.push({
        line: Number.isFinite(r.line) ? r.line : 1,
        severity: 'warning',
        message: `Command failed: "${r.command}" — ${r.message || 'Unknown error'}`
      });
    }
  });

  ctx.execute = { commands, results };
  return { data: { commands, results } };
}


function stripBackticks(s) {
  return s.replace(/^`+|`+$/g, '');
}

function collectInlineCommands(ctx) {
  const prev = ctx.extracted;

  if (
    prev &&
    (prev.target === 'inlineCode' || prev?.data?.target === 'inlineCode')
  ) {

    const data = prev.data ?? {};
    const list =
      Array.isArray(data.document) ? data.document
      : Array.isArray(data.inlineCode) ? data.inlineCode
      : Array.isArray(data) ? data
      : [];

    const out = [];
    for (const item of list) {
      if (typeof item === 'string') {
        out.push({ content: item, line: 1 });
      } else if (item && (item.content || item.text || item.value)) {
        out.push({ content: item.content ?? item.text ?? item.value, line: item.line ?? 1 });
      }
    }
    if (out.length) return out;
  }

  const lines = (ctx.markdown ?? '').split('\n');
  const out = [];
  const rx = /`([^`]*)`/g;
  lines.forEach((ln, i) => {
    let m;
    while ((m = rx.exec(ln)) !== null) {
      out.push({ content: m[1], line: i + 1 });
    }
  });
  return out;
}
