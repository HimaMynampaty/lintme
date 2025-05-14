import { parseRules } from './utils/parseRules.js';
import { OPERATORS } from './operator-registry.js';

/**
 * Execute a YAML‑defined pipeline on a markdown string.
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

    const run = await loader();        // lazy import = no dead‑code in FE bundle
    await run(ctx, step);              // pass ctx + op‑specific config
  }

  return ctx;
}
