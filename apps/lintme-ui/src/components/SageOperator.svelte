<script>
  import { createEventDispatcher } from 'svelte';
  export let data;        

  const dispatch = createEventDispatcher();
</script>

<p class="text-sm text-gray-600">
  This step converts the previous <code>heading</code> filtered into
  slug anchors (GitHub style). No configuration needed.
</p>
