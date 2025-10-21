// src/lib/data/sampleGraph.ts
import type {
  DialogueGraph,
  DialogueNode,
  DialogueLink
} from '../models/dialogueTypes'

/**
 * Scenario 1 - "First quiet morning"
 * IDs are manually "randomly" generated.
 */

const nodes: DialogueNode[] = [
  {
    id: '19245',
    name: 'Start',
    speaker: 'Protagonist',
    text: `I should wake up. Find the Marsh Witch.`,
    conditions_in: [],
    events_out: [],
    choices: [], // will be filled from links below
    next_node: undefined,
    tags: ['start']
  },

  {
    id: '8',
    name: 'Go to village',
    speaker: 'Protagonist',
    text: `Alright I'll go to see if Eric got new phials.
Oh he is on purple fire again... It will die out by itself very soon though.`,
    conditions_in: [],
    events_out: [],
    choices: [],
    next_node: undefined,
    tags: []
  },

  {
    id: '514',
    name: 'Get rare recipe',
    speaker: 'Eric',
    text: `Thanks [protagonist_name]! I don't have to buy new workwear again.
Here, I got this recipe from my regular Alchemist from London. I don't
know how to use it anyway!`,
    conditions_in: [],
    events_out: [],
    choices: [],
    next_node: undefined,
    tags: []
  },

  {
    id: '172',
    name: 'Seeing Myrtle',
    speaker: 'Myrtle',
    text: `Oh hi [protagonist_name]! Sorry for keeping you waiting. Insomnia.
I was thinking about visiting you just a while ago.
You going to London?`,
    conditions_in: [],
    events_out: [],
    choices: [],
    next_node: undefined,
    tags: []
  },

  {
    id: '7182',
    name: 'Ask info',
    speaker: 'Protagonist',
    text: `Yes. I am selling these herbs.
{{if ConversationInstance.giving_myrtle_herb == T} Here is one for your insomnia.}
And I want to talk to that alchemist. Can you tell me the name again?`,
    conditions_in: [],
    events_out: [
      // conditional events described as strings (parser/engine can interpret later)
      `chamomile -= 1 if ConversationInstance.giving_myrtle_herb == T`,
      `Myrtle_relation += 1 if ConversationInstance.giving_myrtle_herb == T`
    ],
    choices: [],
    next_node: undefined,
    tags: []
  },

  {
    id: '7183',
    name: 'Get info 1 high relation',
    speaker: 'Myrtle',
    text: `You've always been so nice to people.`,
    conditions_in: [],
    events_out: [],
    choices: [],
    next_node: undefined,
    tags: []
  },

  {
    id: '265351',
    name: 'Get info 1',
    speaker: 'Myrtle',
    text: `Sure! His name is Thomas. Be ware though. His shop is near the palace.`,
    conditions_in: [],
    events_out: [
      `trigger optional_goal:get_chamomile if ConversationInstance.giving_myrtle_herb == F`
    ],
    choices: [],
    next_node: undefined,
    tags: []
  },

  {
    id: '3543',
    name: 'Bump into squirrel',
    speaker: 'squirrel',
    text: `(On the way you see a squirrel.) Chik chik. (The squirrel looks a bit scared.)
(It holds a tramped-upon berry.)`,
    conditions_in: [],
    events_out: [],
    choices: [],
    next_node: undefined,
    tags: []
  },

  {
    id: '6302',
    name: 'Get info mysterious',
    speaker: 'squirrel',
    text: `{{if ConversationInstance.bumped_fed_squirrel == F}
    (A strange squirrel appeared outside the open window, with something in its claws.)}
    Eeeeek! (The squirrel squeaked cheerfully.)
    (The squirrel left a mini scroll. The loose end reveals a part of some note: 'Thomas the Alc'.)
    (Unrolling it further, there is '...hemist is dead'.)`,
    conditions_in: [],
    events_out: [],
    choices: [],
    next_node: undefined,
    tags: []
  },

  {
    id: 'end',
    name: 'End 1: go to London',
    speaker: 'Protagonist',
    text: `{{if DialogueSequence.nodeVisited(6302) == T}
    I'd better be careful if his shop is open then.}
    Thanks. Time to go to London.`,
    conditions_in: [],
    events_out: [
      `ConversationInstance.path_reaches_end = T`,
      `call ConversationInstance.save_dialogue_seq()`
    ],
    choices: [],
    next_node: undefined,
    tags: ['end']
  }
]

