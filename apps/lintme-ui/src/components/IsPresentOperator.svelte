<script>
  import { createEventDispatcher, onMount, tick } from 'svelte';
  import { pipeline } from '../stores/pipeline.js';

  export let data = {};
  export let storeIndex = 0;

  const dispatch = createEventDispatcher();
  const changed = () => dispatch('input');

  let hasExtract = false;
  let extractedTarget = '';
  let suggestions = [];

  const knownFields = {
    image: ['alt', 'title', 'url'],
    link: ['title', 'url'],
    code: ['lang'],
    listItem: ['checked'],
    paragraph: ['content'],
    heading: ['depth'],
  };

  $: {
    hasExtract = false;
    extractedTarget = '';
    suggestions = [];

    for (let i = storeIndex - 1; i >= 0; i--) {
      const op = $pipeline[i];
      if (op?.operator === 'extract') {
        hasExtract = true;
        extractedTarget = op?.target ?? '';
        suggestions = knownFields[extractedTarget] ?? [];
        break;
      }
    }
  }

  onMount(async () => {
    data.operator ??= 'isPresent';
    data.target ??= '';
    await tick();
    dispatch('input');
  });
</script>

<div class="space-y-4">
  <div>
    <label class="text-sm font-medium text-gray-700" for="present-field">
      Field to check presence of
    </label>
    <input
      id="present-field"
      type="text"
      class="w-full border rounded px-3 py-2 text-sm"
      bind:value={data.target}
      placeholder={suggestions.length > 0 ? `e.g. ${suggestions.join(', ')}` : 'e.g. alt, title, demo'}
      on:input={changed}
    />
    {#if suggestions.length > 0}
      <p class="text-xs text-gray-500 mt-1">
        Common fields for <code>{extractedTarget}</code>: <strong>{suggestions.join(', ')}</strong>
      </p>
    {/if}
  </div>

  {#if !hasExtract}
    <p class="text-sm text-red-500">
      ⚠ Add a <code>extract</code> step before this <code>isPresent</code> step.
    </p>
  {/if}
</div>
