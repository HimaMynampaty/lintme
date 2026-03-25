<script>
  export let data;

  $: data.model ||= 'gpt-4.1';    
  $: data.prompt ||= '';         

  const changed = () => dispatch('input');
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
</script>

<div class="space-y-4">
  <div>
    <label for="model" class="block text-sm font-medium text-gray-700 mb-1">
      Model
    </label>
    <select id="model"
            bind:value={data.model}
            class="w-full border border-gray-300 rounded px-3 py-2 text-sm
                   focus:outline-none focus:ring-2 focus:ring-indigo-500"
            on:change={changed}>
      <option value="gpt-4.1-mini">GPT-4.1-Mini</option>
      <option value="gpt-4.1">GPT-4.1</option>
    </select>
  </div>

  <div>
    <label for="prompt" class="block text-sm font-medium text-gray-700 mb-1">
      Prompt
    </label>
    <textarea id="prompt"
              rows="3"
              bind:value={data.prompt}
              class="w-full border border-gray-300 rounded px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Describe how the LLM should fix the issue..."
              on:input={changed}></textarea>
  </div>
</div>
