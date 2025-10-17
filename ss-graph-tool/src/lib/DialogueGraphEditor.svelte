<script lang="ts">
  import {
    SvelteFlow,
    SvelteFlowProvider,
    Background,
    Controls,
    MiniMap,
    type Node,
    type Edge,
  } from '@xyflow/svelte';
  import '@xyflow/svelte/dist/style.css';

  import DialogueNode from './nodes/DialogueNode.svelte';
  import SelectionSubscriber from './SelectionSubscriber.svelte';
  import { sampleGraph } from './data/sampleGraph';
  import { adaptDialogueGraphToFlow } from './utils/graphAdapter';
  import NodeInspector from './NodeInspector.svelte';

  const { nodes: initialNodes, edges: initialEdges } = adaptDialogueGraphToFlow(sampleGraph);
  const nodeTypes = { dialogueNode: DialogueNode };

  let nodes: Node[] = initialNodes;
  let edges: Edge[] = initialEdges;
  let selectedNode: Node | null = null;

  // ---------- simple toast ----------
  let warning: string | null = null;
  let warnTimeout: any = null;
  function showWarning(msg: string) {
    warning = msg;
    clearTimeout(warnTimeout);
    warnTimeout = setTimeout(() => (warning = null), 2500);
    console.warn(msg);
  }

  // ---------- helpers ----------
  function buildAdjacency(edgesArr: Edge[]) {
    const adj: Record<string, string[]> = {};
    for (const e of edgesArr) {
      if (!adj[e.source]) adj[e.source] = [];
      if (!adj[e.target]) adj[e.target] = adj[e.target] ?? [];
      adj[e.source].push(e.target);
    }
    return adj;
  }

  // DFS path check: is there a path from `from` to `to`?
  function hasPath(adj: Record<string, string[]>, from: string, to: string) {
    if (from === to) return true;
    const visited = new Set<string>();
    const stack = [from];
    while (stack.length) {
      const cur = stack.pop()!;
      if (cur === to) return true;
      if (visited.has(cur)) continue;
      visited.add(cur);
      const neighbors = adj[cur] || [];
      for (const nb of neighbors) stack.push(nb);
    }
    return false;
  }

  // ---------- edge cycle prevention ----------
  let prevEdges: Edge[] = initialEdges.map((e) => ({ ...e }));

  $: if (edges) {
    // detect newly added edges
    const added = edges.filter((e) => !prevEdges.some((pe) => pe.id === e.id));

    for (const newEdge of added) {
      // if attemped edge is from the same node then that is a self-loop
      if (newEdge.source === newEdge.target) {
        edges = edges.filter((e) => e.id !== newEdge.id);
        showWarning('Cannot create self-loop in dialogue graphs.');
        continue;
      }

      // build adjacency from previous edges (before this edge)
      const adjBefore = buildAdjacency(prevEdges);

      // if already a path from target to source then attempted edge would form cycle
      if (hasPath(adjBefore, newEdge.target, newEdge.source)) {
        edges = edges.filter((e) => e.id !== newEdge.id);
        showWarning('Cannot create edge: it would form a cycle in the dialogue graph.');
        continue;
      }
    }

    // Update prevEdges to match the (possibly modified) current edges for next check
    prevEdges = edges.map((e) => ({ ...e }));
  }

  // generate a reasonably unique id for new edges
  function genEdgeId() {
    return `edge_${Date.now().toString(36)}_${Math.floor(Math.random() * 1000)}`;
  }

  // Called when SvelteFlow emits a "connect" event (user links two handles)
  // e.detail should contain { source, target, sourceHandle, targetHandle }
  function handleConnect(evt: CustomEvent) {
    const { source, target, label } = evt.detail;
    if (!source || !target) return;

    // add edge (SvelteFlow may not add automatically)
    const exists = edges.some((e) => e.source === source && e.target === target);
    if (!exists) {
      edges = [...edges, { id: genEdgeId(), source, target, label: label ?? '', type: 'default' }];
    }
  }

  // Called from SelectionSubscriber via prop
  function handleSelect(node: Node) {
    selectedNode = node;
    console.log('SelectionSubscriber forwarded node:', node);
  }
</script>

<SvelteFlowProvider>
  <div style="display:flex; height:100vh;">
    <div style="width:100%; height:100%;">
      <SvelteFlow bind:nodes bind:edges {nodeTypes} fitView on:connect={handleConnect}>
        <Background />
        <MiniMap />
        <Controls />
      </SvelteFlow>
    </div>

    <aside style="width:280px; background:#1d1d1d; color:#ddd; padding:12px;">
      <!-- Listen to selection changes -->
      <SelectionSubscriber onSelect={handleSelect} />
      <!-- Side panel -->
      <NodeInspector {selectedNode} />
    </aside>
  </div>
</SvelteFlowProvider>

{#if warning}
  <div class="toast">{warning}</div>
{/if}

<style>
  .toast {
    position: fixed;
    right: 20px;
    bottom: 20px;
    background: #b24a4a;
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
    font-family: system-ui;
  }

  :global(.svelte-flow__edge-label) {
    font-size: 10px;
    font-family: system-ui;
    color: #ccc;
  }
</style>
