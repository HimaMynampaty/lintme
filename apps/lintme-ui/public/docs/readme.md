<a id="top"></a>
# LintMe - Markdown Linter
LintMe is a Markdown linting tool focused on README files, designed to help users detect, fix, and improve documentation quality through a combination of rule-based checks, customizable operators, and LLM-powered suggestions.
<p align="center">
  <img src="images/ruleEditor.png" alt="LintMe rule editor" width="48%">
  <img src="images/rulesRunner.png" alt="LintMe rules runner" width="48%">
</p>

## Table of Contents
- [Introduction](#introduction)
- [How to install](#how-to-install)
- [Related work](#related-work)
- [Quick Start](#quick-start)
- [Related Work](#related-work)
- [LintMe Operators](#lintme-operators)
- [Lint Rules](#lint-rules)
- [Porject Status](#project-status)
- [Project Plans](#project-plans)

## Introduction
LintMe is a Markdown linter that helps maintainers and contributors keep documentation clear, complete, and runnable by combining fast, programmatic checks with targeted LLM judgments. It catches style issues (e.g., broken links, code-fence integrity) and content problems (e.g., jargon-heavy language), and lets you adapt rules to your context using lightweight, composable operators.

LintMe enables presets(sets of rules) and rule-level customization so your README passes the standards that matter in your field.

## How to install

### Requirements
- **Node.js 18+** (for global `fetch`)
- **npm**, **yarn**, or **pnpm**

Check your Node version:
```bash
node -v
```

### Global install (recommended)
```bash
npm i -g lintme-cli
# or
yarn global add lintme-cli
# or
pnpm add -g lintme-cli
```

Verify:
```bash
lintme --help
```

### Local (per-project) install
```bash
npm i -D lintme-cli
# or
yarn add -D lintme-cli
# or
pnpm add -D lintme-cli
```

Run with npx:
```bash
npx lintme --help
```
[back to top](#top)

---

## Quick start

Please follow [Global install (recommended)](#global-install-recommended) so the `lintme` command is available in your shell.

### Apply a single rule to a Markdown file
Please replace lintrule.yaml and Readme.md with actual paths to yaml rules and markdown file.

Note: Sample yaml rules and markdowns are present in `apps\lintme-ui\examples`, but we will be updating the complete list.
```bash
lintme run --rule lintrule.yaml --in README.md
```

### Run multiple rules
Repeat `--rule`:
```bash
lintme run \
  --rule lintrule-1.yaml \
  --rule lintrule-2.yaml \
  --in README.md
```
### List presets
Please replace rulePresets.js with actual paths to the preset file. It is present at `apps\lintme-ui\src\lib\rulePresets.js`
```bash
lintme run --list-presets --presets rulePresets.js
```

### Apply a preset 
Please replace the preset name using the option `--preset` and provide path to the location of yaml rules folder in `--rules-dir`
```bash
lintme run \
  --preset software \
  --presets rulePresets.js \
  --rules-dir ./rules \
  --in README.md
```

### Apply fixes
Print only the fixed Markdown to stdout:
```bash
lintme run -r lintrule.yaml --in README.md --fix
```

Write the fixed Markdown back to the file (this will override the contents of the original markdown):
```bash
lintme run -r lintrule.yaml --in README.md --write
```

### Alternative: use `npx` (without global install)
```bash
npx lintme-cli run --rule lintrule.yaml --in README.md
```

[back to top](#top)

---

## Related work 
Documentation quality strongly influences usability and onboarding. Existing linters cover pieces of the problem:
- **Structure/format:** `markdownlint`, `remark-lint`, `mdformat`
- **Language/style & inclusivity:** `proselint`, `write-good`, `textlint`, `alex`, Grammarly
- **Docs- or domain-specific:** GitHub `content-linter`, `standard-readme`, `awesome-lint`, `commitlint`, job post linters
- **Automated/LLM-based assessment:** recent systems score or fix docs, but are often fixed-rule or narrow in scope

**LintMe** generalizes this space by letting users compose **programmatic operators** with **optional LLM checks and fixes**, so projects can enforce standards that match their context rather than a one-size-fits-all rule set.

![Comparison matrix of documentation linters](images/markdownLinters.png)

[back to top](#top)

## LintMe Operators

This file is generated from the JSON schemas in `src/lib/operatorSchemas/*`.
Edit above/below the markers freely; the table between them is auto-generated.

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
[back to top](#top)

## Lint Rules

_Last updated: 2025-08-21 02:13 UTC_

| Name | Category | Description | Operators Used |
|---|---|---|---|
| bestPracticesGuidelines(LLM) | content | Ensures the document advises users on security best practices, like not using environment variables for secrets. | evaluateUsingLLM |
| citationBibTeXPresent | content | Ensure the README includes at least one BibTeX entry (e.g., for citation purposes) | extract, search, count, threshold |
| codeBlockExecution(LLM) | content | Checks all code blocks in the README for potential errors, incorrect usage, or missing steps by analyzing them with an LLM | evaluateUsingLLM |
| compareMarkdownRenderings | content | Compares Markdown renderings across different engines and formats (e.g., image, HTML, DOM) to detect visual or structural differences between them. | markdownRender, compare |
| compareReadmeSimilarity | content | Compare README files from two sources using cosine similarity and require at least 80% similarity. | fetchFromGithub, compare |
| consistentExternalLinkFormat | content | Ensures all URLs use a valid HTTPS format for secure and consistent URL usage. | extract, regexMatch |
| dateValidationLint | content | This rule checks that all dates in the Markdown file follow the format DD/MM/YYYY. It helps ensure consistency. | regexMatch |
| demoLinkRequiredLint | content | This rule checks that the file includes at least one link containing the word demo. It ensures that documentation provides access to a working demonstration, which helps users better understand and evaluate the project. | extract, search, count, threshold |
| demoLinkRequiredLint - Interactive systems | content | This rule checks that the file includes at least one link containing the word demo. It ensures that documentation provides access to a working demonstration, which helps users better understand and evaluate the project. | extract, search, count, threshold |
| detectDuplicateSentences | content | Detects repeated full-line sentences in the document. Flags lines that appear more than once, which may indicate redundancy or copy-paste errors. | detectDuplicateSentences |
| githubContributorCheck | content | Checks if the specified GitHub repository has any contributors matching a given name. | fetchFromGithub, search, count, threshold |
| jargonExplanationCheck(LLM) | content | Ensures jargon is avoided or clearly explained for general audience understanding. | fixUsingLLM |
| limitWordRepetition | content | Flags documents that overuse filler or weak words like basically, repeat, or actually. Helps reduce redundancy and improve clarity by enforcing a maximum of two uses per term. | search, count, threshold |
| minimumReadmeLength | content | Checks whether the README contains more than 1000 characters of text, ensuring sufficient content depth and substance. | extract, length, threshold |
| minimumReadmeLength - Interactive systems | content | Checks whether the README contains more than 1000 characters of text, ensuring sufficient content depth and substance. | extract, length, threshold |
| noUnreachableLinks | content | Ensures all external links are valid and reachable by checking their HTTP status codes. | extract, isLinkAlive |
| objectivityCheck(LLM) | content | Ensures that information is factual, unbiased, and clearly presented, avoiding promotional or vague language. | fixUsingLLM |
| richContentCheck | content | This rule ensures that a healthy mix of content types, such as headings, images, and emphasis are included. It encourages structured, visually engaging, and well-emphasized content to improve readability and user experience. | extract, count, threshold |
| textContrastCompliance | content | Ensures that text elements within the HTML document maintain a minimum contrast ratio of 4.5:1, in line with WCAG AA accessibility standards, to support visual clarity and readability for users with visual impairments. | extract, calculateContrast, threshold |
| timelinessCheckVersionUpdate(LLM) | content | Ensures the Markdown includes the tools version and it matches the latest GitHub release | fetchFromGithub, evaluateUsingLLM |
| validateInlineCommands | content | Run inline commands from README and report failures using the OS shell(Windows) | extract, execute |
| validateLinkFormatting | content | Validates that all external links in markdown are correctly formatted with matching brackets, parentheses, and non-empty text and URLs. | extract, regexMatch, count, threshold |
| valueAddedLint | content | This rule checks that the file includes meaningful and helpful content such as integration guides, extendability notes, documentation links, or descriptions of advantages. It encourages content that adds value for users by supporting learning, reuse, and deeper understanding. | search, count, threshold |
| ambiguityUnderstandabilityCheck(LLM) | sensitive | Checks that instructions and terminology are clear, unambiguous, and appropriate for the target audience. Uses a language model to improve understandability and ensure the content is easy to follow. | fixUsingLLM |
| customCodeHateSpeech | sensitive | Flags potentially offensive, profane, or insensitive language in markdown content using retext-equality and retext-profanities. | customCode |
| detectHateSpeechLint(LLM) | sensitive | Detects harmful, biased, or profane language in Markdown content and uses a language model to suggest respectful, inclusive alternatives. | detectHateSpeech, fixUsingLLM |
| detectSensitiveSecrets | sensitive | Detects hardcoded secrets like API keys, tokens, and private keys | regexMatch, count, threshold |
| ensureNeutralTone(LLM) | sensitive | Uses a language model to assess whether the content maintains a credible and trustworthy tone that reflects a high standard of reputation. | fixUsingLLM |
| checkBackToTopLinkPresence | structure | Verify that internal links include common Back to top phrases to support in-page navigation and accessibility. Helps ensure users can easily return to the beginning of the document. | extract, search, count, threshold |
| codeBlockLanguageCheck | structure | Ensure all code blocks specify a language tag for syntax highlighting. | extract, isPresent |
| customCodeSentenceLength | structure | Detects markdown lines that exceed a configurable word count for better readability. | customCode |
| enforceNewLineAtEOF | structure | This rule ensures that a Markdown file ends with exactly one newline character. It helps maintain consistency across files and prevents formatting issues in some tools and version control systems. | extract, count, threshold |
| ensureReadmeIsPresent | structure | Ensures that the repository contains a top-level README.md file for better visibility and documentation. Fetches README locations from GitHub and checks if a root-level file exists. | fetchFromGithub, readmeLocationCheck |
| quickStartSectionCheck | structure | Ensures the document includes a Quick Start or similar section to help users get started quickly. | extract, search, count, threshold |
| sectionCompleteness(LLM) | structure | Checks if all the standard sections are present | evaluateUsingLLM |
| sectionCompleteness(LLM) - Interactive systems | structure | Checks if all the standard sections are present | evaluateUsingLLM |
| tableOfContentsCheck | structure | Ensures that the document contains exactly one Table of Contents heading, such as TOC or Table of Contents, indicating proper navigation structure. | extract, search, count, threshold |
| validateInternalLinksToHeadings | structure | Checks that all internal links point to existing headings and that all headings are referenced by at least one internal link. Ensures navigability and structural integrity within the Markdown document. | extract, sage, compare |
| codeBlockConsistency | style | Ensures that all code blocks in the Markdown adhere to consistent formatting and language usage. | codeBlockFormatting |
| consistentHeadingFormat | style | Ensures all markdown headings follow the same style (e.g., all ATX or all Setext) to maintain consistent document formatting. | extract, regexMatch, count, threshold |
| consistentListFormat | style | Ensures all markdown list items use a consistent format (e.g., starting with -) for clean and readable structure. | extract, regexMatch, count, threshold |
| disallowConsecutiveDuplicateWords | style | Flags documents that contain consecutive repeated words (e.g., the the or is is). This rule helps eliminate redundancy and improves text clarity. | extract, regexMatch, count, threshold |
| enforceEmojiLimit | style | This rule limits the number of emojis in a Markdown file. It counts emojis at the document level, paragraph level, and line level, and checks that they do not exceed the allowed values. This helps keep the content clean, readable, and professional. | extract, count, threshold |
| fixSpellingAndGrammar(LLM) | style | This rule uses a language model to automatically correct spelling and grammar issues in the Markdown content. It helps ensure quality and clarity. | fixUsingLLM |
| headingListFormattingChecks | style | Ensures Markdown headings follow proper hierarchy and lists are correctly ordered and formatted | customCode |
| requireAltTextForImages | style | Ensures that all images in the Markdown document include descriptive alt text for accessibility and proper semantic structure. | extract, isPresent |
| sentenceLengthLimit | style | Ensures that each line in the document is shorter than 80 characters, promoting better readability and formatting consistency. | extract, length, threshold |
| sentenceLengthLimit - datasets | style | Ensures that each line in the document is shorter than 80 characters, promoting better readability and formatting consistency. | extract, length, threshold |
| terminologyConsistency(LLM) | style | Ensure consistent usage of enforced terminology in markdown content. | fixUsingLLM |

_Total rules: 49_

[back to top](#top)

## Project Status 
The tool is deployed and available to use at [Tool link](https://lintme.netlify.app/)
## Project Plans
This is a prototype to demonstrate the idea; we’re in the process of publishing and iterating, so rule formats, and defaults may change—please try it on sample READMEs (not production ready yet) and share feedback/issues to help prioritize more preset rule packs, stronger checks and fixes

## Contributors to the project 
`To be updated`

## Documentation links
The md files in this repository serve as a documentation to the tool. Link to a live demo `To be updated`

## Citation 
`To be updated`

## Contributions
`To be updated`

## Licensing
`To be updated`

[back to top](#top)