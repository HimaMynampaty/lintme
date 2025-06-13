import { test, expect } from 'vitest';
import { run as generateAST } from '../../generate-ast/index.js';
import { run as extract } from '../index.js';
import { createCtx } from '../../test-utils/pipelineContext.js';

test('extracts emoji at line + paragraph scopes', () => {
  const md = 'Hello :rocket:\n\nLine two :tada:';
  const ctx = createCtx(md);

  generateAST(ctx);
  extract(ctx, { target: 'emoji', scopes: ['line', 'paragraph'] });

  expect(ctx.extracted.data.paragraph.length).toBe(2);

  expect(ctx.extracted.data.line[1].length).toBe(1);
  expect(ctx.extracted.data.line[3].length).toBe(1);
});
