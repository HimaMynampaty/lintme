import YAML from "yaml";
import { buildAllowlist } from "./allowList.js";
import { callBackendGroq } from "./llmClient.js";
import { validatePipeline } from "../validatePipeline.js";

function makeSystem() {
    return [
        "You are a README linter rule designer.",
        "Return YAML ONLY with keys: rule, description, pipeline.",
        "Use ONLY operator ids listed in the OPERATORS CATALOG.",
        "Use only the fields listed for each operator under Allowed fields.",
        "Do not add fields that are not listed.",
        "Use enum values exactly as listed when present.",
        "Include a field only if it appears in Allowed fields for that operator.",
        "YAML only. No prose. No code fences.",
        "Prefer built-in operators; use customCode only if no built-in can achieve the goal."
    ].join(" ");
}

function makeContext(allow) {
    const items = allow.map(op => {
        const allowedNames = op.fields.map(f => f.name);
        const fieldsBlock = op.fields.length
            ? op.fields.map(f => {
                const parts = [
                    `      - name: ${f.name}`,
                    `        type: ${f.type}`
                ];
                if (f.enum && f.enum.length) parts.push(`        enum: [${f.enum.join(", ")}]`);
                if (f.required) parts.push(`        required: true`);
                if (f.default !== undefined) parts.push(`        default: ${JSON.stringify(f.default)}`);
                if (f.description) parts.push(`        description: ${JSON.stringify(f.description)}`);
                return parts.join("\n");
            }).join("\n")
            : "      []";

        const examples = op.examplesYaml.length
            ? `\n    examples:\n${op.examplesYaml.map(y => `      - |\n${y.split("\n").map(l => "        " + l).join("\n")}`).join("\n")}`
            : "";

        return `  - id: ${op.id}
    description: ${JSON.stringify(op.desc)}
    allowedFields: [${allowedNames.join(", ")}]
    fields:
${fieldsBlock}${examples}`;
    }).join("\n");

    return `OPERATORS CATALOG:
${items}`;
}

export async function suggestRuleFromIdea({ idea, model = "llama-3.3-70b-versatile" }) {
    const allow = buildAllowlist();
    const system = makeSystem();
    const context = makeContext(allow);
    const user = [`Idea: ${idea}`, "Return the final YAML now."].join("\n");

    let yaml = await callBackendGroq({ model, system, context, user });

    let obj;
    try { obj = YAML.parse(yaml); } catch { throw new Error("Model did not return YAML."); }
    if (!obj || !Array.isArray(obj.pipeline)) throw new Error("YAML must have keys: rule, description, pipeline[].");

    const allowed = new Set(allow.map(o => o.id));
    const unknown = obj.pipeline.map(s => s?.operator).filter(op => !allowed.has(op));
    if (unknown.length) throw new Error(`Unknown/forbidden operators: ${[...new Set(unknown)].join(", ")}`);

    let errs = validatePipeline(YAML.stringify(obj));
    if (errs.length) {
        const repairSystem = [
            "Fix the YAML to satisfy these validation errors.",
            "Return YAML ONLY with keys: rule, description, pipeline.",
            "Use ONLY operator ids listed in the OPERATORS CATALOG.",
            "Use only fields listed under Allowed fields for each operator.",
            "Do not add fields that are not listed.",
            "Use enum values exactly as listed.",
            "YAML only. No prose. No code fences."
        ].join(" ");

        const repairUser = [
            "Validation errors:",
            ...errs.map(e => `- ${e.message ?? String(e)}`),
            "Return corrected YAML now.",
            "",
            "Original YAML:",
            YAML.stringify(obj)
        ].join("\n");

        yaml = await callBackendGroq({ model, system: repairSystem, context, user: repairUser });

        obj = YAML.parse(yaml);
        const unknown2 = obj.pipeline.map(s => s?.operator).filter(op => !allowed.has(op));
        if (unknown2.length) throw new Error(`Unknown/forbidden operators after repair: ${[...new Set(unknown2)].join(", ")}`);
        const errs2 = validatePipeline(YAML.stringify(obj));
        if (errs2.length) throw new Error("Validation failed after repair.");
    }

    return {
        yaml,
        name: obj.rule || "(unnamed)",
        operators: Array.from(new Set(obj.pipeline.map(s => s.operator)))
    };
}
