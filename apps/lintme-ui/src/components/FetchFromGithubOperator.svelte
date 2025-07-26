<script>
  export let data;
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  const propagate = () => dispatch('input');
</script>

<div class="flex flex-col gap-4 bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
  <div class="flex flex-col">
    <label for="repo-input" class="text-sm font-medium text-gray-700">GitHub Repository (owner/repo)</label>
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
    <label for="branch-input" class="text-sm font-medium text-gray-700">Branch</label>
    <input
      id="branch-input"
      type="text"
      bind:value={data.branch}
      on:input={propagate}
      placeholder="main"
      class="mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm
             focus:ring-indigo-500 focus:border-indigo-500 text-sm"
    />
  </div>

  <div class="flex flex-col">
    <label for="file-name-input" class="text-sm font-medium text-gray-700">File Name</label>
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

  <div class="flex flex-col">
    <label for="fetch-type-select" class="text-sm font-medium text-gray-700">Fetch Type</label>
    <select
      id="fetch-type-select"
      bind:value={data.fetchType}
      on:change={propagate}
      class="mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm
             text-sm focus:ring-indigo-500 focus:border-indigo-500"
    >
      <option value="path">Fetch Path</option>
      <option value="content">Fetch Content</option>
    </select>
  </div>
</div>
