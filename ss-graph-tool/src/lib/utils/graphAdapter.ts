import type {
  DialogueGraph,
  DialogueNode,
  DialogueLink
} from '../models/dialogueTypes'
import type { Node, Edge } from '@xyflow/svelte'
import { get } from 'svelte/store'

import { nodePositions } from '$lib/storage/graphLayoutStore'
import { summarizeChoiceViaTauri } from './nlpBridge'

/**
 * Convert a DialogueGraph (domain model) into a structure that Svelte Flow can render.
 * Adds all relevant DialogueNode fields to each node's `data`,
 * and transforms DialogueLink into Svelte Flow-compatible edges.
 */
export async function adaptDialogueGraphToFlow (graph: DialogueGraph): Promise<{
  nodes: Node[]
  edges: Edge[]
}> {
  // Get saved node positions if any
  const savedPositions = get(nodePositions)

  // Precompute number of outgoing links per node
  const outgoingCounts: Record<string, number> = {}
  graph.nodes.forEach(n => {
    outgoingCounts[n.id] =
      graph.links.filter(l => l.prev_node === n.id).length || 1
  })

  // Map DialogueNodes to Svelte Flow nodes
  const nodes: Node[] = graph.nodes.map((n: DialogueNode) => ({
    id: n.id,
    // must match the custom node name registered in SvelteFlow, e.g. in ./src/lib/DialogueGraphEditor.svelte
    type: 'dialogueNode',
    position: savedPositions[n.id] ?? {
      x: Math.random() * 400,
      y: Math.random() * 300
    },
    data: {
      // core fields
      name: n.name,
      speaker: n.speaker,
      text: n.text,
      // extended dialogue fields
      conditions_in: n.conditions_in ?? [],
      events_out: n.events_out ?? [],
      choices: n.choices ?? [],
      next_node: n.next_node,
      tags: n.tags ?? [],
      // computed metadata
      isEntry: n.id === graph.entry_node,
      // pass the total outgoing links
      outgoingCount: outgoingCounts[n.id]
    }
  }))

  // Map DialogueLinks to Svelte Flow edges
  const edges: Edge[] = await Promise.all(
    graph.links.map(async (l: DialogueLink, i, arr) => {
      const outgoingFromNode = graph.links.filter(
        x => x.prev_node === l.prev_node
      )
      const handleIndex = outgoingFromNode.findIndex(x => x.id === l.id)

      // Choose edge style/type based on link type
      let edgeStyle = 'bezier'
      if (l.type === 'Conditional') edgeStyle = 'straight'
      else if (l.type === 'Choice') edgeStyle = 'bezier'

      const labelText =
        l.type === 'Choice'
          ? await summarizeChoiceViaTauri(l.text ?? '')
          : l.text ?? ''

      return {
        id: l.id,
        source: l.prev_node,
        target: l.next_node,
        type: edgeStyle,
        markerEnd: { type: 'arrow', color: '#aaa', width: 20, height: 20 },
        label: labelText,
        data: {
          type: l.type,
          text: l.text,
          conditions_in: l.conditions_in ?? [],
          events_out: l.events_out ?? []
        },
        style: 'stroke-width: 2',
        animated: l.type === 'Linear', // small visual cue: linear = animated line
        // Use custom "sourceHandle"/"targetHandle" to prevent overlapping
        sourceHandle: `handle-out-${handleIndex}`, // assign per outgoing edge
        targetHandle: `handle-in-0` // usually just 0
      }
    })
  )

  return { nodes, edges }
}
