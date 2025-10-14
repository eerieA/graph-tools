<!-- src/lib/DialogueGraphEditor.svelte -->
<script lang="ts">
  import { SvelteFlow, Background, Controls, MiniMap, type Node, type Edge } from '@xyflow/svelte';
  import '@xyflow/svelte/dist/style.css';
  import { sampleGraph } from './models/sampleGraph';
  import { toFlowNodes, toFlowEdges } from './utils/graphAdapter';

  let nodes: Node[] = toFlowNodes(sampleGraph);
  let edges: Edge[] = toFlowEdges(sampleGraph);
</script>

<div class="graph-container">
  <SvelteFlow {nodes} {edges} fitView>
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

  :global(.svelte-flow__node-dialogueNode) {
    background: #2a2a2a;
    border: 1px solid #444;
    border-radius: 8px;
    padding: 8px;
    color: #eee;
    font-family: system-ui;
    font-size: 13px;
  }

  :global(.svelte-flow__edge-label) {
    font-size: 10px;
    font-family: system-ui;
    color: #ccc;
  }
</style>
