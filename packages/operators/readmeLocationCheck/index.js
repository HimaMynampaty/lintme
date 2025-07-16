export async function run(ctx) {
  const readmes = ctx.fetchResult?.readmes || [];
  if (readmes.length === 0) {
    const msg =
      "No README.md files were found from the previous step. Make sure you ran 'fetchFromGithub' with fetchType: \"path\" first.";
    ctx.diagnostics.push({ line: 1, severity: "error", message: msg });

    return {
      data: {
        success: false,
        violations: [{ line: 1, severity: "error", message: msg }]
      }
    };
  }

  const counts = { root: 0, folder: 0, nested: 0 };
  for (const { path } of readmes) {
    counts[classify(path)]++;
  }

  const violations = [];
  if (counts.root === 0) {
    violations.push({
      line: 1,
      severity: "warning",
      message:
        "Top level README.md is missing. Add one to the repository root for better discoverability."
    });
    ctx.diagnostics.push(...violations);
  }

  return {
    data: {
      success: violations.length === 0,
      violations,
      counts,
      paths: readmes.map(r => r.path)
    }
  };
}

function classify(path) {
  const depth = path.split("/").length - 1;
  if (depth === 0) return "root";
  if (depth === 1) return "folder";
  return "nested";
}
