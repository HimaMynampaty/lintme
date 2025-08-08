export function run(ctx, cfg = {}) {
  const allowedLanguages = cfg.allowedLanguages;
  const allowedFormats = cfg.allowedFormats;
  const level = cfg.level ?? 'warning';

  if (!ctx.markdown || !ctx.ast) {
    ctx.diagnostics.push({
      line: 1,
      severity: 'error',
      message: 'Missing Markdown content or AST.'
    });
    return ctx;
  }

  const lines = ctx.markdown.split('\n');
  const violations = [];

  const checkFormats = Array.isArray(allowedFormats) && allowedFormats.length > 0;
  const allowFenced = checkFormats ? allowedFormats.includes('fenced') : true;
  const allowIndented = checkFormats ? allowedFormats.includes('indented') : true;

  let insideFencedBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const lineContent = lines[i];
    const trimmed = lineContent.trim();

    const malformedFence = trimmed.match(/^`{1,2}(\s*\w+)?$|^`{4,}\s*([^\s]+)?/);
    if (malformedFence) {
      const msg = 'Malformed code fence detected.';
      addViolation(ctx, violations, i + 1, msg, level);
      continue;
    }

    if (/^```/.test(trimmed)) {
      if (checkFormats && !allowFenced) {
        const msg = "Fenced code block used, but 'fenced' format is not allowed.";
        addViolation(ctx, violations, i + 1, msg, level);
      }
      insideFencedBlock = !insideFencedBlock;
      continue;
    }

    if (/^( {4}|\t)/.test(lineContent) && !insideFencedBlock && checkFormats && !allowIndented) {
      const msg = "Indented code block used, but 'indented' format is not allowed.";
      addViolation(ctx, violations, i + 1, msg, level);
    }

    if (insideFencedBlock) {
      const match = lineContent.match(/^( +)/);
      const spaceCount = match?.[1]?.length || 0;

      if (spaceCount > 0 && spaceCount % 4 !== 0) {
        const msg = `Incorrect indentation (${spaceCount} spaces).`;
        addViolation(ctx, violations, i + 1, msg, level);
      }

      if (/^ {0,3}\t|^\t {1,3}/.test(lineContent)) {
        const msg = "Mixed tabs and spaces detected in code block.";
        addViolation(ctx, violations, i + 1, msg, level);
      }
    }
  }

  const checkLanguages = Array.isArray(allowedLanguages) && allowedLanguages.length > 0;
  if (checkLanguages) {
    const codeBlocks = extractCodeBlocks(ctx.ast);

    for (const block of codeBlocks) {
      const line = block.line ?? 1;

      if (!block.lang) {
        const msg = "Code block missing language tag.";
        addViolation(ctx, violations, line, msg, 'error');
      } else if (!allowedLanguages.includes(block.lang)) {
        const msg = `Code block language '${block.lang}' is not allowed.`;
        addViolation(ctx, violations, line, msg, 'error');
      }
    }
  }

  return {
    target: 'codeblockformatting',
    data: { violations },
    passed: violations.length === 0
  };
}

function extractCodeBlocks(ast) {
  const codeBlocks = [];

  function traverse(node) {
    if (node.type === "code") {
      codeBlocks.push({
        lang: node.lang || "",
        value: node.value || "",
        line: node?.position?.start?.line ?? null
      });
    }
    if (node.children) node.children.forEach(traverse);
  }

  traverse(ast);
  return codeBlocks;
}

function addViolation(ctx, bucket, line, message, severity) {
  ctx.diagnostics.push({ line, severity, message });
  bucket.push({ line, message });
}
