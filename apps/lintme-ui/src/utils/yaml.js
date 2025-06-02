import yaml from 'js-yaml';

export function generateYAML(name = '', description = '', steps = []) {
  const NEEDS_TARGET = new Set([
    'filter',
    'regexMatch',
    'isPresent',
    'compare',
    'length'
  ]);

  const pipeline = steps
    .filter(step => step.operator !== 'generateAST')
    .map(step => {
      const out = { operator: step.operator };

      if (step.operator === 'filter') {
        if ('target' in step) out.target = step.target;
        if (Array.isArray(step.scopes)) out.scopes = step.scopes;
        if ('word' in step) out.word = step.word;
      }

      if (step.operator === 'regexMatch') {
        if ('pattern' in step) out.pattern = step.pattern;
      }

      if (step.operator === 'fixUsingLintMeCode' || step.operator === 'fixUsingLLM') {
        if ('template' in step) out.template = step.template;
      }

      if (step.operator === 'compare') {
        if ('baseline' in step) out.baseline = step.baseline;
        if ('against' in step) out.against = step.against;
      }

      if (
        NEEDS_TARGET.has(step.operator) &&
        'target' in step &&
        step.target !== ''
      ) {
        out.target = step.target;
      }

      if ('scope' in step && step.operator !== 'isPresent') {
        out.scope = step.scope;
      }

      if ('level' in step && step.level !== 'warning') {
        out.level = step.level;
      }

      if ('conditions' in step) {
        out.conditions = step.conditions;
      }

      if ('query' in step) {
        out.query = step.query;
      }

      if ('scope' in step && step.scope) {
        out.scope = step.scope;
      }

      return out;
    });

  return yaml.dump(
    { rule: name, description, pipeline },
    { sortKeys: false, defaultStringType: 'QUOTE_DOUBLE' }
  );
}
