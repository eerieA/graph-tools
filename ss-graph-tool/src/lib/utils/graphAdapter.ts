import type {
  DialogueGraph,
  DialogueNode,
  DialogueLink
} from '../models/dialogueTypes'
import type { Node, Edge } from '@xyflow/svelte'
import { get } from 'svelte/store'

import { nodePositions } from '$lib/storage/graphLayoutStore'

/**
 * Convert a DialogueGraph (domain model) into a structure that Svelte Flow can render.
 * Adds all relevant DialogueNode fields to each node's `data`,
 * and transforms DialogueLink into Svelte Flow-compatible edges.
 */
export function adaptDialogueGraphToFlow (graph: DialogueGraph): {
  nodes: Node[]
  edges: Edge[]
} {
  // Get saved node positions if any
  const savedPositions = get(nodePositions)

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
      isEntry: n.id === graph.entry_node
    }
  }))

  // Map DialogueLinks to Svelte Flow edges
  const edges: Edge[] = graph.links.map((l: DialogueLink) => {
    // Choose edge style/type based on link type
    let edgeStyle = 'bezier'
    if (l.type === 'Conditional') edgeStyle = 'straight'
    else if (l.type === 'Choice') edgeStyle = 'bezier'

    return {
      id: l.id,
      source: l.prev_node,
      target: l.next_node,
      type: edgeStyle,
      markerEnd: {
        type: 'arrow',
        color: '#aaa',
        width: 20,
        height: 20
      },
      label: l.text ?? '',
      data: {
        type: l.type,
        conditions_in: l.conditions_in ?? [],
        events_out: l.events_out ?? []
      },
      animated: l.type === 'Linear' // small visual cue: linear = animated line
    }
  })

  return { nodes, edges }
}
