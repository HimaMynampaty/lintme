<script>
  import { pipeline } from "../stores/pipeline.js";
  export let storeIndex;

  let isValid = false;
  let hasPrev = false;

  $: {
    const steps = $pipeline;
    const prev = steps?.[storeIndex - 1];
    hasPrev = !!prev;
    isValid =
      prev?.operator === "extract" &&
      prev?.target === "html" &&
      (prev?.scope === "document" || prev?.scopes?.includes("document"));
  }
</script>

{#if hasPrev && !isValid}
  <p class="text-sm text-red-500" role="alert" aria-live="polite">
    The <code>calculateContrast</code> operator requires the previous step to be
    <code>extract</code> with target <code>html</code> and scope <code>document</code>.
  </p>
{/if}
