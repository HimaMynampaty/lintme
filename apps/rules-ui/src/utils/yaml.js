import yaml from 'js-yaml';

export function generateYAML(name = '', description = '', steps = []) {
  const pipeline = steps
    .filter(step => step.operator !== 'generateAST')
    .map(step => {
      const out = { operator: step.operator };

      /* 🔹 Only the FILTER step serializes target / scopes / word */
      if (step.operator === 'filter') {
        if ('target' in step)           out.target     = step.target;
        if (Array.isArray(step.scopes)) out.scopes     = step.scopes;
        if ('word' in step)             out.word       = step.word;
      }

      if (step.operator === 'regexMatch') {
        if ('pattern' in step)          out.pattern    = step.pattern;
      }
      /* 🔹 Common optional props for all operators */
      if ('scope' in step && step.operator !== 'isPresent')
        out.scope = step.scope;
      if ('level' in step)             out.level      = step.level;
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
