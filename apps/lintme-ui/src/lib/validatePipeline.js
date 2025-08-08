import Ajv from 'ajv';
import { parseYAML } from '../utils/yaml.js';
import { operatorSchemas } from './operatorSchemaIndex.js';
import { buildAjvSchema } from './buildAjvSchema.js';

const ajv = new Ajv({ allErrors: true, strict: false });

export function validatePipeline(ruleYaml) {
  const steps = parseYAML(ruleYaml); 
  const errors = [];
  const writes = new Set();      

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
      const allowed = Array.isArray(schema.requiresPrevious.operator)
        ? schema.requiresPrevious.operator
        : [schema.requiresPrevious.operator];

      if (!prev || !allowed.includes(prev.operator)) {
        errors.push({
          step: i,
          message: schema.requiresPrevious.message
        });
      }
    }

    (schema.produces?.contextWrites || []).forEach(p => writes.add(p));

        if (
        schema.requiresContext &&
        ![...writes].some(w => w.startsWith(schema.requiresContext.path))
        ) {
        errors.push({
            step: i,
            message: schema.requiresContext.message
        });
        }

  });

  return errors;
}
