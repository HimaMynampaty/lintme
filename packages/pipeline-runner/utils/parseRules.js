import yaml from 'js-yaml';

export function parseRules(yamlText) {
  try   { return yaml.load(yamlText); }
  catch { return { error: 'Invalid YAML format. Check syntax.' }; }
}
