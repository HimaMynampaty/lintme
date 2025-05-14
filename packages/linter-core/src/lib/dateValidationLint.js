import moment from 'moment';

/**
 * @param {string} markdown - Input markdown content
 * @param {object} rule - Date validation rule from rules.yaml
 * @returns {Array} List of violations (if any)
 */
export function checkDateValidationViolations(markdown, rule) {
  if (!rule?.required) {
    return [];
  }

  const violations = [];
  const defaultLevel = rule.level || "warning";

  // Regex to match dates followed by a weekday in parentheses
  const dateRegex = /((?:\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}))\s*\((monday|tuesday|wednesday|thursday|friday|saturday|sunday)\)/gi;

  // Basic format check (same formats as above)
  const basicPattern = /^(?:\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})$/;

  // Get allowed separators from rule formats
  const allowedSeparators = rule.formats.map(fmt => {
    if (fmt.includes("/")) return "/";
    if (fmt.includes("-")) return "-";
    return null;
  }).filter(sep => sep !== null);

  let match;
  while ((match = dateRegex.exec(markdown)) !== null) {
    const dateStr = match[1]; // e.g. "03-31-2025"
    const dayStr = match[2];  // e.g. "monday"
    const lineNumber = markdown.substring(0, match.index).split('\n').length;

    // Step 1: Check format shape
    if (!basicPattern.test(dateStr)) {
      violations.push({
        type: 'dateValidation',
        line: lineNumber,
        message: `Invalid date format: ${dateStr}. Expected formats: ${rule.formats.join(", ")}.`,
        level: defaultLevel,
      });
      continue;
    }

    // Extract all non-digit characters from the date string
    const usedSeparators = (dateStr.match(/[^\d]/g) || []);

    // Check if all separators are the same
    const uniqueSeparators = [...new Set(usedSeparators)];

    const usedSeparator =
      uniqueSeparators.length === 1 ? uniqueSeparators[0] : "mixed";

    if (!allowedSeparators.includes(usedSeparator)) {
      violations.push({
        type: 'dateValidation',
        line: lineNumber,
        message: `Invalid date separator '${usedSeparator}' in ${dateStr}. Allowed separators: ${[...new Set(allowedSeparators)].join(", ")}.`,
        level: defaultLevel,
      });
      continue;
    }


    // Step 3: Strict moment parsing
    let parsedMoment = null;
    for (const fmt of rule.formats) {
      const temp = moment(dateStr, fmt, true);
      if (temp.isValid()) {
        parsedMoment = temp;
        break;
      }
    }

    // Step 4: Non-strict parsing for clarity
    if (!parsedMoment) {
      let nonStrictParsed = null;
      for (const fmt of rule.formats) {
        const temp = moment(dateStr, fmt, false);
        if (temp.isValid()) {
          nonStrictParsed = temp;
          break;
        }
      }

      if (nonStrictParsed) {
        violations.push({
          type: 'dateValidation',
          line: lineNumber,
          message: `Invalid date format: ${dateStr}. Expected formats: ${rule.formats.join(", ")}.`,
          level: defaultLevel,
        });
      } else {
        violations.push({
          type: 'dateValidation',
          line: lineNumber,
          message: `Invalid date: ${dateStr}. The date does not exist (e.g., leap year issue or impossible date).`,
          level: defaultLevel,
        });
      }
      continue;
    }

    // Step 5: Validate day of week (optional)
    if (rule.day_check) {
      const actualDay = parsedMoment.format('dddd');
      if (actualDay.toLowerCase() !== dayStr.toLowerCase()) {
        violations.push({
          type: 'dateValidation',
          line: lineNumber,
          message: `Incorrect day for date ${dateStr}. Mentioned day: ${dayStr}, Correct day: ${actualDay}.`,
          level: defaultLevel,
        });
      }
    }
  }

  return violations;
}
