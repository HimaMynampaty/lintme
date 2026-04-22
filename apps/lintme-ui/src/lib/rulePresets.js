// Add/extend presets here.
export const rulePresets = {
  software: {
    label: "Software Libraries / Projects",
    rulesByName: [
      // Structure
      "checkBackToTopLinkPresence",
      "codeBlockLanguageCheck",
      "enforceNewLineAtEOF",
      "quickStartSectionCheck",
      "sectionCompleteness(LLM)",
      "tableOfContentsCheck",
      "validateInternalLinksToHeadings",

      // Style
      "codeBlockConsistency",
      "consistentListFormat",
      "disallowConsecutiveDuplicateWords",
      "enforceEmojiLimit",
      "fixSpellingAndGrammar(LLM)",
      "headingListFormattingChecks",
      "requireAltTextForImages",
      "sentenceLengthLimit",
      //"terminologyConsistency(LLM)",

      // Content
      //"codeBlockExecution(LLM)",
      "consistentExternalLinkFormat",
      "dateValidationLint",
      //"jargonExplanationCheck(LLM)",
      "limitWordRepetition",
      "minimumReadmeLength",
      "noUnreachableLinks",
      //"objectivityCheck(LLM)",
      //"timelinessCheckVersionUpdate(LLM)",
      "validateInlineCommands",
      "validateLinkFormatting",
      "valueAddedLint",

      // Sensitive
      //"ambiguityUnderstandabilityCheck(LLM)",
      "customCodeHateSpeech",
      "detectSensitiveSecrets"
    ]
  },

  interactiveSystems: {
    label: "Interactive Systems (e.g., Vega-Lite, Plotly)",
    rulesByName: [
      // Structure 
      "checkBackToTopLinkPresence",
      "enforceNewLineAtEOF",
      "sectionCompleteness(LLM) - Interactive systems",
      "validateInternalLinksToHeadings",

      // Style
      "consistentListFormat",
      "disallowConsecutiveDuplicateWords",
      "enforceEmojiLimit",
      //"fixSpellingAndGrammar(LLM)",
      "headingListFormattingChecks",
      "requireAltTextForImages",
      "sentenceLengthLimit",
      //"terminologyConsistency(LLM)",

      // Content
      "consistentExternalLinkFormat",
      "demoLinkRequiredLint - Interactive systems",
      "dateValidationLint",
      //"jargonExplanationCheck(LLM)",
      "minimumReadmeLength - Interactive systems",
      "noUnreachableLinks",
      "richContentCheck",
      "validateLinkFormatting",
      "valueAddedLint",

      // Sensitive
      //"ambiguityUnderstandabilityCheck(LLM)",
      "customCodeHateSpeech",
      "detectSensitiveSecrets"
    ]
  },

  datasets: {
    label: "Dataset Repositories",
    rulesByName: [
      // Structure
      "checkBackToTopLinkPresence",
      "enforceNewLineAtEOF",
      "sectionCompleteness(LLM)",
      "tableOfContentsCheck",
      "validateInternalLinksToHeadings",

      // Style
      "consistentListFormat",
      "disallowConsecutiveDuplicateWords",
      "enforceEmojiLimit",
      //"fixSpellingAndGrammar(LLM)",
      "headingListFormattingChecks",
      "requireAltTextForImages",
      "sentenceLengthLimit - datasets",
      //"terminologyConsistency(LLM)",

      // Content
      "citationBibTeXPresent",
      //"codeBlockExecution(LLM)",
      "consistentExternalLinkFormat",
      "dateValidationLint",
      //"jargonExplanationCheck(LLM)",
      "limitWordRepetition",
      "minimumReadmeLength",
      "noUnreachableLinks",
      //"objectivityCheck(LLM)",
      //"timelinessCheckVersionUpdate(LLM)",
      "validateInlineCommands",
      "validateLinkFormatting",
      "valueAddedLint",

      // Sensitive
      //"ambiguityUnderstandabilityCheck(LLM)",
      "customCodeHateSpeech",
      "detectSensitiveSecrets"
    ]
  },

  recipes: {
    label: "Recipe READMEs",
    rulesByName: [
      "genericIngredientNames(Recipe)",
      "ingredientMustHaveWeightAndVolume(Recipe)",
      "ingredientsAndPreparationSections(Recipe)",
      "ingredientsOrdering(Recipe)",
      "mustHaveMetricAndUsImperialWeights(Recipe)",
      "nestedListItems(Recipe)",
      "requireBuyAndUseAmounts(Recipe)",
      "requirePrepOrTotalTime(Recipe)",
      "substitutionsSectionCheck(Recipe)",
      "temperatureFormatCheck(Recipe)",
      "temperatureMissingUnitCheck(Recipe)",
      "unknownTimerUnits(Recipe)"
    ]
  }
};
