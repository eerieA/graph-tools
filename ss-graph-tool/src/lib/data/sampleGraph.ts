import type {
  DialogueGraph,
  DialogueNode,
  DialogueLink
} from '../models/dialogueTypes'

const nodes: DialogueNode[] = [
  {
    id: 'd1',
    speaker: 'NPC_merchant',
    text: 'Hello traveler. Looking for something rare?',
    conditions_in: [],      // no preconditions for entry
    events_out: [],         // nothing special on activation
    choices: [],            // will fill from links below
    next_node: undefined,   // linear follow-up if any
    tags: ['greeting']
  },
  {
    id: 'd2',
    speaker: 'Player',
    text: 'Hmmm. Maybe. Show me what you have.',
    conditions_in: [],
    events_out: ["sample event"],
    choices: [],
    next_node: undefined,
    tags: []
  },
  {
    id: 'd3',
    speaker: 'Player',
    text: 'Not today. Just passing by.',
    conditions_in: [],
    events_out: [],
    choices: [],
    next_node: undefined,
    tags: []
  }
]

// links between nodes
const links: DialogueLink[] = [
  {
    id: 'link_1',
    type: 'Choice',
    text: 'Show your goods.',
    prev_node: 'd1',
    next_node: 'd2',
    conditions_in: [],
    events_out: []
  },
  {
    id: 'link_2',
    type: 'Choice',
    text: 'Maybe later.',
    prev_node: 'd1',
    next_node: 'd3',
    conditions_in: [],
    events_out: []
  }
]

// populate choices array for each node from links
nodes.forEach(node => {
  const outgoingLinks = links.filter(l => l.prev_node === node.id)

  // choices is an array of texts of Choice links
  node.choices = outgoingLinks
    .filter(l => l.type === 'Choice')
    .map(l => l.text)
    .filter((t): t is string => t !== undefined); // type guard

  // next_node is the first Linear link's target if exists
  const linearLink = outgoingLinks.find(l => l.type === 'Linear')
  node.next_node = linearLink?.next_node; 
})

export const sampleGraph: DialogueGraph = {
  id: 'dlg_test_1',
  entry_node: 'd1',
  nodes,
  links,
  conditions_in: [], // optional
  tags: ['tutorial']
}