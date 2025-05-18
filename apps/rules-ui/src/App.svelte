<script>
  import OperatorPalette from "./components/OperatorPalette.svelte";
  import PipelineEditor from "./editor/PipelineEditor.svelte";
  import { pipeline } from "./stores/pipeline.js";
  import { generateYAML } from "./utils/yaml.js";

  let ruleName = "my-rule";
  let ruleDescription = "";
  let yamlText = "";

  $: yamlText = generateYAML(ruleName, ruleDescription, $pipeline);

  function openLintmeUI() {
    const encoded = encodeURIComponent(yamlText);
    window.open(`http://localhost:5173/?rule=${encoded}`, '_blank');
  }

</script>

<div class="min-h-screen bg-slate-50 font-sans text-gray-800 p-8">
  <h1 class="text-3xl font-bold text-center mb-8">Create Your Rule</h1>

  <div class="flex gap-6">
    <div class="w-1/3 space-y-4">
      <div class="bg-white p-4 rounded shadow">
        <h2 class="text-lg font-semibold mb-2">Add Operator</h2>
        <OperatorPalette />
      </div>
    </div>

    <div class="flex-1 space-y-6">
      <div class="bg-white p-4 rounded shadow">
        <h2 class="text-lg font-semibold mb-2">Rule Metadata</h2>

        <label class="block mb-1 font-medium" for="ruleName">Rule Name</label>
        <input
          id="ruleName"
          bind:value={ruleName}
          class="w-full border rounded px-2 py-1 mb-4"
          placeholder="e.g. emoji-density"
        />

        <label class="block mb-1 font-medium" for="ruleDescription"
          >Rule Description</label
        >
        <textarea
          id="ruleDescription"
          bind:value={ruleDescription}
          rows="2"
          class="w-full border rounded px-2 py-1"
          placeholder="What does this rule do?"
        ></textarea>
      </div>

      <PipelineEditor />

      <div class="bg-white p-4 rounded shadow">
        <div class="flex justify-between items-center mb-2">
          <h2 class="text-lg font-semibold">Generated YAML</h2>
<button
  class="bg-slate-700 text-white px-3 py-1 text-sm rounded hover:bg-slate-800 transition"
  on:click={openLintmeUI}
>
  Lint README
</button>
        </div>
        <pre
          class="bg-slate-800 text-green-100 p-4 rounded overflow-auto text-sm whitespace-pre-wrap">
{yamlText}
  </pre>
      </div>
    </div>
  </div>
</div>
