import { parseRules } from "./rulesParser.js";
import { generateAST } from "./markdownParser.js";
import { getImages, missingAltText  } from "./altTextImagesLint.js";
import { getInlineCommands, validateCommands, checkCommandFormatting  } from "./inlineCommandLint.js";
import {
    checkLinkFormatting,
    fixMalformedLinks,
    getLinksFromAST,
    validateInternalLinks,
    validateLinkAvailability,
    checkLinkSchemesUsingAST
} from "./linkValidationLint.js";
import { checkSensitiveData } from "./secureContentLint.js";
import {
    checkEndOfSupportMention
  } from "./timelinessLint.js";  
import { checkEmojiViolations } from "./emojiLint.js";
import { checkFileEndingViolations } from "./newLineEOF.js";
import { checkDateValidationViolations } from "./dateValidationLint.js";
import { checkGrammarOrSpelling } from "./grammarSpellingLint.js";
import { checkCodeFormatting } from "./codeFormattingLint.js";
import { runLLMValidation } from "./utils/llmUtils.js";
import {
    checkPageLevelRepetition,
    countTargetPhrases,
    checkASTTypeSummed,
    checkASTNodeLength
  } from "./utils/countThresholdUtil.js";
import { resolveWordsFromRuleConfig } from "./utils/wordUtils.js";
import {
    detectConsecutiveDuplicates,
    detectDuplicateSentences
  } from "./utils/duplicateUtils.js";
import {
hasTableOfContents,
generateTOC,
insertTOCIntoMarkdown
} from "./tableOfContentsLint.js";
import { detectHateSpeech, autoFixHateSpeech } from "./hateSpeechLint.js";
import { hasBackToTopLink, addBackToTopLink } from "./backToTopLint.js";
import {
  fetchHistoricalReadmesFromBackend
} from "./readmeSimilarityLint.js";
import { runHeaderChecks } from './headerLint.js';
import { checkCrossPlatformDifference } from './crossPlatformLint.js'


/**
 * Run the Markdown Linter
 * @param {string} rulesYaml - YAML rules content
 * @param {string} markdown - README Markdown content
 * @returns {Promise<{
 *   output: string,
 *   fixedMarkdown: string,
 *   diagnostics: Array<{
 *     line: number,
 *     severity: 'error'|'warning'|'info',
 *     message: string
 *   }>
 * }>} Linting results + fixed content + an array of line-based diagnostics
 */
