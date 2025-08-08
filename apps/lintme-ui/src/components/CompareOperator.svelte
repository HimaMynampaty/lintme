<script>
  import { createEventDispatcher } from 'svelte';
  import { pipeline } from '../stores/pipeline.js';

  export let data;
  export let storeIndex;

  const dispatch = createEventDispatcher();

  $: steps = $pipeline.slice(1, storeIndex).map((s, i) => ({
    label: `${i + 1} · ${s.operator}`,
    value: i + 1
  }));

  $: data.comparison_mode ??= "structural";
  $: data.similarity_method ??= "embedding_cosine";
  $: data.threshold ??= 80;

  const similarityMethods = [
    "embedding_cosine",
    "cosine",
    "sectional_embedding",
    "euclidean",
    "damerau_levenshtein",
  ];

  const update = () => dispatch('input');

  function onBaselineChange(e) {
    const v = e.target.value;
    data.baseline = v === '' ? '' : Number(v);
    update();
  }

  function onAgainstChange(e) {
    const v = e.target.value;
    data.against = v === '' ? '' : Number(v);
    update();
  }

  function onThresholdInput(e) {
    const n = Number(e.target.value);
    const clamped = Math.max(0, Math.min(100, isNaN(n) ? 0 : n));
    data.threshold = clamped;
    update();
  }
</script>

<div class="space-y-4">
  <div class="space-y-2">
    <label for="baseline-select" class="text-sm font-medium block">Baseline step</label>
    <select id="baseline-select" bind:value={data.baseline} on:change={onBaselineChange}
            class="w-full border px-2 py-1 rounded text-sm">
      <option value="">– pick –</option>
      {#each steps as s}
        <option value={s.value}>{s.label}</option>
      {/each}
    </select>

    <label for="against-select" class="text-sm font-medium block mt-2">Compare against</label>
    <select id="against-select" bind:value={data.against} on:change={onAgainstChange}
            class="w-full border px-2 py-1 rounded text-sm">
      <option value="">– pick –</option>
      {#each steps as s}
        <option value={s.value}>{s.label}</option>
      {/each}
    </select>

    {#if !(data.baseline && data.against)}
      <p class="text-xs text-gray-500">Select two earlier steps to compare.</p>
    {/if}
  </div>

  <div>
    <label for="comparison-mode" class="text-sm font-medium block">Comparison Mode</label>
    <select id="comparison-mode" bind:value={data.comparison_mode} on:change={update}
            class="w-full border px-2 py-1 rounded text-sm">
      <option value="structural">Structural Compare</option>
      <option value="similarity">Similarity Score Compare</option>
    </select>
    <p class="text-xs text-gray-500 mt-1">
      <strong>Structural:</strong> Checks for missing/extra items or DOM/image changes.<br />
      <strong>Similarity:</strong> Measures meaning-level similarity between two steps using selected methods.
    </p>
  </div>

  {#if data.comparison_mode === "similarity"}
    <div class="space-y-2">
      <label for="similarity-method" class="text-sm font-medium block">Similarity Method</label>
      <select id="similarity-method" bind:value={data.similarity_method} on:change={update}
              class="w-full border px-2 py-1 rounded text-sm">
        {#each similarityMethods as m}
          <option value={m}>{m}</option>
        {/each}
      </select>

      <label for="threshold" class="text-sm font-medium block mt-2">Threshold (%)</label>
      <input
        id="threshold"
        type="number"
        min="0"
        max="100"
        bind:value={data.threshold}
        class="w-full border px-2 py-1 rounded text-sm"
        on:input={onThresholdInput} />
      <p class="text-xs text-gray-500">
        Minimum similarity score (e.g. 80 = 80% similarity required to pass).
      </p>
    </div>
  {/if}
</div>
