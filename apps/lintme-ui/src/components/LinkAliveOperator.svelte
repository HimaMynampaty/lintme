<script>
  import { createEventDispatcher, onMount } from 'svelte';

  export let data = {};
  const dispatch = createEventDispatcher();

  const DEFAULT_CODES = [200, 204, 301, 302, 307, 308];

  $: data.timeout ??= 5000;
  $: data.allowed_status_codes ??= [...DEFAULT_CODES];

  let customInput = '';

  $: customInput = (data.allowed_status_codes || [])
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b)
    .join('\n');

  function updateCodesFromTextarea() {
    const lines = (customInput || '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const parsed = lines
      .map((s) => Number(s))
      .filter((n) => Number.isFinite(n) && n >= 0);

    data.allowed_status_codes = Array.from(new Set(parsed)).sort((a, b) => a - b);
  dispatch('input');
  }

  function onTimeoutInput() {
    dispatch('input');
  }

  onMount(() => {
    dispatch('input');
  });
</script>

<div class="space-y-3">
  <div>
    <label for="timeout-ms" class="text-sm font-medium block mb-1">Timeout (ms)</label>
    <input
      id="timeout-ms"
      type="number"
      class="w-full border rounded px-3 py-1 text-sm"
      bind:value={data.timeout}
      min="0"
      step="100"
      on:input={onTimeoutInput}
    />
  </div>

  <div>
    <label for="custom-codes" class="text-sm font-medium block mb-1">
      Allowed status codes (one per line)
    </label>
    <textarea
      id="custom-codes"
      class="w-full border rounded p-2 text-sm h-28"
      bind:value={customInput}
      on:input={updateCodesFromTextarea}
      placeholder="e.g.\n200\n204\n301"
    />
  </div>
</div>
