<script>
    export let data = { model: "llama-3.3-70b-versatile", prompt: "" };
    $: data.model ||= "llama-3.3-70b-versatile";
    $: data.prompt ||= "";

    import { createEventDispatcher } from "svelte";
    import { suggestRuleFromIdea } from "../lib/llm/suggestRule.js";

    const dispatch = createEventDispatcher();
    let state = "idle";
    let lastError = "";

    async function onGenerate() {
        if (!data.prompt.trim()) {
            alert("Please enter a prompt describing your lint idea.");
            return;
        }
        state = "running";
        lastError = "";
        try {
            const { yaml, name } = await suggestRuleFromIdea({
                idea: data.prompt,
                model: data.model,
            });
            dispatch("generated", { yaml, errors: [], name });
            state = "success";
            setTimeout(() => (state = "idle"), 1400);
        } catch (e) {
            lastError = String(e?.message || e);
            state = "error";
            setTimeout(() => (state = "idle"), 1800);
        }
    }
</script>

<div class="space-y-3">
    <div>
        <label for="model-select" class="block text-sm font-medium mb-1"
            >Model</label
        >
        <select
            id="model-select"
            bind:value={data.model}
            class="w-full border rounded px-3 py-2 text-sm"
        >
            <option value="llama-3.3-70b-versatile"
                >llama-3.3-70b-versatile</option
            >
            <option value="gemma2-9b-it">gemma2-9b-it</option>
            <option value="openai/gpt-oss-120b">openai/gpt-oss-120b</option>
        </select>
    </div>

    <div>
        <label for="prompt-textarea" class="block text-sm font-medium mb-1"
            >Prompt</label
        >
        <textarea
            id="prompt-textarea"
            rows="3"
            bind:value={data.prompt}
            class="w-full border rounded px-3 py-2 text-sm"
            placeholder="Describe the lint you want"
        ></textarea>
    </div>

    <div class="flex gap-2 items-center">
        <button
            on:click={onGenerate}
            disabled={state === "running"}
            class:running={state === "running"}
            class:success={state === "success"}
            class:error={state === "error"}
        >
            {#if state === "running"}
                Generating…<span class="loader-spinner" />
            {:else if state === "success"}
                Generated
            {:else if state === "error"}
                Failed
            {:else}
                Generate with LLM
            {/if}
        </button>

        {#if state === "error" && lastError}
            <span
                class="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1"
                >{lastError}</span
            >
        {/if}
    </div>
</div>
