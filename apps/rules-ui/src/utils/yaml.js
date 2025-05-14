// apps/rules-ui/src/utils/yaml.js
import yaml from 'js-yaml';

/**
 * Build YAML from current UI state
 * @param {string} name
 * @param {string} description
 * @param {Array}  steps   pipeline array (the store value)
 */
export function generateYAML(name = '', description = '', steps = []) {
  return yaml.dump({
    rule:        name,
    description,
    pipeline:    steps
  });
}
