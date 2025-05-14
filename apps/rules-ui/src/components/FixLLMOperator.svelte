<script>
  export let data;

  $: data.model ||= 'llama-3';    // default model
  $: data.prompt ||= '';          // default prompt

  const changed = () => dispatch('input');
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
</script>

<div class="space-y-4">
  <!-- Model Selection -->
  <div>
    <label for="model" class="block text-sm font-medium text-gray-700 mb-1">
      Model
    </label>
    <select id="model"
            bind:value={data.model}
            class="w-full border border-gray-300 rounded px-3 py-2 text-sm
                   focus:outline-none focus:ring-2 focus:ring-indigo-500"
            on:change={changed}>
      <option value="llama-3.3-70b-versatile">llama-3</option>
      <option value="gemma2-9b-it">gemma2</option>
    </select>
  </div>

  <!-- Prompt Textarea -->
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
