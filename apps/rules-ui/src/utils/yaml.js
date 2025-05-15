import yaml from 'js-yaml';

/**
 * Build YAML from current UI state
 * @param {string} name
 * @param {string} description
 * @param {Array}  steps  
 */
export function generateYAML(name = '', description = '', steps = []) {
  const pipeline = steps.map(step => {
    const result = { operator: step.operator };

    if ('target' in step)        result.target = step.target;
    if (Array.isArray(step.scopes)) result.scopes = step.scopes;
    if ('scope' in step)         result.scope = step.scope;
    if ('level' in step)         result.level = step.level;
    if ('conditions' in step)    result.conditions = step.conditions;
    if ('word' in step)          result.word = step.word;

    return result;
  });

  return yaml.dump({ rule: name, description, pipeline }, { sortKeys: false });
}
