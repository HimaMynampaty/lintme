<script>
  import { createEventDispatcher, onDestroy } from 'svelte';

  export let data;
  const dispatch = createEventDispatcher();
  $: data.scopes ||= [];

  const targets = [
    'emoji','newline','image','internallink','externallink',
    'blockquote','break','code','definition','delete','emphasis',
    'footnote','footnoteDefinition','footnoteReference',
    'heading','html','imageReference','inlineCode','link','linkReference',
    'list','listItem','paragraph','root','strong','table','tableCell',
    'tableRow','text','thematicBreak','toml','yaml'
  ].sort();

  const scopes = ['line','paragraph','document','endoffile'];

  let openSuggestions   = false;
  let showScopeMenu     = false;
  let filtered          = targets;           
  let extracted       = -1;              

  $: {
    const q = (data.target || '').toLowerCase();
    filtered = q ? targets.filter(t => t.includes(q)) : targets;
    if (filtered.length === 0) extracted = -1;
    else if (extracted >= filtered.length) extracted = 0;
  }

  function chooseTarget(t) {
    data.target = t;
    openSuggestions = false;
    extracted = filtered.indexOf(t);
    dispatch('input');
  }

  function onTargetInput(e) {
    data.target = e.target.value;
    openSuggestions = true;
    extracted = -1;
    dispatch('input');
  }

  function onTargetKey(e) {
    if (!openSuggestions || filtered.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      extracted = (extracted + 1 + filtered.length) % filtered.length;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      extracted = (extracted - 1 + filtered.length) % filtered.length;
    }
    if (e.key === 'Enter' && extracted !== -1) {
      e.preventDefault();
      chooseTarget(filtered[extracted]);
    }
  }

  function toggleScope(s) {
    const idx = data.scopes.indexOf(s);
    data.scopes = idx === -1
      ? [...data.scopes, s]
      : data.scopes.filter(x => x !== s);
    dispatch('input');
  }

  const targetId      = 'target-'  + Math.random().toString(36).slice(2);
  const scopeToggleId = 'scopes-'  + Math.random().toString(36).slice(2);

  function handleOutside(e) {
    if (!e.target.closest('.combo'))      openSuggestions = false;
    if (!e.target.closest('.scope-box'))  showScopeMenu   = false;
  }
  window.addEventListener('click', handleOutside);
  onDestroy(() => window.removeEventListener('click', handleOutside));
</script>

<div class="space-y-4">
  <div>
    <label for={targetId} class="text-sm font-medium">Target</label>

    <div class="relative combo">
      <input
        id={targetId}
        class="w-full border px-3 py-1 rounded text-sm"
        placeholder="type or pick e.g. heading, link"
        bind:value={data.target}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={openSuggestions}
        aria-controls="target-listbox"
        aria-activedescendant={extracted !== -1 ? `opt-${extracted}` : undefined}
        on:input={onTargetInput}
        on:focus={() => (openSuggestions = true)}
        on:keydown={onTargetKey}
      />

      {#if openSuggestions}
        <ul
          id="target-listbox"
          role="listbox"
          class="absolute z-10 mt-1 w-full bg-white border rounded shadow
                 text-sm max-h-40 overflow-y-auto"
        >
          {#if filtered.length === 0}
            <li
              role="option"
              id="opt-empty"
              aria-disabled="true"
              aria-selected="false"
              class="px-3 py-1 text-gray-500"
            >
              No match
            </li>
          {:else}
          {#each filtered as t, i}
            <li
              role="option"
              id={`opt-${i}`}
              aria-selected={data.target === t}
              class="cursor-pointer px-3 py-1 hover:bg-gray-100
                    {i === extracted ? 'bg-gray-100' : ''}"
              tabindex="-1"
              on:click={() => chooseTarget(t)}
              on:keydown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  chooseTarget(t);
                }
              }}
            >
              {t}
            </li>
          {/each}

          {/if}
        </ul>
      {/if}
    </div>
  </div>

  <div class="relative scope-box">
    <label for={scopeToggleId} class="text-sm font-medium block mb-1">Scopes</label>

    <button
      id={scopeToggleId}
      class="w-full border rounded px-3 py-1 text-sm bg-white text-left"
      aria-haspopup="listbox"
      aria-expanded={showScopeMenu}
      type="button"
      on:click={() => (showScopeMenu = !showScopeMenu)}
    >
      {#if data.scopes.length}
        {data.scopes.join(', ')}
      {:else}
        <span class="text-gray-400">Select scopes…</span>
      {/if}
    </button>

    {#if showScopeMenu}
      <div
        class="absolute z-10 mt-1 w-full bg-white border rounded shadow text-sm"
        role="listbox"
      >
        {#each scopes as s}
          <div class="px-3 py-1 hover:bg-gray-100 flex items-center gap-2">
            <input
              id={`scope-${s}`}
              type="checkbox"
              checked={data.scopes.includes(s)}
              on:change={() => toggleScope(s)}
            />
            <label for={`scope-${s}`} class="text-sm">{s}</label>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .combo ul { box-sizing: border-box; }
</style>
