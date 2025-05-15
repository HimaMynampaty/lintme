import { test, expect } from 'vitest';
import { run as generateAST } from '../../generate-ast/index.js';
import { run as filter } from '../index.js';
import { createCtx } from '../../test-utils/pipelineContext.js';

test('filters emoji at line + paragraph scopes', () => {
  const md = 'Hello :rocket:\n\nLine two :tada:';
  const ctx = createCtx(md);

  generateAST(ctx);
  filter(ctx, { target: 'emoji', scopes: ['line', 'paragraph'] });

  expect(ctx.filtered.data.paragraph.length).toBe(2);

  expect(ctx.filtered.data.line[1].length).toBe(1);
  expect(ctx.filtered.data.line[3].length).toBe(1);
});
