import YAML from "yaml";
import { operatorSchemas } from "../operatorSchemaIndex.js";

function extractEnum(def) {
    if (Array.isArray(def?.enum)) return def.enum;
    if (Array.isArray(def?.oneOf)) {
        for (const o of def.oneOf) if (Array.isArray(o?.enum)) return o.enum;
    }
    if (def?.items && Array.isArray(def.items.enum)) return def.items.enum;
    return null;
}

function extractType(def) {
    if (typeof def?.type === "string") return def.type;
    if (Array.isArray(def?.type)) return def.type.join("|");
    if (Array.isArray(def?.oneOf)) {
        const ts = def.oneOf.map(o => o.type || (Array.isArray(o.enum) ? "string" : null)).filter(Boolean);
        if (ts.length) return Array.from(new Set(ts)).join("|");
    }
    return "any";
}

export function buildAllowlist() {
    return Object.entries(operatorSchemas).map(([id, schema]) => {
        const fieldsObj = schema.fields || {};
        const fields = Object.entries(fieldsObj).map(([name, def]) => ({
            name,
            type: extractType(def),
            enum: extractEnum(def),
            required: Array.isArray(schema.required) ? schema.required.includes(name) : Boolean(def?.required),
            default: def?.default,
            description: schema?.fieldDescriptions?.[name] || def?.description || ""
        }));

        const examples = [];
        if (Array.isArray(schema.examples) && schema.examples.length) {
            for (const ex of schema.examples) examples.push(YAML.stringify(ex).trim());
        } else if (schema.example) {
            examples.push(YAML.stringify(schema.example).trim());
        } else {
            examples.push(YAML.stringify({ operator: id }).trim());
        }

        return {
            id,
            desc: schema.description || schema.label || id,
            fields,
            examplesYaml: examples
        };
    });
}