// links between nodes (edges)
const links: DialogueLink[] = [
  // from 19245
  {
    id: '1262',
    type: 'Choice',
    text: `(Go to village.)`,
    prev_node: '19245',
    next_node: '8',
    conditions_in: ['mood >= 2'],
    events_out: ['social += 1']
  },
  {
    id: '1263',
    type: 'Choice',
    text: `(Go check on Myrtle.)`,
    prev_node: '19245',
    next_node: '3543',
    conditions_in: [],
    events_out: []
  },
  {
    id: '1264',
    type: 'Choice',
    text: `(Meditate on previous events.)`,
    prev_node: '19245',
    next_node: '6302',
    conditions_in: [],
    events_out: ['MP += 1', 'memory_fragment_37 += 1']
  },

  // from 8
  {
    id: '1265',
    type: 'Choice',
    text: `Help him put it out now. I am in a good mood today.`,
    prev_node: '8',
    next_node: '514',
    conditions_in: [],
    events_out: []
  },
  {
    id: '1266',
    type: 'Choice',
    text: `If I help him then he will never learn.`,
    prev_node: '8',
    next_node: '172',
    conditions_in: [],
    events_out: []
  },

  // from 514
  {
    id: '1267',
    type: 'Linear',
    text: undefined,
    prev_node: '514',
    next_node: 'end',
    conditions_in: [],
    events_out: []
  },

  // from 172 (Myrtle)
  {
    id: '1268',
    type: 'Choice',
    text: `(Ask her about the alchemist.)`,
    prev_node: '172',
    next_node: '7182',
    conditions_in: [],
    events_out: [`ConversationInstance.giving_myrtle_herb = F`]
  },
  {
    id: '1269',
    type: 'Choice',
    text: `(I have chamomile for insomnia. Give her and ask her about the alchemist.)`,
    prev_node: '172',
    next_node: '7182',
    conditions_in: ['chamomile >= 1'],
    events_out: [`ConversationInstance.giving_myrtle_herb = T`]
  },

  // from 7182 (protagonist asking)
  {
    id: '1270',
    type: 'Conditional',
    text: undefined,
    prev_node: '7182',
    next_node: '265351',
    conditions_in: ['Myrtle_relation <= 2'],
    events_out: []
  },
  {
    id: '1271',
    type: 'Conditional',
    text: undefined,
    prev_node: '7182',
    next_node: '7183',
    conditions_in: ['Myrtle_relation > 2'],
    events_out: []
  },

  // from 7183
  {
    id: '1272',
    type: 'Linear',
    text: undefined,
    prev_node: '7183',
    next_node: '265351',
    conditions_in: [],
    events_out: []
  },

  // from 265351
  {
    id: '1273',
    type: 'Linear',
    text: undefined,
    prev_node: '265351',
    next_node: 'end',
    conditions_in: [],
    events_out: []
  },

  // from 3543 (squirrel)
  {
    id: '1274',
    type: 'Choice',
    text: `(Pet it sympathetically and go on.)`,
    prev_node: '3543',
    next_node: '172',
    conditions_in: [],
    events_out: ['play_CG']
  },
  {
    id: '1275',
    type: 'Choice',
    text: `I can repair the fruit. Got some energy to spare today.`,
    prev_node: '3543',
    next_node: '6302',
    conditions_in: [],
    events_out: ['ConversationInstance.bumped_fed_squirrel = T']
  },

  // from 6302
  {
    id: '1276',
    type: 'Linear',
    text: undefined,
    prev_node: '6302',
    next_node: 'end',
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
    .map(l => l.text ?? '')
    .filter((t): t is string => t !== undefined && t !== null && t !== '')

  // next_node is the first Linear link's target if exists
  const linearLink = outgoingLinks.find(l => l.type === 'Linear')
  node.next_node = linearLink?.next_node
})

export const sampleGraph: DialogueGraph = {
  id: '167390',
  entry_node: '19245',
  nodes,
  links,
  conditions_in: ['quest_234_completed', 'is_new_game_plus'],
  tags: ['first_quiet_morning', 'scenario1']
}
