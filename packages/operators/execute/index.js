export async function run(ctx, cfg = {}) {
  const {
    //apiBase = 'http://localhost:5000',
    apiBase = 'https://lintme-backend.onrender.com',
    timeout = 5000
  } = cfg;

  const commands = collectInlineFromDocument(ctx)
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

function collectInlineFromDocument(ctx) {
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
