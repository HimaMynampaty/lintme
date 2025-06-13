import { test, expect } from 'vitest';
import { createCtx } from '../../test-utils/pipelineContext.js';
import { run as generateAST } from '../../generate-ast/index.js';
import { run as extract } from '../../extract/index.js';
import { run as count } from '../index.js';

test('newline counts per line and EOF', () => {
  const md = 'no newline at eof';        
  const ctx = createCtx(md);

  generateAST(ctx);
  extract(ctx, { target: 'newline', scopes: ['line', 'endoffile'] });
  count(ctx, {});

  expect(ctx.counts.newline.line[1]).toBe(0);
  expect(ctx.counts.newline.endoffile).toBe(0);
});
