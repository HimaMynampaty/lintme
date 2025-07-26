<script>
  import { pipeline } from '../stores/pipeline.js';
  export let storeIndex;
  export let data;

  let isValid = false;

  $: {
    const steps = $pipeline;
    const prev = steps?.[storeIndex - 1];
    isValid = prev?.operator === 'extract' && prev?.target === 'html';
  }
</script>

{#if !isValid}
  <p class="text-sm text-red-500">
    ⚠ The <code>calculateContrast</code> operator requires the previous step to be
    <code>extract</code> with target <code>html</code>.
  </p>
{/if}
