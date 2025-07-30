<script>
  export let data;
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  $: data.model ||= 'llama-3.3-70b-versatile';
$: if (data.ruleDefinition === undefined) {
  data.ruleDefinition = 'Evaluate the content based on the following rule:';
}

  const changed = () => dispatch('input');
</script>

<div class="space-y-4">
  <div>
    <label for="model" class="block text-sm font-medium text-gray-700 mb-1">
      Model
    </label>
    <select
      id="model"
      bind:value={data.model}
      class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      on:change={changed}
    >
      <option value="llama-3.3-70b-versatile">llama-3</option>
      <option value="gemma2-9b-it">gemma2</option>
    </select>
  </div>

  <div>
    <label for="ruleDefinition" class="block text-sm font-medium text-gray-700 mb-1">
      Rule Definition
    </label>
    <textarea
      id="ruleDefinition"
      rows="4"
      bind:value={data.ruleDefinition}
      class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      placeholder="Describe the rule that the content should be evaluated against..."
      on:input={changed}
    />
  </div>
</div>
