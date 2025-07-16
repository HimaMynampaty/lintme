import fetch from "node-fetch";

export async function run(ctx, cfg = {}) {
  const {
    repo      = "",
    branch    = "main",
    fileName  = "README.md",
    fetchType = "content",
    apiBase   = process.env.BACKEND_URL || "http://localhost:5000"  // ⬅ configurable
  } = cfg;

  if (!repo || !fileName) {
    ctx.diagnostics.push({
      line: 1,
      severity: "error",
      message: "fetchFromGithub: repo and fileName are required."
    });
    return ctx;
  }

  try {
    const res = await fetch("https://lintme-backend.onrender.com/api/github-file", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repo, branch, fileName, fetchType })
    });

    if (!res.ok) {
      ctx.diagnostics.push({
        line: 1,
        severity: "error",
        message: `fetchFromGithub: backend returned ${res.status}`
      });
      return ctx;
    }

    const payload = await res.json();
    ctx.fetchResult = payload;

    ctx.diagnostics.push({
      line: 1,
      severity: "info",
      message: `fetchFromGithub: fetched ${fetchType} for ${fileName}`
    });
  } catch (err) {
    ctx.diagnostics.push({
      line: 1,
      severity: "error",
      message: `fetchFromGithub: ${err.message}`
    });
  }

  return ctx;
}
