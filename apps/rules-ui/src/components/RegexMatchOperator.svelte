<script>
  import { createEventDispatcher } from 'svelte';
  export let data;
  const dispatch = createEventDispatcher();

  const changed = () => dispatch('input');
</script>

<div class="space-y-4">
  <div>
    <label class="text-sm font-medium" for="pattern">Regex Pattern</label>
    <input
      id="pattern"
      class="w-full border px-3 py-1 rounded text-sm"
      bind:value={data.pattern}
      on:input={changed}
      placeholder="e.g. \\[.*?\\]\\(.*?\\)"
    />
  </div>
</div>
