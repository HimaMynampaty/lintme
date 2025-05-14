<script>
  import { createEventDispatcher } from 'svelte';
  export let data;
  const dispatch = createEventDispatcher();
  $: data.scopes ||= [];

  const targets = ['emoji', 'newline', 'date', 'word'];
  const scopes = ['line', 'paragraph', 'document', 'endoffile'];

  const changed = () => dispatch('input');
</script>

<div class="space-y-4">
  <div>
    <label for="target" class="text-sm font-medium">Target</label>
    <select bind:value={data.target} on:change={changed}
            class="w-full border px-3 py-1 rounded text-sm">
      {#each targets as t}
        <option value={t}>{t}</option>
      {/each}
    </select>
  </div>

  {#if data.target === 'word'}
    <div>
    <label for="wordInput" class="text-sm font-medium">Word to Match</label>
      <input type="text" bind:value={data.word} class="w-full border px-2 py-1 rounded text-sm" on:input={changed}/>
    </div>
  {/if}

  <fieldset>
    <label for="scopes" class="text-sm font-medium">Scopes</label>
    {#each scopes as s}
      <div class="flex gap-2 items-center">
        <input type="checkbox" value={s} bind:group={data.scopes} on:change={changed}
               class="h-4 w-4 text-indigo-600 border-gray-300 rounded"/>
        <label for={`scope-${s}`} class="text-sm">{s}</label>
        </div>
    {/each}
  </fieldset>
</div>
