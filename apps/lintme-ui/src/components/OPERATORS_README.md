# LintMe Operators

This file is generated from the JSON schemas in `src/lib/operatorSchemas/*`.

<!-- BEGIN:OPS-TABLE -->

| Operator | Description | Fields | Required |
|---|---|---|---|
| `calculateContrast` | Measures foreground/background contrast for inline HTML extracted from Markdown and records the lowest ratio per line. Flags insufficient contrast to support WCAG compliance. | — | — |
| `codeBlockFormatting` | Ensures Markdown code blocks follow consistent style(fenced, indented) and allowed language tags, helping maintain a uniform and readable document structure. | `allowedLanguages`, `allowedFormats` | — |
| `compare` | Compares outputs from two earlier steps either structurally (missing/extra items) or by similarity scoring. | `baseline`, `against`, `comparison_mode`, `similarity_method`, `threshold` | `baseline`, `against` |
| `count` | Aggregates counts from the previous step’s extracted results and summarizes them by scope (e.g., per line, per paragraph, or per collection). | — | — |
| `customCode` | Executes user-provided JavaScript that defines `run(ctx)`. Useful for bespoke checks or quick experiments that don’t fit a built-in operator. | `code` | `code` |
| `detectDuplicateSentences` | Finds repeated sentences within the chosen scope and reports duplicates with line references. | `scope` | — |
| `detectHateSpeech` | Flags potentially offensive, biased, or hateful language within the chosen scope and annotates findings with line numbers. | `scope` | — |
| `evaluateUsingLLM` | Evaluates the current document against a provided rule definition using an LLM and returns PASS or FAIL with diagnostics. | `model`, `ruleDefinition` | — |
| `execute` | Runs inline commands found in the README. Prefers the previous `extract` (target: inlineCode) output when available; otherwise scans backtick code spans. | `timeout` | — |
| `extract` | Finds Markdown nodes or text matches (including built-ins like emoji/newline/date and regex patterns) and returns them grouped by requested scopes. | `target`, `scopes` | — |
| `fetchFromGithub` | Fetches README files (paths or content) or repository metadata from a GitHub repo via a backend endpoint. | `repo`, `branch`, `fileName`, `fetchType`, `metaPath`, `useCustomMetaPath` | `repo` |
| `fixUsingLLM` | Calls an LLM with a rule-aware prompt to produce a fixed version of the Markdown when the rule is violated. | `model`, `prompt` | `prompt` |
| `isLinkAlive` | Checks all external links found in the Markdown content to verify they are reachable and return an allowed HTTP status code. | `timeout`, `allowed_status_codes` | — |
| `isPresent` | Checks that a specific attribute is present on each extracted node. Supported attributes depend on the extracted target type: image (alt, title, url), link (title, url), code (lang), listItem (checked), paragraph (content), heading (depth). You can also specify any custom field name extracted earlier in the pipeline. | `target` | `target` |
| `length` | Calculates the total text length for extracted nodes in the given scopes (document, paragraph, line, or endoffile). | — | — |
| `markdownRender` | Renders Markdown using a selected renderer and returns HTML, a serialized DOM snippet, or a URL to a rendered image. | `renderer`, `output` | `renderer`, `output` |
| `readmeLocationCheck` | Validates that README.md files exist in expected locations of a repository. Uses README paths discovered by a previous fetchFromGithub step (fetchType: "path"). You can optionally supply expected paths or patterns (exact paths or regex-like patterns) to enforce specific locations. | `paths` | — |
| `regexMatch` | Flags lines that DO match (mode: "match") or do NOT match (mode: "unmatch") one or more regular expressions. Can run on the whole document or on the previous step's structured output. | `patterns`, `mode`, `scope` | `patterns` |
| `sage` | Converts headings from the previous extract step into GitHub-style slug anchors (e.g., "My Title" → "#my-title"). No configuration required. | — | — |
| `search` | Finds lines or values containing one or more comma-separated terms. Can scan the whole Markdown document or walk the previous step’s structured output. | `query`, `scope` | `query` |
| `threshold` | Compares computed metrics from a previous step (e.g., count or length) against threshold rules per scope and reports violations. | `conditions` | `conditions` |

<!-- END:OPS-TABLE -->
