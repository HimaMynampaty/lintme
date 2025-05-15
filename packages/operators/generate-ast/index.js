import { fromMarkdown } from 'mdast-util-from-markdown';

/**
 * @typedef {import('mdast').Root} Root
 */

/**
 *
 * @param {object} ctx              
 * @param {string} ctx.markdown    
 * @param {object} [config]      
 * @returns {object} ctx           
 */
export function run(ctx, config = {}) {
  /** @type {Root} */
  const ast = fromMarkdown(ctx.markdown);
  ctx.ast = ast;
  return ctx;
}
