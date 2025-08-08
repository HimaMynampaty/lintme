<script>
  export let data;
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  const propagate = () => dispatch("input");

  $: data.fetchType ||= "path";
  $: data.metaPath ||= "";
  $: data.useCustomMetaPath ||= false;

  const metadataPresets = [
    { label: "Repository Info (root)", value: "" },
    { label: "Languages", value: "languages" },
    { label: "Contributors", value: "contributors" },
    { label: "Releases", value: "releases" },
    { label: "Commits", value: "commits" },
    { label: "Branches", value: "branches" },
  ];

  function handleMetaPresetChange(e) {
    const val = e.target.value;
    data.useCustomMetaPath = val === "__custom__";
    if (!data.useCustomMetaPath) {
      data.metaPath = val;
    }
    dispatch("input");
  }

  function handleCustomMetaInput(e) {
    data.metaPath = e.target.value.trim();
    dispatch("input");
  }
</script>

<div
  class="flex flex-col gap-4 bg-white border border-gray-200 p-4 rounded-xl shadow-sm"
>
  <div class="flex flex-col">
    <label for="repo-input" class="text-sm font-medium text-gray-700"
      >GitHub Repository (owner/repo)</label
    >
    <input
      id="repo-input"
      type="text"
      bind:value={data.repo}
      on:input={propagate}
      placeholder="openai/gpt-4"
      class="mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm
             focus:ring-indigo-500 focus:border-indigo-500 text-sm"
    />
  </div>

  <div class="flex flex-col">
    <label for="branch-input" class="text-sm font-medium text-gray-700"
      >Branch or Tag</label
    >
    <input
      id="branch-input"
      type="text"
      bind:value={data.branch}
      on:input={propagate}
      placeholder="main or v2.10.0"
      class="mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm
             focus:ring-indigo-500 focus:border-indigo-500 text-sm"
    />
  </div>

  {#if data.fetchType !== "metadata"}
    <div class="flex flex-col">
      <label for="file-name-input" class="text-sm font-medium text-gray-700"
        >File Name</label
      >
      <input
        id="file-name-input"
        type="text"
        bind:value={data.fileName}
        on:input={propagate}
        placeholder="README.md"
        class="mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm
               focus:ring-indigo-500 focus:border-indigo-500 text-sm"
      />
    </div>
  {:else}
    <div class="flex flex-col">
      <label
        for="metadata-type-select"
        class="text-sm font-medium text-gray-700"
      >
        Metadata Type
      </label>
      <select
        id="metadata-type-select"
        on:change={handleMetaPresetChange}
        class="mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm
         text-sm focus:ring-indigo-500 focus:border-indigo-500"
      >
        {#each metadataPresets as opt}
          <option
            value={opt.value}
            selected={!data.useCustomMetaPath && data.metaPath === opt.value}
          >
            {opt.label}
          </option>
        {/each}
        <option value="__custom__" selected={data.useCustomMetaPath}
          >Custom…</option
        >
      </select>
    </div>

    {#if data.useCustomMetaPath}
      <div class="flex flex-col">
        <label for="custom-meta-path" class="text-sm font-medium text-gray-700">
          Custom Metadata Path
        </label>
        <input
          id="custom-meta-path"
          type="text"
          bind:value={data.metaPath}
          on:input={handleCustomMetaInput}
          placeholder="e.g. git/refs/heads/main"
          class="mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm
         text-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
    {/if}
  {/if}

  <div class="flex flex-col">
    <label for="fetch-type-select" class="text-sm font-medium text-gray-700"
      >Fetch Type</label
    >
    <select
      id="fetch-type-select"
      bind:value={data.fetchType}
      on:change={propagate}
      class="mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm
             text-sm focus:ring-indigo-500 focus:border-indigo-500"
    >
      <option value="path">Fetch Path</option>
      <option value="content">Fetch Content</option>
      <option value="metadata">Fetch Metadata</option>
    </select>
  </div>
</div>
