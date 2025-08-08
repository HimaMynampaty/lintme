<script>
  import { createEventDispatcher } from 'svelte';
  export let data = {};
  const dispatch = createEventDispatcher();
  const changed = () => dispatch('input');

  $: data.timeout ??= 5000;
</script>

<div class="space-y-4">
  <div>
    <label for="timeout-input" class="text-sm font-medium block mb-1">Timeout (ms)</label>
    <input
      id="timeout-input"
      type="number"
      class="w-full border rounded px-3 py-1 text-sm"
      bind:value={data.timeout}
      min="0"
      step="100"
      on:input={changed}
    />
  </div>
</div>
