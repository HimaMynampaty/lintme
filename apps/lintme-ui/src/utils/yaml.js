// yaml.js
import yaml from 'js-yaml';

export function parseYAML(text = '') {
  const doc = yaml.load(text ?? '');
  if (!doc || !Array.isArray(doc.pipeline)) return [];

  return doc.pipeline
    .map((raw) => {
      const id = crypto.randomUUID();
      const op = raw?.operator;

      switch (op) {
        case 'execute': {
          const out = { id, ...raw, operator: 'execute' };
          if (out.timeout == null) out.timeout = 5000;
          return out;
        }

        case 'regexMatch': {
          const out = { id, ...raw, operator: 'regexMatch' };
          if (out.mode == null) out.mode = 'unmatch';
          if (out.scope == null) out.scope = 'document';
          return out;
        }

        case 'codeBlockFormatting': {
          const out = { id, ...raw, operator: 'codeBlockFormatting' };
          if (!Array.isArray(out.allowedFormats)) out.allowedFormats = ['fenced'];
          if (!Array.isArray(out.allowedLanguages)) out.allowedLanguages = [];
          return out;
        }

        case 'compare': {
          const out = { id, ...raw, operator: 'compare' };
          if (out.comparison_mode == null) out.comparison_mode = 'structural';
          return out;
        }

        case 'isPresent': {
          const out = { id, ...raw, operator: 'isPresent' };
          return out;
        }

        case 'fetchFromGithub': {
          const out = { id, ...raw, operator: 'fetchFromGithub' };
          if (out.branch == null) out.branch = 'main';
          if (out.fileName == null) out.fileName = 'README.md';
          if (out.fetchType == null) out.fetchType = 'content';
          if (out.metaPath == null) out.metaPath = '';
          if (out.useCustomMetaPath == null) out.useCustomMetaPath = false;
          return out;
        }

        case 'evaluateUsingLLM': {
          const out = { id, ...raw, operator: 'evaluateUsingLLM' };
          if (out.model == null) out.model = 'llama-3.3-70b-versatile';
          if (out.ruleDefinition == null) out.ruleDefinition = '';
          return out;
        }

        case 'calculateContrast': {
          return { id, ...raw, operator: 'calculateContrast' };
        }

        case 'customCode': {
          const out = { id, ...raw, operator: 'customCode' };
          if (out.code == null) out.code = '';
          return out;
        }

        case 'readmeLocationCheck': {
          return { id, ...raw, operator: 'readmeLocationCheck' };
        }

        case 'markdownRender': {
          const out = { id, ...raw, operator: 'markdownRender' };
          if (out.renderer == null) out.renderer = 'marked';
          if (out.output == null) out.output = 'html';
          return out;
        }

        case 'detectDuplicateSentences': {
          const out = { id, ...raw, operator: 'detectDuplicateSentences' };
          if (out.scope == null) out.scope = 'document';
          return out;
        }

        case 'isLinkAlive': {
          const out = { id, ...raw, operator: 'isLinkAlive' };
          if (out.timeout == null) out.timeout = 5000;
          if (!Array.isArray(out.allowed_status_codes)) {
            out.allowed_status_codes = [200, 301, 302, 307, 308];
          }
          if (out.scope == null) out.scope = 'document';
          return out;
        }

        case 'sage':
        case 'count':
        case 'length':
        case 'search':
        case 'threshold':
        case 'fixUsingLLM':
        case 'fixUsingLintMeCode': {
          return { id, ...raw };
        }

        default: {
          return { id, ...raw };
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

        if (step.comparison_mode === 'similarity' && step.similarity_method) {
          out.similarity_method = step.similarity_method;
        }
        if (step.comparison_mode === 'similarity' && typeof step.threshold === 'number') {
          out.threshold = step.threshold;
        }
      }

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
