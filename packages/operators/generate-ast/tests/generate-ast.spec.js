import { test, expect } from 'vitest';
import { run as generateAST } from '../index.js';
import { createCtx } from '../../test-utils/pipelineContext.js';

test('adds ctx.ast', () => {
  const ctx = createCtx('# Heading');
  generateAST(ctx);
  expect(ctx.ast).toBeTruthy();
  expect(ctx.ast.type).toBe('root');
});
