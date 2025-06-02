import yaml from 'js-yaml';

export function generateYAML(name = '', description = '', steps = []) {
  const pipeline = steps
    .filter(step => step.operator !== 'generateAST')
    .map(step => {
      const out = { operator: step.operator };

      if (step.operator === 'filter') {
        if ('target' in step)           out.target     = step.target;
        if (Array.isArray(step.scopes)) out.scopes     = step.scopes;
        if ('word' in step)             out.word       = step.word;
      }

      if (step.operator === 'regexMatch') {
        if ('pattern' in step)          out.pattern    = step.pattern;
      }
      if ('target' in step && step.target !== '')
        out.target = step.target;        

      if ('scope' in step && step.operator !== 'isPresent')
        out.scope = step.scope;

      if ('level' in step && step.level !== 'warning')
        out.level = step.level;       
      if ('conditions' in step)        out.conditions = step.conditions;
      if (step.operator === 'compare') {
        if ('baseline' in step) out.baseline = step.baseline;
        if ('against'  in step) out.against  = step.against;
      }


      return out;
    });
   return yaml.dump(
     { rule: name, description, pipeline },
     { sortKeys: false, defaultStringType: 'QUOTE_DOUBLE' }  
   );

}
