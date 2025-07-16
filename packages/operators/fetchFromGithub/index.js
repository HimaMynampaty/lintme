import fetch from "node-fetch";

export async function run(ctx, cfg = {}) {
  const {
    repo      = "",
    branch    = "main",
    fileName  = "README.md",
    fetchType = "content",
    apiBase   = "https://lintme-backend.onrender.com"
  } = cfg;

  const endpoint = `${apiBase}/api/github-file`;
  console.log("[fetchFromGithub] Calling:", endpoint);

  if (!repo) {
    ctx.diagnostics.push({
      line: 1,
      severity: "error",
      message: "fetchFromGithub: 'repo' is required."
    });
    return ctx;
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repo, branch, fileName, fetchType })
    });

if (!res.ok) {
  const text = await res.text();
  let message = `fetchFromGithub: backend returned ${res.status}`;
  try {
    const json = JSON.parse(text);
    if (json?.error) {
      message = `fetchFromGithub: ${json.error}`;
    }
  } catch (_) {
    // do nothing
  }

  ctx.diagnostics.push({
    line: 1,
    severity: "error",
    message
  });
  return ctx;
}


    const payload = await res.json();
    ctx.fetchResult = payload;

    const readmes = payload.readmes || [];
    if (!readmes.length) {
      ctx.diagnostics.push({
        line: 1,
        severity: "error",
        message: `No README.md files found in '${repo}'`
      });
      return ctx;
    }

    ctx.internalInfo = [];

    if (fetchType === "path") {
      for (const { path, url } of readmes) {
        ctx.internalInfo.push({
          line: 1,
          severity: "info",
          message: `README found: ${url}`
        });
      }

      ctx.debug = {
        foundPaths: readmes.map(r => r.path),
        foundURLs : readmes.map(r => r.url)
      };

      return {
        data: {
          paths: readmes.map(r => r.path),
          urls : readmes.map(r => r.url)
        }
      };
    }

    if (fetchType === "content") {
      ctx.markdown = "";

      for (const { path, content, url } of readmes) {
        ctx.markdown += `\n\n## ${path}\n\n${content}`;
        ctx.internalInfo.push({
          line: 1,
          severity: "info",
          message: `Loaded README: ${url} ${content})`
        });
      }

      ctx.debug = {
        readmeCount: readmes.length,
        combinedLength: ctx.markdown.length
      };

      return {
        data: {
          files: readmes.map(r => ({
            path: r.path,
            url: r.url,
            length: r.content.length
          }))
        }
      };
    }

  } catch (err) {
    ctx.diagnostics.push({
      line: 1,
      severity: "error",
      message: `fetchFromGithub: ${err.message}`
    });
  }

  return ctx;
}
