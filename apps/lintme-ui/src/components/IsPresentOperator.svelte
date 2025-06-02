<script>
  import { createEventDispatcher, onMount, tick } from 'svelte';
  import { pipeline } from '../stores/pipeline.js';

  export let data = {};
  export let storeIndex = 0;

  const dispatch = createEventDispatcher();
  const changed = () => dispatch('input');

  let hasFilter = false;
  let filteredTarget = '';
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
    hasFilter = false;
    filteredTarget = '';
    suggestions = [];

    for (let i = storeIndex - 1; i >= 0; i--) {
      const op = $pipeline[i];
      if (op?.operator === 'filter') {
        hasFilter = true;
        filteredTarget = op?.target ?? '';
        suggestions = knownFields[filteredTarget] ?? [];
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
        Common fields for <code>{filteredTarget}</code>: <strong>{suggestions.join(', ')}</strong>
      </p>
    {/if}
  </div>

  {#if !hasFilter}
    <p class="text-sm text-red-500">
      ⚠ Add a <code>filter</code> step before this <code>isPresent</code> step.
    </p>
  {/if}
</div>
