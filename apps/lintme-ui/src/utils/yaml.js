import yaml from 'js-yaml';

export function parseYAML(text = '') {
  const doc = yaml.load(text ?? '');
  if (!doc || !Array.isArray(doc.pipeline)) return [];

  return doc.pipeline.map((raw) => {
    const id = crypto.randomUUID();

    switch (raw.operator) {
      case 'extract':
        return { id, operator: 'extract', target: raw.target ?? '', scopes: raw.scopes ?? [] };
      case 'regexMatch':
        return { id, operator: 'regexMatch', pattern: raw.pattern ?? '', patterns: raw.patterns };
      case 'compare':
        return { id, operator: 'compare', baseline: raw.baseline ?? '', against: raw.against ?? '' };
      case 'isPresent':
        return { id, operator: 'isPresent', target: raw.target ?? '' };
      case 'fetchFromGithub':
        return {
          id,
          operator: 'fetchFromGithub',
          repo: raw.repo ?? '',
          branch: raw.branch ?? 'main',
          fileName: raw.fileName ?? 'README.md',
          fetchType: raw.fetchType ?? 'content'
        };
      case 'calculateContrast':
        return {
          id,
          operator: 'calculateContrast'
      };
      case 'customCode':
        return {
          id,
          operator: 'customCode',
          code: raw.code ?? ''
        };
      case 'readmeLocationCheck':
        return {
          id,
          operator: 'readmeLocationCheck',
          paths: raw.paths ?? []
        };
      case 'markdownRender':
        return {
          id,
          operator: 'markdownRender',
          renderer: raw.renderer ?? 'marked',
          output: raw.output ?? 'html'
        };  
      case 'sage':
      case 'count':
      case 'length':
      case 'search':
      case 'threshold':
      case 'fixUsingLLM':
      case 'fixUsingLintMeCode':
        return { id, ...raw };
      default:
        return null;
    }
  }).filter(Boolean);
}

export function generateYAML(name = '', description = '', steps = []) {
  const NEEDS_TARGET = new Set([
    'extract',
    'regexMatch',
    'isPresent',
    'compare'
  ]);

  const pipeline = steps
    .filter(step => step.operator !== 'generateAST')
    .map(step => {
      const out = { operator: step.operator };

      if (step.operator === 'extract') {
        if ('target' in step) out.target = step.target;
        if (Array.isArray(step.scopes)) out.scopes = step.scopes;
      }

      if (step.operator === 'regexMatch') {
        if (Array.isArray(step.patterns)) out.patterns = step.patterns;
        else if ('pattern' in step) out.pattern = step.pattern;
      }

      if (step.operator === 'fixUsingLintMeCode') {
        if ('template' in step) out.template = step.template;
      }

      if (step.operator === 'fixUsingLLM') {
        if ('prompt' in step) out.prompt = step.prompt;
        if ('model' in step) out.model = step.model;
      }
      if (step.operator === 'readmeLocationCheck') {
        if (Array.isArray(step.paths) && step.paths.length > 0) {
          out.paths = step.paths;
        }
      }
      if (step.operator === 'markdownRender') {
        if ('renderer' in step) out.renderer = step.renderer;
        if ('output' in step) out.output = step.output;
      }
      if (step.operator === 'customCode') {
        if ('code' in step) out.code = step.code;
      }
      if (step.operator === 'compare') {
        if ('baseline' in step) out.baseline = step.baseline;
        if ('against' in step) out.against = step.against;
      }
      if (step.operator === 'calculateContrast') {
        if ('minContrast' in step) out.minContrast = step.minContrast;
      }
      if (step.operator === 'fetchFromGithub') {
        if ('repo' in step) out.repo = step.repo;
        if ('branch' in step) out.branch = step.branch;
        if ('fileName' in step && step.fileName) out.fileName = step.fileName;
        if ('fetchType' in step && step.fetchType !== 'content') out.fetchType = step.fetchType;
      }

      if (
        NEEDS_TARGET.has(step.operator) &&
        'target' in step &&
        step.target !== '' &&
        step._inferred !== true
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

export function withIds(steps = []) {
  return steps.map((s) => ('id' in s ? s : { ...s, id: crypto.randomUUID() }));
}
