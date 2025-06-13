import { test, expect } from 'vitest';
import { createCtx } from '../../test-utils/pipelineContext.js';
import { run as generateAST } from '../../generate-ast/index.js';
import { run as extract } from '../../extract/index.js';
import { run as count } from '../../count/index.js';
import { run as threshold } from '../index.js';

test('flags >2 emoji per line', () => {
  const md = ':rocket: :rocket: :rocket:\n';
  const ctx = createCtx(md);

  generateAST(ctx);
  extract(ctx, { target: 'emoji', scopes: ['line'] });
  count(ctx, {});
  threshold(ctx, {
    target: 'emoji',
    conditions: {
      line: { type: 'greaterthan', value: 2 }
    }
  });

  console.log('diagnostics:', ctx.diagnostics);

  const warn = ctx.diagnostics.find(d => d.severity === 'warning');
  expect(warn).toBeTruthy();
  expect(warn.message).toMatch(/threshold/);
});