export async function lintMe(rulesYaml, markdown) {
  const parsed = parseRules(rulesYaml);
  const rules = parsed.rules || parsed;

  if (!rules || Object.keys(rules).length === 0) {
    return {
      output: "No valid rules found.",
      fixedMarkdown: markdown,
      diagnostics: []
    };
  }

  // We'll parse the AST once at the start (and again as needed if you fix links, etc.)
  const ast = generateAST(markdown);

  let output = "Linting Completed Successfully\n";
  let fixedMarkdown = markdown;

  // Collect line-based issues for Monaco markers
  const diagnostics = [];

  // Utility function: push a new diagnostic entry with safe line # and severity
  function pushDiagnostic(line, severity, message, fixSuggestion = null) {
    if (!line || line < 1) line = 1;
    let sev = ['error', 'warning', 'info'].includes(severity) ? severity : 'warning';
    diagnostics.push({ line, severity: sev, message });
  
    // Add a verbose line-by-line issue report into the `output`
    output += `\n------------------------------`;
    output += `\n Issues Detected`;
    output += `\n Line     : ${line}`;
    output += `\n Severity : ${sev.toUpperCase()}`;
    output += `\n Message  : ${message}`;
    if (fixSuggestion) {
      output += `\n Suggestion: ${fixSuggestion}`;
    }
    output += `\n------------------------------\n`;

  }
  

  /*************************************************************************
   * IMAGES (Alt Text)
   *************************************************************************/
  if (rules.images) {
    let images = getImages(ast);

    if (rules.images.alt_text?.required) {
      const missingAltList = missingAltText(images, rules.images.alt_text);

      if (missingAltList.length > 0) {
        output += `\n Missing Alt Text in ${missingAltList.length} image(s):\n`;
        missingAltList.forEach((image, index) => {
          // push a diagnostic for each missing alt
          pushDiagnostic(
            image.line,
            image.level || 'warning',
            `Missing alt text: ${image.url}`,
            "Add a meaningful description in the alt text to improve accessibility."
          );
        });
      } else {
        output += "All images have alt text.\n";
      }

    } else if (rules.images.alt_text?.required === false) {
      output += "Alt text check not required as per the rules.\n";
    }
  }

  /*************************************************************************
   * INLINE COMMANDS
   *************************************************************************/
  if (rules.inlineCommands) {
    const commands = getInlineCommands(ast);
    const executionRules = rules.inlineCommands.execution || {};
    const formattingRules = rules.inlineCommands.formatting || {};

    const defaultExecLevel = executionRules.level || 'error';
    const defaultFormatLevel = formattingRules.level || 'warning';
    let failedCommands = [];
    let formattingIssues = [];

    output += `\n Inline Command Checks:\n`;
    output += ` Total Inline Commands Found: ${commands.length}\n`;
    // If we must run commands
    if (executionRules.required) {
      failedCommands = await validateCommands(commands, executionRules);

      if (failedCommands.length > 0) {
        output += `\n Commands Failed Execution:\n`;
        failedCommands.forEach((cmd, index) => {
          pushDiagnostic(
            cmd.line,
            defaultExecLevel,
            `Inline command failed: ${cmd.command}`,
            `Please check the syntax of the command or ensure the command is available in the system.`
          );
        });
      }else {
        output += "\n All inline commands executed successfully!\n";
      }
    }

    // Formatting check
    if (formattingRules.required) {
      formattingIssues = checkCommandFormatting(commands, formattingRules);

      if (formattingIssues.length > 0) {
        output += `\n Formatting Issues in Inline Commands:\n`;
        formattingIssues.forEach((issue) => {
          pushDiagnostic(
            issue.line,
            defaultFormatLevel,
            `Formatting issue in inline command: "${issue.command}" → ${issue.message}`,
            `Review the formatting style for "${issue.command}" and adjust to match expected standards.`
          );
        });
      }else {
        output += "\n No formatting issues found in inline commands.\n";
      }
    }
  }

  /*************************************************************************
   * LINK VALIDATION
   *************************************************************************/
  if (rules.linkValidation) {
    const linkFormatRules = rules.linkValidation.formatting || {};
    const linkAvailRules = rules.linkValidation.availability || {};

    const formattingLevel = linkFormatRules.level || 'warning';
    const internalLevel = linkAvailRules.check_internal?.level || 'error';
    const externalLevel = linkAvailRules.check_external?.level || 'error';

    // Step 1: Check formatting with RegEx
    if (linkFormatRules.required) {
      const formattingIssues = checkLinkFormatting(markdown, linkFormatRules);

      if (formattingIssues.length > 0) {
        formattingIssues.forEach((issue) => {
          pushDiagnostic(
            issue.line,
            formattingLevel,
            `Link formatting issue: ${issue.message}`,
            `Check and revise the link: ${issue.content}`
          );
        });

        if (linkFormatRules.auto_fix) {
          const { updatedMarkdown, fixes } = fixMalformedLinks(formattingIssues, markdown);
          fixedMarkdown = updatedMarkdown;

          if (fixes.length > 0) {
            output += `\n Auto-fixed malformed links:\n`;
            fixes.forEach((fix, i) => {
              output += `  ${i + 1}. Line ${fix.line}:\n`;
              output += `     ${fix.original}\n`;
              output += `     ${fix.fixed}\n`;
            });
          }
        }
      } else {
        output += `\n All links are properly formatted.\n`;
      }

      // Re-generate AST after potential auto-fixes
      const updatedAST = generateAST(fixedMarkdown);
      const links = getLinksFromAST(updatedAST);

      // Check valid schemes if defined
      if (linkFormatRules.valid_schemes) {
        const schemeOutput = checkLinkSchemesUsingAST(links, linkFormatRules.valid_schemes);
        output += schemeOutput;
      }
    }

    // Re-parse AST after fixes
    const finalAST = generateAST(fixedMarkdown);
    const links = getLinksFromAST(finalAST);

    // Step 2: Internal link validation
    if (linkAvailRules.required && linkAvailRules.check_internal?.required) {
      const internalIssues = validateInternalLinks(links, linkAvailRules.check_internal, finalAST);

      if (internalIssues.length > 0) {
        internalIssues.forEach((issue) => {
          pushDiagnostic(
            issue.line,
            internalLevel,
            `Broken internal link: ${issue.url} → ${issue.message}`,
            `Ensure the section or anchor exists and is spelled correctly.`
          );
        });
      } else {
        output += `\n All internal links are valid.\n`;
      }
    }

    // Step 3: External link validation
    if (linkAvailRules.required && linkAvailRules.check_external?.required) {
      const externalIssues = await validateLinkAvailability(links, linkAvailRules);

      if (externalIssues.length > 0) {
        externalIssues.forEach((issue) => {
          pushDiagnostic(
            issue.line,
            externalLevel,
            `Broken external link: ${issue.url} → ${issue.message}`,
            `Check if the external site is available or the URL is correct.`
          );
        });
      } else {
        output += `\n All external links are reachable.\n`;
      }
    }
  }

  /*************************************************************************
   * SENSITIVE DATA SECURITY CHECK
   *************************************************************************/
  if(rules.securityCheck){ 
    if (rules.securityCheck?.sensitive_data?.required) {
      const result = await checkSensitiveData(fixedMarkdown, rules.securityCheck.sensitive_data);
    
      output += `\n Security Scan:\n`;
      
      result.diagnostics.forEach((d) =>
        pushDiagnostic(d.line, d.severity, d.message, d.suggestion)
      );
    }else {
      output += `\n Sesitive data check is disabled in rules\n`;
    }
  }
  

  /*************************************************************************
   * TIMELINESS CHECKS
   *************************************************************************/
  if (rules.timelinessCheck) {
    const t = rules.timelinessCheck;

    // End of Support Check
    if (t.end_of_support?.required) {
      const eos = checkEndOfSupportMention(fixedMarkdown);
      output += `\n End of Support Check:\n${eos.message}\n`;
  
      eos.diagnostics.forEach((d) =>
        pushDiagnostic(d.line, d.severity, d.message, d.suggestion)
      );
    }
    else{
      output += `\n End of Support Check is disabled in rules\n`;
    }
  }

  /*************************************************************************
   * EMOJI LINT
   *************************************************************************/
  if(rules.emojis){
    if (rules.emojis?.required) {
      const emojiViolations = checkEmojiViolations(markdown, rules.emojis);

      if (emojiViolations.length > 0) {
        output += `\n Emoji Violations Detected:\n`;
        emojiViolations.forEach((violation, index) => {
          let suggestion = "";

          if (violation.type === 'line') {
            suggestion = `Reduce emoji usage on line ${violation.line} to no more than ${rules.emojis.max_per_line}.`;
            pushDiagnostic(
              violation.line,
              violation.level || 'warning',
              `Line-level emoji limit exceeded (${violation.emojiCount}/${rules.emojis.max_per_line}).`,
              suggestion
            );
          } else if (violation.type === 'paragraph') {
            suggestion = `Reduce total emoji usage in this paragraph (lines ${violation.startLine}-${violation.endLine}) to ${rules.emojis.max_per_paragraph} or fewer.`;
            pushDiagnostic(
              violation.startLine,
              violation.level || 'warning',
              `Paragraph-level emoji limit exceeded (${violation.emojiCount}/${rules.emojis.max_per_paragraph}).`,
              suggestion
            );
          } else if (violation.type === 'document') {
            suggestion = `Reduce emoji usage across the document to ${rules.emojis.max_per_document} or fewer.`;
            pushDiagnostic(
              1,
              violation.level || 'warning',
              `Document-level emoji limit exceeded (${violation.emojiCount}/${rules.emojis.max_per_document}).`,
              suggestion
            );
          }
        });
      } else {
        output += "\n No emoji violations detected.\n";
      }
    } else {
      output += "\n Emoji linting is disabled in the rules.\n";
    }
  }

  /*************************************************************************
   * FILE ENDING NEWLINE CHECK
   *************************************************************************/
  if(rules.require_newline_at_eof){
    if (rules.require_newline_at_eof?.required) {
      const fileEndingViolations = checkFileEndingViolations(markdown, rules.require_newline_at_eof);

      if (fileEndingViolations.length > 0) {
        output += `\n File Ending Violations Detected:\n`;
        fileEndingViolations.forEach((violation, index) => {
          const suggestion = "Ensure the file ends with a single newline character.";
          pushDiagnostic(
            1,
            violation.level || rules.require_newline_at_eof.level || 'warning',
            `File ending violation: ${violation.message}`,
            suggestion
          );
        });
      } else {
        output += `\n No File Ending Violations Detected.\n`;
      }
    } else {
      output += `\n EOF linting is disabled in the rules.\n`;
    }
  }


  /*************************************************************************
   * DATE VALIDATION CHECK
   *************************************************************************/
  if(rules.dateValidation) {
    if (rules.dateValidation?.required) {
      const dateViolations = checkDateValidationViolations(markdown, rules.dateValidation);
    
      if (dateViolations.length > 0) {
        output += `\n Date Validation Violations Detected:\n`;
    
        dateViolations.forEach((violation, index) => {
          let suggestion = "";
    
          if (violation.message.includes("format")) {
            suggestion = `Use one of the expected formats: ${rules.dateValidation.formats.join(", ")}.`;
          } else if (violation.message.includes("separator")) {
            suggestion = `Use consistent separators such as: ${[...new Set(rules.dateValidation.formats.map(f => f.includes("/") ? "/" : "-"))].join(", ")}.`;
          } else if (violation.message.includes("does not exist")) {
            suggestion = `Double-check the calendar date for correctness (e.g., Feb 29 on non-leap year).`;
          } else if (violation.message.includes("Incorrect day")) {
            suggestion = `Update the weekday to match the actual date, or correct the date to match the intended weekday.`;
          }
    
          pushDiagnostic(
            violation.line,
            violation.level || rules.dateValidation.level || 'warning',
            `Date validation: ${violation.message}`,
            suggestion
          );
        });
      } else {
        output += `\n No Date Validation Violations Detected.\n`;
      }
    } else {
        output += "\nDate Validation linting is disabled in the rules.\n";
    }
    }

  /*************************************************************************
   * GRAMMAR CHECK
   *************************************************************************/
  if(rules.grammar){
    if (rules.grammar?.required && rules.grammar.llm_validation) {
      const result = await checkGrammarOrSpelling(fixedMarkdown, rules.grammar, "grammar");

      if (result.suggestions.length > 0) {
        output += `\n Grammar Issues Detected:\n`;
      
        result.suggestions.forEach((s, i) => {
          const suggestion = `Consider replacing "${s.original}" with "${s.suggestion}" to improve grammar clarity.`;
      
          pushDiagnostic(
            s.line,
            rules.grammar.level || 'warning',
            `Grammar issue: ${s.message}`,
            suggestion
          );
        });
      } else {
        output += "\n No grammar issues found.\n";
      }
      
      // Apply fix if available
      fixedMarkdown = result.fixedText;      
    } else {
        output += "\nGrammar check is disabled in the rules.\n";
    }
    }

  /*************************************************************************
   * SPELLING CHECK
   *************************************************************************/
  if(rules.spelling){
    if (rules.spelling?.required && rules.spelling.llm_validation) {
      const result = await checkGrammarOrSpelling(fixedMarkdown, rules.spelling, "spelling");

      if (result.suggestions.length > 0) {
        output += `\n Spelling Issues Detected:\n`;
      
        result.suggestions.forEach((s, i) => {
          const suggestion = `Did you mean "${s.suggestion}" instead of "${s.original}"?`;
      
          pushDiagnostic(
            s.line,
            rules.spelling.level || 'warning',
            `Spelling issue: ${s.message}`,
            suggestion
          );
        });
      } else {
        output += "\n No spelling issues found.\n";
      }
      
      // Apply fix if available
      fixedMarkdown = result.fixedText;
      
    } else {
        output += "\nSpell check is disabled in the rules.\n";
    }
    }

  /*************************************************************************
   * CODE FORMATTING
   *************************************************************************/
  if (rules.codeFormatting?.required) {
    // 1. Format check & auto-fix
    if (rules.codeFormatting.formatting?.required) {
      const doAutoFix = rules.codeFormatting.formatting.auto_fix === true;
      const { updatedMarkdown, issues } = checkCodeFormatting(fixedMarkdown, {
        formatting: rules.codeFormatting.formatting,
        language: { required: false, allowed: [] }
      }, ast);

      if (issues.length > 0) {
        issues.forEach((issue) => {
          pushDiagnostic(
            issue.line,
            rules.codeFormatting.level || 'warning',
            `Code block formatting issue: ${issue.message}`,
            issue.message.includes("Auto-fixed") 
              ? "Fence syntax was automatically corrected."
              : "Review code block formatting against style guide."
          );
        });
      } else {
        output += "\nNo code formatting issues detected.\n";
      }
      if (doAutoFix) {
        fixedMarkdown = updatedMarkdown;
      }
    } else {
      output += "\nFormatting checks are disabled/not defined for code blocks\n";
    }

    // 2. AST Language check
    if(rules.codeFormatting){
      if (rules.codeFormatting.language?.required) {
        const { invalidLangs } = checkCodeFormatting(fixedMarkdown, {
          formatting: { required: false },
          language: rules.codeFormatting.language
        }, ast);

        if (invalidLangs.length > 0) {
          invalidLangs.forEach((warn) => {
            pushDiagnostic(
              warn.line,
              rules.codeFormatting.level || 'warning',
              `Invalid code block language: ${warn.message}`,
              `Use one of the allowed languages: ${rules.codeFormatting.language.allowed.join(", ")}`
            );
          });
        } else {
          output += "\nAll code blocks use valid languages.\n";
        }
        } else {
        output += "\nLanguage checks are disabled/not defined for code blocks\n";
        }
    } else {
        output += "\nCodeFormatting checks are disabled in the rules.\n";
    }
    }

  /*************************************************************************
   * TABLE OF CONTENTS
   *************************************************************************/
  if (rules.table_of_contents) {
    if (rules.table_of_contents?.required) {
      const tocExists = hasTableOfContents(ast);
      let firstHeadingLine = 1;

      // Try to find the first heading and use its position
      const firstHeading = ast.children.find(node => node.type === 'heading');
      if (firstHeading && firstHeading.position?.start?.line) {
        firstHeadingLine = firstHeading.position.start.line;
      }

      if (!tocExists) {
        const lineToReport = Math.max(4, firstHeadingLine);

        pushDiagnostic(
          lineToReport,
          rules.table_of_contents.level || 'warning',
          `Missing Table of Contents section.`,
          `Include a "## Table of Contents" after the introduction with links to key sections.`
        );

        if (rules.table_of_contents.auto_fix) {
          const tocMarkdown = generateTOC(ast, "## Table of Contents");
          fixedMarkdown = insertTOCIntoMarkdown(fixedMarkdown, tocMarkdown);
          output += "→ Auto-generated TOC inserted after first heading.\n";
        }
      } else {
        output += "\nTable of Contents found.\n";
      }
    } else {
      output += "\nPresence of Table of Contents check is disabled in the rules.\n";
    }
  }

  /*************************************************************************
   * HATE SPEECH DETECTOR
   *************************************************************************/
  if (rules.hate_speech_filter) {
    if (rules.hate_speech_filter?.required) {
      const violations = await detectHateSpeech(fixedMarkdown, rules.hate_speech_filter);

      if (violations.length > 0) {
        output += `\nHate Speech or Biased Language Detected:\n`;

        violations.forEach((v, i) => {
          pushDiagnostic(
            v.line,
            v.severity || 'warning',
            v.message,
            v.suggestion ? `Consider replacing with: "${v.suggestion}".` : `Consider rephrasing or removing the term "${v.word}".`
          );
        });

        if (rules.hate_speech_filter.auto_fix) {
          fixedMarkdown = await autoFixHateSpeech(fixedMarkdown, rules.hate_speech_filter);
          output += "→ Auto-fix applied to remove harmful language.\n";
        }
      } else {
        output += "\nNo hate speech or biased language found.\n";
      }
    } else {
      output += `\nHate speech linting is disabled or not defined.\n`;
    }
  }
  
  /*************************************************************************
   * BACK TO TOP 
   *************************************************************************/
  if (rules.back_to_top) {
    if (rules.back_to_top?.required) {
      const tocExists = hasBackToTopLink(ast, rules.back_to_top);

      if (!tocExists) {
        const level = rules.back_to_top.level || 'warning';

        pushDiagnostic(
          2, // placing this early in the doc
          level,
          `Missing 'Back to Top' navigation link`,
          `Consider inserting a "${(rules.back_to_top.link_texts?.[0] || 'Back to Top')}" link for better navigation.`
        );

        if (rules.back_to_top.auto_fix) {
          fixedMarkdown = addBackToTopLink(fixedMarkdown, rules.back_to_top);
          output += "\n→ Auto-generated Back to Top link inserted.\n";
        }
      } else {
        output += `\nBack to Top Link is present.\n`;
      }
    } else {
      output += `\nBack to top link navigation check is disabled or not defined.\n`;
    }
  }

  /*************************************************************************
   * HISTORICAL ALIGNMENT CHECK
   *************************************************************************/
  if (rules.readme_alignment?.required) {
    const urls = rules.readme_alignment.github_urls;
    const method = rules.readme_alignment?.similarity_method || "embedding_cosine";
    const threshold = rules.readme_alignment?.threshold ?? 80;
    const repo = rules.readme_alignment?.repo;
    const versionCount = rules.readme_alignment?.version_count;
    const historicalComparisons = await fetchHistoricalReadmesFromBackend(
      fixedMarkdown,
      urls,
      method,
      repo,
      versionCount
    );

    output += `\nHistorical Alignment Check: ${method}\n`;

    for (const version of historicalComparisons) {
      output += `\n   Version: ${version.url}\n`;
      output += `     Overall Similarity Score: ${version.similarity}%\n`;

      if (version.error) {
        output += `     • Error: ${version.error}\n`;
        continue;
      }

      if (version.sectionSimilarity && version.sectionSimilarity.length) {
        output += `     Section-level Similarities:\n`;
        version.sectionSimilarity.forEach(section => {
          if (section.note) {
            output += `       - ${section.header}: 0% (${section.note})\n`;
          } else {
            output += `       - ${section.header}: ${section.similarity}%\n`;
          }
        });
      }

      if (version.similarity < threshold) {
        pushDiagnostic(
          1,
          "error",
          `README similarity to ${version.url} is only ${version.similarity}%, which is below the threshold of ${threshold}%.`,
          `Consider aligning content with historical version at ${version.url} to maintain continuity.`
        );
      }

      version.sectionSimilarity?.forEach(section => {
        if (section.similarity < 60 && !section.note) {
          pushDiagnostic(
            1,
            "warning",
            `Section "${section.header}" is only ${section.similarity}% similar to its counterpart in ${version.url}.`,
            `Update "${section.header}" to better align with previous documentation.`
          );
        }
      });
    }
  }
    
  /*************************************************************************
   * HEADER CHECKS
   *************************************************************************/
  if (rules.headers) {
    const headerResults = runHeaderChecks(ast, rules.headers, fixedMarkdown);
  
    /* If auto‑fix changed the file, adopt it first */
    if (
      rules.headers.auto_fix &&
      headerResults.fixedMarkdown &&
      headerResults.fixedMarkdown !== fixedMarkdown
    ) {
      fixedMarkdown = headerResults.fixedMarkdown;
      output += `→ Header-related issues were auto-fixed.\n`;
    }
  
    /* 2 Now the file length matches the diagnostic line numbers */
    if (headerResults.diagnostics.length) {
      output += `\n Header Rule Checks:\n`;
      headerResults.diagnostics.forEach((d) =>
        pushDiagnostic(d.line, d.severity, d.message, d.suggestion)
      );
    } else {
      output += `\n No header rule violations detected.\n`;
    }
  }
  
/*************************************************************************
 * CROSS PLATFORM MARKDOWN CHECK
 *************************************************************************/
if (rules.cross_platform?.required) {
  const {
    first = 'marked',
    second = 'puppeteer',
    level = 'error',
    image = {} // ✅ for pixel diff
  } = rules.cross_platform.compare || {};

  try {
    const result = await checkCrossPlatformDifference(fixedMarkdown, {
      first,
      second,
      image
    });

    if (!result.success) {
      pushDiagnostic(1, 'error',
        `Cross‑platform render check failed: ${result.error}`);
      return;
    }

    const {
      domDiff,
      rawDiff,
      formattedRawDiff,
      lineNumbers,
      pixelChanges = 0
    } = result;

    const hasDOMorRaw = domDiff.length || rawDiff.length;
    console.log('pixelChanges from backend:', pixelChanges);

    const hasPixelDiff = image?.enabled && pixelChanges > 0;

    if (hasDOMorRaw || hasPixelDiff) {
      const uniqueLines = [...new Set(lineNumbers)];

      const suggestionParts = [];
      if (hasDOMorRaw) suggestionParts.push("DOM/HTML mismatch");
      if (hasPixelDiff) suggestionParts.push("Rendered visual difference");

      uniqueLines.forEach(line => {
        pushDiagnostic(
          line,
          level,
          `Cross‑platform diff at line ${line} (${first} vs ${second})`,
          suggestionParts.join(" + ")
        );
      });

      output += `\nCross‑platform mismatch:\n`;
      if (hasDOMorRaw)
        output += `Found ${domDiff.length} DOM diffs and ${rawDiff.length} raw HTML diffs.\n`;
      if (hasPixelDiff)
        output += `Pixel diff detected: ${pixelChanges} differing pixels (screenshot comparison).\n`;

      if (formattedRawDiff && hasDOMorRaw) {
        output += `\nRaw HTML Differences:\n${formattedRawDiff}\n`;
      }
    } else {
      output += `\nCross‑platform rendering: No visual or structural differences found between `
              + `${first} and ${second}.\n`;
    }

  } catch (err) {
    pushDiagnostic(1, 'error',
      `Cross‑platform render check failed: ${err.message}`);
  }
}


  

  /*************************************************************************
   * WORD / THRESHOLD / DUPLICATES / LENGTH CHECKS
   *************************************************************************/
  for (const [ruleName, ruleConfig] of Object.entries(rules)) {
    if (ruleConfig.required === false) {
      output += `\n${ruleName} check is disabled in the rules.\n`;
      continue;
    }

    if (ruleConfig?.word_file || ruleConfig?.words) {
      const wordList = await resolveWordsFromRuleConfig(ruleConfig);
      ruleConfig.words = wordList;
    }

    const allWords = ruleConfig.words || [];
    const level = ruleConfig.level || "warning";

    // 1. Repetition
    if (
      (ruleConfig.count === true ||
        ruleConfig.count_occurances ||
        typeof ruleConfig.threshold_paragraph === "number" ||
        typeof ruleConfig.threshold_page === "number") &&
      Array.isArray(allWords) &&
      allWords.length > 0
    ) {
      const thresholds = {
        ...(ruleConfig.count_occurances || {}),
        ...(typeof ruleConfig.threshold_paragraph === "number" && {
          paragraph: ruleConfig.threshold_paragraph,
        }),
        ...(typeof ruleConfig.threshold_page === "number" && {
          page: ruleConfig.threshold_page,
        }),
      };

      for (const [nodeType, threshold] of Object.entries(thresholds)) {
        if (typeof threshold !== "number") continue;

        if (nodeType === "page") {
          const pageViolations = checkPageLevelRepetition(fixedMarkdown, allWords, threshold, level);
          if (pageViolations.length > 0) {
            output += `\n${ruleName} Document-Wide Repetition Violations:\n`;
            pageViolations.forEach((v, i) => {
              pushDiagnostic(
                1,
                v.level,
                `${ruleName}: Word "${v.word}" repeated ${v.count} times (Document-level)`,
                `Reduce usage of "${v.word}" to improve clarity and avoid overuse.`
              );
            });
          } else {
            output += `\n${ruleName}: No document-level repetition violations found.\n`;
          }
        } else {
          const astViolations = checkASTTypeSummed(ast, allWords, nodeType, threshold, level);
          if (astViolations.length > 0) {
            output += `\n${ruleName} ${nodeType} Repetition Violations:\n`;
            astViolations.forEach((v, i) => {
              pushDiagnostic(
                v.line,
                v.level,
                `${ruleName}: In a ${nodeType}, word "${v.word}" repeated ${v.count} times`,
                `Consider removing or rephrasing "${v.word}" in this ${nodeType}.`
              );
            });
          } else {
            output += `\n${ruleName}: No ${nodeType}-level repetition violations found.\n`;
          }
        }
      }

      if (ruleConfig.count === true) {
        const wordCounts = countTargetPhrases(fixedMarkdown, allWords);
        output += `\n${ruleName} Word Usage Counts (Entire Document):\n`;
        allWords.forEach((word, i) => {
          const c = wordCounts[word] || 0;
          output += `  ${i + 1}. Word "${word}" appears ${c} times\n`;
        });
      }
    }

    // 2. Consecutive Duplicates
    if (ruleConfig.detect_consecutive === true) {
      const consecutive = detectConsecutiveDuplicates(fixedMarkdown);
      if (consecutive.length > 0) {
        output += `\n${ruleName} Consecutive Word Duplicates:\n`;
        consecutive.forEach((dup, i) => {
          pushDiagnostic(
            dup.line,
            level,
            `${ruleName}: Consecutive duplicate word "${dup.word}"`,
            `Avoid repeating "${dup.word}" consecutively in the same line.`
          );
        });
      } else {
        output += `\n${ruleName}: No consecutive duplicate words found.\n`;
      }
    }

    // 3. Duplicate Sentences
    if (ruleConfig.detect_duplicate_sentences === true) {
      const duplicates = detectDuplicateSentences(fixedMarkdown);
      if (duplicates.length > 0) {
        output += `\n${ruleName} Duplicate Sentences:\n`;
        duplicates.forEach((dup, i) => {
          pushDiagnostic(
            dup.lines[0] || 1,
            level,
            `${ruleName}: Duplicate sentence "${dup.sentence}" found on lines ${dup.lines.join(", ")}`,
            `Consider revising or removing this repeated sentence.`
          );
        });
      } else {
        output += `\n${ruleName}: No duplicate sentences found.\n`;
      }
    }

    // 4. Length Check
    if (ruleConfig.enforceLength) {
      for (const [nodeType, maxLength] of Object.entries(ruleConfig.enforceLength)) {
        if (typeof maxLength !== "number") continue;

        const lengthViolations = checkASTNodeLength(ast, nodeType, maxLength, level);
        if (lengthViolations.length > 0) {
          output += `\n${ruleName} ${nodeType} Length Violations:\n`;
          lengthViolations.forEach((v, i) => {
            pushDiagnostic(
              v.line,
              v.level,
              `${ruleName}: ${nodeType} too long (length ${v.length} > limit ${v.threshold})`,
              `Try breaking this ${nodeType} into smaller parts.`
            );
          });
        } else {
          output += `\n${ruleName}: No ${nodeType}-level length violations found.\n`;
        }
      }
    }

    // 5. LLM Validation
    if (ruleConfig?.llm_validation) {
      const { rawResponse, fixedText } = await runLLMValidation({
        markdown: fixedMarkdown,
        ruleConfig,
        ruleName
      });

      if (rawResponse?.trim()) {
        output += `\nLLM Feedback for '${ruleName}':\n${rawResponse}\n`;
      }

      if (ruleConfig.llm_validation.fix) {
        fixedMarkdown = fixedText;
      }
    }
  }
 // end for rules

  // Return everything, including new `diagnostics`
  return {
    output,
    fixedMarkdown,
    diagnostics
  };
}
