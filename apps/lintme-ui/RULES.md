# Lint Rules

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