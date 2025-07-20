export async function run(ctx, cfg = {}) {
  const readmes = ctx.fetchResult?.readmes ?? [];

  if (readmes.length === 0) {
    const msg =
      'No README.md files were found from the previous step. Make sure the repository has a README file and you ran "fetchFromGithub" with fetchType: "path".';
    ctx.diagnostics.push({ line: 1, severity: 'error', message: msg });

    return {
      data: {
        success: false,
        violations: [{ line: 1, severity: 'error', message: msg }]
      }
    };
  }

  const counts = { root: 0, folder: 0, nested: 0 };
  for (const { path } of readmes) counts[classify(path)]++;

  const violations = [];

  if (counts.root === 0) {
    violations.push({
      line: 1,
      severity: 'warning',
      message:
        'Top level README.md is missing. Add one to the repository root for better discoverability.'
    });
  }

  const expected = Array.isArray(cfg.paths) ? cfg.paths : [];

  if (expected.length) {
    const matches = (pattern, actual) => {
      if (pattern.includes('*') || pattern.includes('.') || pattern.includes('.*')) {
        try {
          return new RegExp(pattern).test(actual);
        } catch (_) {}
      }
      return pattern === actual;
    };

    const missing = expected.filter(
      pat => !readmes.some(r => matches(pat, r.path))
    );

    if (missing.length) {
      for (const m of missing) {
        violations.push({
          line: 1,
          severity: 'error',
          message: `Missing README at expected path: ${m}`
        });
      }
    }
  }

  ctx.diagnostics.push(...violations);

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
  const depth = path.split('/').length - 1;
  if (depth === 0) return 'root';
  if (depth === 1) return 'folder';
  return 'nested';
}
