import Ajv from 'ajv';
import { parseYAML } from '../utils/yaml.js';
import { operatorSchemas } from './operatorSchemaIndex.js';
import { buildAjvSchema } from './buildAjvSchema.js';

const ajv = new Ajv({
  allErrors: true,
  strict: false,
  useDefaults: true,
  allowUnionTypes: true 
});

function priority(kw) {
  if (kw === 'unevaluatedProperties' || kw === 'additionalProperties' || kw === 'propertyNames') return 0;
  if (kw === 'required') return 1;
  return 2;
}

export function validatePipeline(ruleYaml) {
  const steps = parseYAML(ruleYaml);
  const errors = [];

  steps.forEach((step, i) => {
    const schema = operatorSchemas[step.operator];
    if (!schema) {
      errors.push({ step: i, message: `Unknown operator "${step.operator}".` });
      return;
    }

    const stepSchema = buildAjvSchema(schema, step.operator);
    const validate = ajv.compile(stepSchema);

    if (!validate(step)) {
      const sorted = [...validate.errors].sort((a, b) => priority(a.keyword) - priority(b.keyword));
      for (const err of sorted) {
        if (err.keyword === 'unevaluatedProperties' || err.keyword === 'additionalProperties' || err.keyword === 'propertyNames') {
          const extra =
            err.params?.additionalProperty ??
            err.params?.unevaluatedProperty ??
            err.params?.propertyName;
          errors.push({ step: i, message: `Unknown property \`${extra}\`` });
        } else if (err.keyword === 'required') {
          errors.push({ step: i, message: `Missing required property \`${err.params?.missingProperty}\`` });
        } else {
          const path = err.instancePath || '';
          errors.push({ step: i, message: `Field error ${path} – ${err.message}` });
        }
      }
    }

    if (schema.requiresPrevious) {
      const prev = steps[i - 1];
      const reqPrev = schema.requiresPrevious;

      const okOperator = (() => {
        if (!prev) return false;
        const req = reqPrev.operator;
        if (!req || req === '*') return true;
        const allowed = Array.isArray(req) ? req : [req];
        return allowed.includes(prev.operator);
      })();

      const okTarget = (() => {
        const req = reqPrev.target;
        if (!req) return true;
        if (!prev) return false;
        if (req === '*') return !!prev.target;
        const allowed = Array.isArray(req) ? req : [req];
        return allowed.includes(prev.target);
      })();

      const okScopes = (() => {
        const req = reqPrev.scopes;
        if (!req) return true;
        if (!prev) return false;
        const prevScopes = prev?.scopes ?? (prev?.scope ? [prev.scope] : []);
        if (req === '*') return Array.isArray(prevScopes) && prevScopes.length > 0;
        const required = Array.isArray(req) ? req : [req];
        return required.every(s => prevScopes.includes(s));
      })();

      if (!okOperator || !okTarget || !okScopes) {
        errors.push({ step: i, message: reqPrev.message });
      }
    }
  });

  return errors;
}
