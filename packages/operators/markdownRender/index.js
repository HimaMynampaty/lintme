export async function run(ctx, cfg = {}) {
  const {
    renderer = 'marked',
    output = 'html',
    //apiBase  = 'http://localhost:5000'
    apiBase = 'https://lintme-backend.onrender.com'
  } = cfg;

  const markdown = ctx.markdown ?? '';
  if (!markdown.trim()) {
    ctx.diagnostics.push({
      line: 1,
      severity: 'error',
      message: 'markdownRender: No Markdown content to render.'
    });
    return ctx;
  }

  const endpoint = `${apiBase}/api/markdown-render`;
  const res = await fetch(endpoint, {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify({ markdown, renderer, output })
  });

  if (!res.ok) {
    ctx.diagnostics.push({
      line: 1,
      severity: 'error',
      message: `markdownRender: Server error — ${res.status} ${res.statusText}`
    });
    return ctx;
  }

  const { result } = await res.json();
  if (!result) {
    ctx.diagnostics.push({
      line: 1,
      severity: 'warning',
      message: 'markdownRender: No output received from server.'
    });
    return ctx;
  }

  if (output === 'html' || output === 'dom') {
    ctx.output = result;
  }

  ctx.markdownRender = { renderer, output, result };
  ctx.debug = { renderedLength: String(result).length };

  const scopes = ['document'];
  const data = {
    document: [
      {
        line: 1,
        content:
          output === 'image'
            ? `[Click the link to view the rendered image](${result})`
            : result
      }
    ]
  };

  return {
  scopes,
  data,
  markdownRender: { renderer, output, result }
};

}
