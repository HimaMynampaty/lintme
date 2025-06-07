export const operatorDescriptions = {
  extract: 'Extract elements like headings, links, or code (based on the selected target) from Markdown, within a chosen scope.',
  count: 'Count how many matching items exist in the extracted result.',
  threshold: 'Check if a count crosses a threshold (e.g. ≥ 3).',
  fixUsingLintMeCode: 'Apply a manual fix based on static rules.',
  fixUsingLLM: 'Suggest fixes using an AI model (LLM).',
  isPresent: 'Verify if something is present in the document.',
  length: 'Measure the length of a value (string, list, etc.).',
  regexMatch: 'Match values using a regular expression.',
  sage: 'Run a custom Sage rule (advanced logic).',
  search: 'Search for specific words or phrases.',
  compare: 'Compare values from different steps.',
};
