export async function callBackendGroq({ model, system, context, user }) {
    const prompt =
        `${system}

${context}

[USER]
${user}

[RESPONSE RULES]
- Output YAML ONLY (no code fences, no prose).
- Keys must be: rule, description, pipeline.`;

    const res = await fetch("https://lintme-backend.onrender.com/api/groq-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, prompt })
    });

    if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`Backend error ${res.status}: ${body || res.statusText}`);
    }

    const data = await res.json().catch(() => ({}));
    const text = data?.result ?? data?.text ?? data?.content ?? "";
    if (!text || typeof text !== "string") {
        throw new Error("Backend returned no text.");
    }
    return text;
}
