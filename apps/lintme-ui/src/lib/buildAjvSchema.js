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

  if (opSchema.properties && typeof opSchema.properties === 'object') {
    for (const [name, propSchema] of Object.entries(opSchema.properties)) {
      if (name === 'operator') continue;
      properties[name] = propSchema;
    }
  }

  if (Array.isArray(opSchema.required) && opSchema.required.length) {
    for (const r of opSchema.required) {
      if (!required.includes(r)) required.push(r);
    }
  }

  const out = {
    type: 'object',
    additionalProperties: opSchema.additionalProperties ?? false,
    unevaluatedProperties: opSchema.unevaluatedProperties ?? false,
    properties,
    required
  };

  if (opSchema.$id) out.$id = opSchema.$id;
  if (opSchema.$schema) out.$schema = opSchema.$schema;
  if (opSchema.title) out.title = opSchema.title;
  if (opSchema.description) out.description = opSchema.description;

  const PASS_KEYS = [
    'allOf', 'anyOf', 'oneOf', 'not',
    'if', 'then', 'else',
    'dependencies', 'dependentSchemas', 'dependentRequired',
    '$defs', 'definitions',
    'patternProperties', 'propertyNames', 'unevaluatedProperties'
  ];
  for (const k of PASS_KEYS) {
    if (opSchema[k] != null) out[k] = opSchema[k];
  }

  return out;
}
