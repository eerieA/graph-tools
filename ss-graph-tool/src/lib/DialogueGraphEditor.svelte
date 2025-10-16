<script lang="ts">
  import { SvelteFlow, Background, Controls, MiniMap, type Node, type Edge } from '@xyflow/svelte';

  import '@xyflow/svelte/dist/style.css';

  import DialogueNode from './nodes/DialogueNode.svelte';
  import { sampleGraph } from './data/sampleGraph';
  import { adaptDialogueGraphToFlow } from './utils/graphAdapter';

  // Convert our DialogueGraph model into flow data
  const { nodes: initialNodes, edges: initialEdges } = adaptDialogueGraphToFlow(sampleGraph);

  // Register our custom node type
  const nodeTypes = { dialogueNode: DialogueNode };

  // SvelteFlow just needs normal arrays
  let nodes: Node[] = initialNodes;
  let edges: Edge[] = initialEdges;
</script>

<div class="graph-container">
  <!-- The bind:props let us edit the graph links interactively -->
  <SvelteFlow bind:nodes bind:edges {nodeTypes} fitView>
    <Background />
    <MiniMap />
    <Controls />
  </SvelteFlow>
</div>

<style>
  .graph-container {
    width: 100vw;
    height: 100vh;
    background: #121212;
  }

  :global(.svelte-flow__edge-text),
  :global(.svelte-flow__edge-label) {
    font-size: 10px;
    font-family: system-ui;
    color: #ccc;
  }
</style>
