export function createCtx(markdown = '') {
  return {
    markdown,
    ast: undefined,
    extracted: undefined,
    counts: undefined,
    diagnostics: [],
  };
}
