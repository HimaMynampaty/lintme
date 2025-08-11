import { operatorSchemas } from './operatorSchemaIndex.js';

export function buildMonacoYamlSchema() {
  const anyOfPerOperator = Object.entries(operatorSchemas).map(([name, def]) => {
    const { fields = {}, allOf, additionalProperties } = def;

    const properties = {
      operator: {
        type: 'string',
        enum: [name],
        enumDescriptions: [def.description ?? def.label ?? name],
        title: def.label ?? name,
        description: 'Operator to run for this step.'
      }
    };

    const required = ['operator'];

    for (const [key, spec] of Object.entries(fields)) {
      properties[key] = { ...spec };
      if (spec.description && !spec.markdownDescription) {
        properties[key].markdownDescription = spec.description;
      }
      if (spec.required) required.push(key);
    }

    const shape = {
      type: 'object',
      properties,
      required,
      additionalProperties:
        typeof additionalProperties === 'boolean' ? additionalProperties : false
    };

    if (allOf) shape.allOf = allOf;
    return shape;
  });

  return {
    $id: 'lintme.rule.schema',
    type: 'object',
    additionalProperties: false,
    properties: {
      rule: { type: 'string', description: 'Unique rule name.' },
      description: { type: 'string', description: 'Description of the rule.' },
      pipeline: {
        type: 'array',
        description: 'Ordered list of operators to execute.',
        items: { anyOf: anyOfPerOperator }
      }
    },
    required: ['rule', 'pipeline']
  };
}

export const getOperatorDescription = (name) =>
  operatorSchemas[name]?.description ?? operatorSchemas[name]?.label ?? name;

export const getOperatorFieldDescription = (op, field) =>
  operatorSchemas[op]?.fields?.[field]?.description ?? '';

export const operatorList = Object.entries(operatorSchemas).map(([name, s]) => ({
  name,
  label: s?.label ?? name,
  description: s?.description ?? ''
}));
