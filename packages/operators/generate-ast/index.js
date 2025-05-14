// packages/operators/generate-ast/index.js
import { fromMarkdown } from 'mdast-util-from-markdown';

/**
 * @typedef {import('mdast').Root} Root
 */

/**
 * Run the generateAST operator.
 * It mutates the pipeline context by adding `ctx.ast`
 *
 * @param {object} ctx              – mutable pipeline context
 * @param {string} ctx.markdown     – the current markdown text
 * @param {object} [config]         – operator‑specific config (not used here)
 * @returns {object} ctx            – (for chaining)
 */
export function run(ctx, config = {}) {
  /** @type {Root} */
  const ast = fromMarkdown(ctx.markdown);
  ctx.ast = ast;
  return ctx;
}
