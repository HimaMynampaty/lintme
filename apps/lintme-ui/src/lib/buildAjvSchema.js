export function buildAjvSchema(opSchema, opName) {
  const properties = {
    operator: { type: 'string', const: opName },
    id: { type: 'string' }
  };
  const required = ['operator'];

  for (const [name, spec] of Object.entries(opSchema.fields || {})) {
    const { required: isReq, ...rest } = spec;   
    properties[name] = { ...rest };
    if (isReq === true) required.push(name);
  }

  return {
    type: 'object',
    additionalProperties: opSchema.additionalProperties === true,
    properties,
    required
  };
}
