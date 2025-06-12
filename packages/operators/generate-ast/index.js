import { fromMarkdown } from 'mdast-util-from-markdown';
import { gfm } from 'micromark-extension-gfm';
import { gfmFromMarkdown } from 'mdast-util-gfm';

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
  const ast = fromMarkdown(ctx.markdown, {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()]
  });

  ctx.ast = ast;
  return ctx;
}
