export function buildAjvSchema(opSchema, opName) {
  const properties = {};
  const required = [];

  properties.operator = { type: 'string', const: opName };
  required.push('operator');

  properties.id = { type: 'string' };

  for (const [name, spec] of Object.entries(opSchema.fields || {})) {
    properties[name] = { ...spec };
    if (spec.required) required.push(name);
    delete properties[name].required; 
  }

  return {
    type: 'object',
    additionalProperties: false,
    properties,
    required
  };
}
