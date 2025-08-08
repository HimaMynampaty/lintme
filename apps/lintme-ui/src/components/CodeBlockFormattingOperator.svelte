<script>
    import { createEventDispatcher } from "svelte";

    export let data;
    const dispatch = createEventDispatcher();

    $: data.allowedLanguages ||= [];
    $: data.allowedFormats ||= ["fenced"];

    function updateLanguages(event) {
        data.allowedLanguages = event.target.value
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        dispatch("input");
    }

    function toggleFormat(format) {
        data.allowedFormats = data.allowedFormats.includes(format)
            ? data.allowedFormats.filter((f) => f !== format)
            : [...data.allowedFormats, format];
        dispatch("input");
    }
</script>

<div class="space-y-4">
    <div>
        <label
            class="text-sm font-medium block mb-1"
            for="languages"
            title="Comma separated list of allowed languages for code blocks"
        >
            Allowed Languages
        </label>
        <input
            id="languages"
            class="w-full border px-3 py-1 rounded text-sm"
            type="text"
            placeholder="e.g., javascript, python"
            value={data.allowedLanguages.join(", ")}
            on:input={updateLanguages}
        />
    </div>

    <fieldset class="space-y-1">
        <legend
            class="text-sm font-medium mb-1"
            title="Choose allowed code block formats"
        >
            Allowed Formats
        </legend>

        <label class="flex items-center gap-2 text-sm">
            <input
                type="checkbox"
                checked={data.allowedFormats.includes("fenced")}
                on:change={() => toggleFormat("fenced")}
            />
            Fenced (``` )
        </label>

        <label class="flex items-center gap-2 text-sm">
            <input
                type="checkbox"
                checked={data.allowedFormats.includes("indented")}
                on:change={() => toggleFormat("indented")}
            />
            Indented (4 spaces)
        </label>
    </fieldset>
</div>
