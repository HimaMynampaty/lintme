<script>
  import { createEventDispatcher, onMount } from 'svelte';

  export let data = {};
  const dispatch = createEventDispatcher();

  const renderers = ['marked', 'markdown-it', 'puppeteer', 'playwright'];
  const outputs = ['html', 'dom', 'image'];

  const rendererId = 'renderer-' + Math.random().toString(36).slice(2);
  const outputId   = 'output-'   + Math.random().toString(36).slice(2);

  onMount(() => {
    data.operator ??= 'markdownRender';
    data.renderer ??= 'marked';
    data.output   ??= 'html';
    data.image    ??= {
      viewport: { width: 800, height: 600 },
      threshold: 0.1
    };
    dispatch('input');
  });

  function update() {
    dispatch('input');
  }
</script>

<div>
  <label for={rendererId} class="text-sm font-medium block mb-1">Renderer</label>
  <select
    id={rendererId}
    bind:value={data.renderer}
    class="w-full border rounded px-3 py-2 text-sm"
    on:change={update}
  >
    {#each renderers as r}
      <option value={r}>{r}</option>
    {/each}
  </select>
</div>

<div>
  <label for={outputId} class="text-sm font-medium block mb-1">Output Type</label>
  <select
    id={outputId}
    bind:value={data.output}
    class="w-full border rounded px-3 py-2 text-sm"
    on:change={update}
  >
    {#each outputs as o}
      <option value={o}>{o}</option>
    {/each}
  </select>
</div>
