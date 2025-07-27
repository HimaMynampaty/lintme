export const operatorDescriptions = {
  extract: 'Extract elements like headings, links, or code (based on the selected target) from Markdown, within a chosen scope.',
  count: 'Count how many matching items exist in the extracted result.',
  threshold: 'Check if a count crosses a threshold (e.g. ≥ 3, < 2).',
  fixUsingLLM: 'Suggest fixes using an AI model (LLM).',
  isPresent: 'Verify if something is present in the result from previous step.',
  length: 'Measure the length of a value (string, list, etc.).',
  regexMatch: 'Match values using a regular expression.',
  sage: 'Run a custom Sage rule (Turn markdown headings into TOC links).',
  search: 'Search for specific words or phrases.',
  compare: 'Compare values from different steps.',
  detectHateSpeech: 'Detect potentially hateful, biased, or offensive language using Retext.',
  fetchFromGithub: 'Access GitHub to fetch file path, file content, or repository metadata like languages, contributors, and more.',
  readmeLocationCheck: 'Validates presence and location of README.md files',
  markdownRender: 'Render Markdown using a chosen engine (e.g., marked, puppeteer) to generate HTML, DOM, or image output.',
  customCode: 'Run user-defined JavaScript on the input data'
};
