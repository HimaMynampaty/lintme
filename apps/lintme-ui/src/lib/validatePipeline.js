import Ajv from 'ajv';
import { parseYAML } from '../utils/yaml.js';
import { operatorSchemas } from './operatorSchemaIndex.js';
import { buildAjvSchema } from './buildAjvSchema.js';

const ajv = new Ajv({ allErrors: true, strict: false, useDefaults: true });

export function validatePipeline(ruleYaml) {
  const steps = parseYAML(ruleYaml);
  const errors = [];

  steps.forEach((step, i) => {
    const schema = operatorSchemas[step.operator];

    if (!schema) {
      errors.push({
        step: i,
        message: `Unknown operator "${step.operator}".`
      });
      return;
    }

    const stepSchema = buildAjvSchema(schema, step.operator);
    const validate = ajv.compile(stepSchema);
    if (!validate(step)) {
      for (const err of validate.errors) {
        if (err.keyword === 'additionalProperties') {
          const extra = err.params?.additionalProperty;
          errors.push({
            step: i,
            message: `Unknown property \`${extra}\``
          });
        } else {
          errors.push({
            step: i,
            message: `Field error ${err.instancePath || ''} – ${err.message}`
          });
        }
      }
    }

    if (schema.requiresPrevious) {
      const prev = steps[i - 1];

      const okOperator = (() => {
        const allowed = Array.isArray(schema.requiresPrevious.operator)
          ? schema.requiresPrevious.operator
          : [schema.requiresPrevious.operator];
        return !!prev && allowed.includes(prev.operator);
      })();

      const okTarget = (() => {
        if (!schema.requiresPrevious.target) return true;
        const allowed = Array.isArray(schema.requiresPrevious.target)
          ? schema.requiresPrevious.target
          : [schema.requiresPrevious.target];
        return !!prev && allowed.includes(prev.target);
      })();

      const okScopes = (() => {
        if (!schema.requiresPrevious.scopes) return true;
        const required = Array.isArray(schema.requiresPrevious.scopes)
          ? schema.requiresPrevious.scopes
          : [schema.requiresPrevious.scopes];
        const prevScopes = prev?.scopes ?? (prev?.scope ? [prev.scope] : []);
        return required.every(s => prevScopes.includes(s));
      })();

      if (!okOperator || !okTarget || !okScopes) {
        errors.push({
          step: i,
          message: schema.requiresPrevious.message
        });
      }
    }
  });

  return errors;
}
