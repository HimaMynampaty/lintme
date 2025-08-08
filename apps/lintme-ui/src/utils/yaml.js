import yaml from 'js-yaml';

export function parseYAML(text = '') {
  const doc = yaml.load(text ?? '');
  if (!doc || !Array.isArray(doc.pipeline)) return [];

  return doc.pipeline
    .map((raw) => {
      const id = crypto.randomUUID();
      switch (raw.operator) {
      case 'execute':
        return {
          id,
          operator: 'execute',
          timeout: Number(raw.timeout ?? 5000)
        };
        case 'regexMatch':
          return {
            id,
            operator: 'regexMatch',
            pattern: raw.pattern ?? '',
            patterns: raw.patterns,
            mode: raw.mode ?? 'unmatch',
            scope: raw.scope ?? 'document'
          };

        case 'codeBlockFormatting':
          return {
            id,
            operator: 'codeBlockFormatting',
            allowedLanguages: raw.allowedLanguages ?? [],
            allowedFormats: raw.allowedFormats ?? ['fenced'],
          };

        case 'compare':
          return {
            id,
            operator: 'compare',
            baseline: raw.baseline ?? '',
            against: raw.against ?? '',
            comparison_mode: raw.comparison_mode ?? 'structural',
            similarity_method: raw.similarity_method ?? '',
            threshold: raw.threshold ?? 80
          };

        case 'isPresent':
          return { id, operator: 'isPresent', target: raw.target ?? '' };

        case 'fetchFromGithub':
          return {
            id,
            operator: 'fetchFromGithub',
            repo: raw.repo ?? '',
            branch: raw.branch ?? 'main',
            fileName: raw.fileName ?? 'README.md',
            fetchType: raw.fetchType ?? 'content',
            metaPath: raw.metaPath ?? '',
            useCustomMetaPath: raw.useCustomMetaPath ?? false
          };
        case 'execute':
          return {
            id,
            operator: 'execute',
            required: raw.required ?? true,
            timeout: Number(raw.timeout ?? 5000),
            safe_mode: raw.safe_mode ?? true,
            level: raw.level ?? 'warning',
            scope: raw.scope ?? 'previousstepoutput',
          };

        case 'evaluateUsingLLM':
          return {
            id,
            operator: 'evaluateUsingLLM',
            model: raw.model ?? 'llama-3.3-70b-versatile',
            ruleDefinition: raw.ruleDefinition ?? '',
          };

        case 'calculateContrast': {
          const { operator, ...rest } = raw;
          return { id, operator: 'calculateContrast', ...rest };
        }

        case 'customCode':
          return { id, operator: 'customCode', code: raw.code ?? '' };

        case 'readmeLocationCheck':
          return { id, operator: 'readmeLocationCheck', paths: raw.paths ?? [] };

        case 'markdownRender':
          return {
            id,
            operator: 'markdownRender',
            renderer: raw.renderer ?? 'marked',
            output: raw.output ?? 'html'
          };

        case 'detectDuplicateSentences':
          return {
            id,
            operator: 'detectDuplicateSentences',
            scope: raw.scope ?? 'document',
            scopes: raw.scopes ?? ['document']
          };

        case 'isLinkAlive':
          return {
            id,
            operator: 'isLinkAlive',
            timeout: Number(raw.timeout ?? 5000),
            allowed_status_codes: Array.isArray(raw.allowed_status_codes)
              ? raw.allowed_status_codes
              : [200, 301, 302, 307, 308],
            scope: raw.scope ?? 'document'
          };

        case 'sage':
        case 'count':
        case 'length':
        case 'search':
        case 'threshold':
        case 'fixUsingLLM':
        case 'fixUsingLintMeCode':
          return { id, ...raw };

        default: {
          const { operator, ...rest } = raw;
          return { id, operator: raw.operator, ...rest };
        }
      }
    })
    .filter(Boolean);
}

export function generateYAML(name = '', description = '', steps = []) {
  const NEEDS_TARGET = new Set(['extract', 'isPresent', 'compare']);


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
        if (step.mode) out.mode = step.mode;
        if (step.scope) out.scope = step.scope;
      }

      if (step.operator === 'fixUsingLintMeCode') {
        if ('template' in step) out.template = step.template;
      }

      if (step.operator === 'fixUsingLLM') {
        if ('prompt' in step) out.prompt = step.prompt;
        if ('model' in step) out.model = step.model;
      }

      if (step.operator === 'readmeLocationCheck') {
        if (Array.isArray(step.paths) && step.paths.length > 0) out.paths = step.paths;
      }

      if (step.operator === 'markdownRender') {
        if ('renderer' in step) out.renderer = step.renderer;
        if ('output' in step) out.output = step.output;
      }

      if (step.operator === 'codeBlockFormatting') {
        if (Array.isArray(step.allowedLanguages)) out.allowedLanguages = step.allowedLanguages;
        if (Array.isArray(step.allowedFormats)) out.allowedFormats = step.allowedFormats;
      }

      if (step.operator === 'evaluateUsingLLM') {
        if ('model' in step) out.model = step.model;
        if ('ruleDefinition' in step) out.ruleDefinition = step.ruleDefinition;
      }
      if (step.operator === 'execute') {
        if (typeof step.timeout === 'number') out.timeout = step.timeout;
      }

      if (step.operator === 'customCode') {
        if ('code' in step) out.code = step.code;
      }

      if (step.operator === 'compare') {
        if ('baseline' in step) out.baseline = step.baseline;
        if ('against' in step) out.against = step.against;
        if (step.comparison_mode) out.comparison_mode = step.comparison_mode;

        if (step.similarity_method && step.comparison_mode === 'similarity') {
          out.similarity_method = step.similarity_method;
        }
        if (step.comparison_mode === 'similarity' && typeof step.threshold === 'number') {
          out.threshold = step.threshold;
        }
      }

      if (step.operator === 'calculateContrast') { }

      if (step.operator === 'fetchFromGithub') {
        if ('repo' in step) out.repo = step.repo;
        if ('branch' in step) out.branch = step.branch;
        if ('fileName' in step && step.fileName) out.fileName = step.fileName;
        if ('fetchType' in step) out.fetchType = step.fetchType;

        if (step.fetchType === 'metadata') {
          if ('metaPath' in step && step.metaPath) out.metaPath = step.metaPath;
          if ('useCustomMetaPath' in step && step.useCustomMetaPath) out.useCustomMetaPath = step.useCustomMetaPath;
        }
      }

      if (step.operator === 'isLinkAlive') {
        if (typeof step.timeout === 'number') out.timeout = step.timeout;
        if (Array.isArray(step.allowed_status_codes)) out.allowed_status_codes = step.allowed_status_codes;
        if (step.scope) out.scope = step.scope;
      }

      if (
        NEEDS_TARGET.has(step.operator) &&
        'target' in step &&
        step.target !== '' &&
        step._inferred !== true
      ) {
        out.target = step.target;
      }

      if ('scope' in step && step.operator !== 'isPresent' && step.scope) {
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
