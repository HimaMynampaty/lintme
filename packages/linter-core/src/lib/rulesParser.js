import yaml from "js-yaml";

/**
 * Load and Parse YAML Rules
 * @param {string} yamlText - YAML rules content
 * @returns {object} Parsed rules or error message
 */
export function parseRules(yamlText) {
    try {
        return yaml.load(yamlText);
    } catch (error) {
        return { error: "Invalid YAML format. Please check your syntax." };
    }
}
