/**
 * Check if a file ends with a single newline character at EOF.
 * @param {string} markdown - Input markdown content
 * @param {object} rule - File-ending rule from rules.yaml
 * @returns {Array} List of violations
 */
export function checkFileEndingViolations(markdown, rule) {
    if (!rule?.required) {
      return [];
    }
  
    const violations = [];
  
    // Scenario 1: Check if the file does NOT end with a newline character.
    if (!markdown.endsWith('\n')) {
      violations.push({
        type: 'fileEnding',
        message: "File does not end with a newline character.",
        level: rule.level
      });
    }
      
    return violations;
  }
  