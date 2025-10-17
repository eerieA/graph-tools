<script lang="ts">
  import { useOnSelectionChange } from '@xyflow/svelte';
  export let onSelect: (node: any | null) => void;

  // run the hook here, because this component will be mounted *inside* SvelteFlowProvider
  useOnSelectionChange(({ nodes }) => {
    onSelect(nodes.length > 0 ? nodes[0] : null);
  });
</script>
