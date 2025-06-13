import { describe, test, expect } from 'vitest';
import { run } from '../index.js';

function createCtx(overrides = {}) {
  return {
    diagnostics: [],
    extracted: null,
    markdown: '',
    ...overrides
  };
}

describe('isPresent operator', () => {
  test('errors if no extract present', () => {
    const ctx = createCtx();
    run(ctx, { target: 'alt' });

    expect(ctx.diagnostics).toHaveLength(1);
    expect(ctx.diagnostics[0].message).toMatch(/extract step/i);
  });

  test('errors if no target given', () => {
    const ctx = createCtx({ extracted: { data: {} } });
    run(ctx, {});

    expect(ctx.diagnostics).toHaveLength(1);
    expect(ctx.diagnostics[0].message).toMatch(/missing "target"/i);
  });

  test('passes when alt is present on all images (document scope)', () => {
    const ctx = createCtx({
      extracted: {
        target: 'image',
        data: {
          document: [
            { line: 3, alt: 'desc', url: 'a' },
            { line: 5, alt: 'another', url: 'b' }
          ]
        }
      }
    });

    run(ctx, { target: 'alt', scope: 'document' });
    expect(ctx.diagnostics).toHaveLength(0);
  });

  test('flags missing alt on image nodes (document scope)', () => {
    const ctx = createCtx({
      extracted: {
        target: 'image',
        data: {
          document: [
            { line: 3, alt: '', url: 'a' },
            { line: 5, url: 'b' }
          ]
        }
      }
    });

    run(ctx, { target: 'alt', scope: 'document' });
    expect(ctx.diagnostics).toHaveLength(2);
    expect(ctx.diagnostics[0].message).toMatch(/Missing "alt"/);
  });

  test('flags empty emoji match array (document scope)', () => {
    const ctx = createCtx({
      extracted: {
        target: 'emoji',
        data: { document: [] }
      }
    });

    run(ctx, { target: 'emoji', scope: 'document' });
    expect(ctx.diagnostics).toHaveLength(1);
    expect(ctx.diagnostics[0].message).toMatch(/missing any matches/i);
  });

  test('flags paragraph-level missing matches', () => {
    const ctx = createCtx({
      extracted: {
        target: 'emoji',
        data: {
          paragraph: [
            { line: 4, matches: [] },
            { line: 6, matches: ['😀'] }
          ]
        }
      }
    });

    run(ctx, { target: 'emoji', scope: 'paragraph' });
    expect(ctx.diagnostics).toHaveLength(1);
    expect(ctx.diagnostics[0].line).toBe(4);
  });

  test('flags line-level emoji absence', () => {
    const ctx = createCtx({
        markdown: 'hi\nhello 😀\nthird\n',
        extracted: {
        target: 'emoji',
        data: {
            line: {
            2: ['😀']
            }
        }
        }
    });

    run(ctx, { target: 'emoji', scope: 'line' });

    expect(ctx.diagnostics).toHaveLength(3);
    expect(ctx.diagnostics[0].line).toBe(1);
    expect(ctx.diagnostics[1].line).toBe(3);
      expect(ctx.diagnostics[2].line).toBe(4);
    });


  test('flags missing newline at EOF', () => {
    const ctx = createCtx({
      markdown: 'hi',
      extracted: {
        target: 'newline',
        data: {
          endoffile: []
        }
      }
    });

    run(ctx, { target: 'newline', scope: 'endoffile' });
    expect(ctx.diagnostics).toHaveLength(1);
    expect(ctx.diagnostics[0].message).toMatch(/end of file missing/i);
  });

  test('passes when match array has data', () => {
    const ctx = createCtx({
      extracted: {
        target: 'emoji',
        data: {
          document: ['😀']
        }
      }
    });

    run(ctx, { target: 'emoji', scope: 'document' });
    expect(ctx.diagnostics).toHaveLength(0);
  });
});
