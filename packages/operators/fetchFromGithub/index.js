import fetch from "node-fetch";

export async function run(ctx, cfg = {}) {
  const {
    repo      = "",
    branch    = "main",
    fileName  = "README.md",
    fetchType = "content",
    apiBase   = "http://localhost:5000"
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
    const payloadBody = { repo, branch, fileName, fetchType };
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadBody)
    });

    if (!res.ok) {
      ctx.diagnostics.push({
        line: 1,
        severity: "error",
        message: `fetchFromGithub: Failed to retrieve '${fileName}' – status ${res.status}`
      });
      return ctx;
    }

    const payload = await res.json();
    ctx.fetchResult = payload;

    const { path, content, url } = payload;

    if (fetchType === "path") {
      if (!path || path !== fileName) {
        ctx.diagnostics.push({
          line: 1,
          severity: "error",
          message: `README not found at root (${url})`
        });
      } else {
        ctx.diagnostics.push({
          line: 1,
          severity: "info",
          message: `README found at root: '${url}'`
        });
      }

      ctx.debug = { readmePath: path || null, readmeURL: url || null };
    }

    else if (fetchType === "content") {
      if (content) {
        ctx.markdown = content;

        ctx.diagnostics.push({
          line: 1,
          severity: "info",
          message: `Loaded ${fileName} : ${content}`
        });

        ctx.debug = {
          preview: content.slice(0, 300) + (content.length > 300 ? "..." : ""),
          readmeURL: url
        };
      } else {
        ctx.diagnostics.push({
          line: 1,
          severity: "warning",
          message: `No content found in ${fileName}`
        });
      }
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
