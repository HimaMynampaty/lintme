import { parseRules } from './utils/parseRules.js';
import { OPERATORS } from './operator-registry.js';

/**
 *
 * @param {string} yamlText   – the rule YAML block
 * @param {string} markdown   – raw README markdown
 * @returns {Promise<object>} – final ctx (includes ctx.ast, diagnostics etc.)
 */
export async function runPipeline(yamlText, markdown) {
  const parsed = parseRules(yamlText);
  if (parsed.error) throw new Error(parsed.error);

  const { pipeline = [] } = parsed;
  /** @type {object} */
  const ctx = { markdown, diagnostics: [] };

  const generateAST = await OPERATORS['generateAST']();
  await generateAST(ctx);

  for (const step of pipeline) {
    const opName = step.operator;
    const loader  = OPERATORS[opName];

    if (!loader) {
      ctx.diagnostics.push({
        severity: 'error',
        message: `Unknown operator "${opName}"`,
      });
      continue;
    }

    const run = await loader();        
    await run(ctx, step);
  }


  return ctx;
}
export { parseRules } from './utils/parseRules.js';
