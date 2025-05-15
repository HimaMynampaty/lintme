export function createCtx(markdown = '') {
  return {
    markdown,
    ast: undefined,
    filtered: undefined,
    counts: undefined,
    diagnostics: [],
  };
}
