<script lang="ts">
  import { useOnSelectionChange } from '@xyflow/svelte';
  export let onSelectNode: (node: any | null) => void;
  export let onSelectEdge: (edge: any | null) => void;

  useOnSelectionChange(({ nodes, edges }) => {
    if (nodes.length > 0) {
      onSelectNode(nodes[0]);
      onSelectEdge(null); // clear edge selection when node is selected
    } else if (edges.length > 0) {
      onSelectEdge(edges[0]);
      onSelectNode(null); // clear node selection when edge is selected
    } else {
      onSelectNode(null);
      onSelectEdge(null);
    }
  });
</script>
