export async function run(ctx, cfg = {}) {
  const { code = '' } = cfg;

  if (!code.trim()) {
    ctx.diagnostics.push({
      line: 1,
      severity: 'error',
      message: 'customCode: No code provided in configuration.'
    });
    return ctx;
  }

  try {
    const normalized = stripExports(code);

    const wrapper = `
${normalized}
if (typeof run !== 'function') {
  throw new Error('function run(ctx) not found');
}
return run(ctx);
`;
    const exec = new Function('ctx', wrapper);        
    const result = await Promise.resolve(exec(ctx));    

    return (result && typeof result === 'object') ? result : ctx;

  } catch (err) {
    ctx.diagnostics.push({
      line: 1,
      severity: 'error',
      message: `customCode: Error executing code – ${err.message}`
    });
    return ctx;
  }
}

function stripExports(src = '') {
  return src
    .replace(/^\s*export\s+(async\s+)?function\s+run/m, '$1function run')
    .replace(/^\s*export\s+default\s+/m, '');
}
