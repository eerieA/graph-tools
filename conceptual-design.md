<!-- TOC -->

- [Data structures](#data-structures)
    - [At a glance](#at-a-glance)
    - [Data heavy classes](#data-heavy-classes)
        - [CommonNode](#commonnode)
        - [DialogueNode](#dialoguenode)
        - [CharBarkNode](#charbarknode)
        - [SurrBarkNode](#surrbarknode)
    - [Organizational Structures](#organizational-structures)
        - [DialogueGraph](#dialoguegraph)
        - [DialogueSequence](#dialoguesequence)
    - [Recording](#recording)
        - [ConversationInstance](#conversationinstance)
- [Theoretical Test Scenarios](#theoretical-test-scenarios)
    - [Scenario 1: Short Story Dialogue](#scenario-1-short-story-dialogue)
        - [Context](#context)
        - [DialogueGraph](#dialoguegraph)
        - [Dialogue Nodes](#dialogue-nodes)
            - [dialogue node id: 19245](#dialogue-node-id-19245)
            - [choice id: 1262](#choice-id-1262)
            - [choice id: 1263](#choice-id-1263)
            - [choice id: 1264](#choice-id-1264)
            - [dialogue node id: 8](#dialogue-node-id-8)
            - [choice id: 1265](#choice-id-1265)
            - [choice id: 1266](#choice-id-1266)
            - [dialogue node id: 514](#dialogue-node-id-514)
            - [choice id: 1267](#choice-id-1267)
            - [dialogue node id: 172](#dialogue-node-id-172)
            - [choice id: 1268](#choice-id-1268)
            - [choice id: 1269](#choice-id-1269)
            - [dialogue node id: 7182](#dialogue-node-id-7182)
            - [choice id: 1270](#choice-id-1270)
            - [dialogue node id: 7183 (if no variables in texts)](#dialogue-node-id-7183-if-no-variables-in-texts)
            - [choice id: 1271](#choice-id-1271)
            - [dialogue node id: 265351](#dialogue-node-id-265351)
            - [choice id: 1272](#choice-id-1272)
            - [dialogue node id: 3543](#dialogue-node-id-3543)
            - [choice id: 1273](#choice-id-1273)
            - [choice id: 1274](#choice-id-1274)
            - [dialogue node id: 6302](#dialogue-node-id-6302)
            - [choice id: 1275](#choice-id-1275)
            - [dialogue node id: end](#dialogue-node-id-end)
        - [Theoretical Run](#theoretical-run)
            - [Dialogue sequence id: p0065167390](#dialogue-sequence-id-p0065167390)
    - [Scenario 2: Guard Barks in a Level](#scenario-2-guard-barks-in-a-level)
        - [Guard AI State Machine](#guard-ai-state-machine)
            - [AI States (not behavior states)](#ai-states-not-behavior-states)
            - [Valid transitions](#valid-transitions)
        - [Internal Variables (world / AI accessible)](#internal-variables-world--ai-accessible)
        - [Bark Triggers (for CharBarkNode testing)](#bark-triggers-for-charbarknode-testing)
        - [Bark Cooldown Logic](#bark-cooldown-logic)
        - [CharBarkNode Examples](#charbarknode-examples)
        - [Theoretical Run](#theoretical-run)
    - [Scenario 7: Two NPCs Exchange Greetings (Ambient Bark Chain)](#scenario-7-two-npcs-exchange-greetings-ambient-bark-chain)
        - [Context](#context)
        - [Bark Group: `checkpointgreetingAB`](#bark-group-checkpointgreetingab)
        - [Bark Nodes](#bark-nodes)
        - [Theoretical Run](#theoretical-run)

<!-- /TOC -->

# Data structures

## At a glance

Node types (single canonical)
- CommonNode: Base class for various dialogue and bark nodes.
- DialogueNode: For relatively fixed story dialogues.
- CharBarkNode: For character barks.
- SurrBarkNode: For non-character barks like non-diegetic or semi-diegetic thoughts, narrations, or inner voice barks.

Graphs

- DialogueGraph: Directed graph representing a cluster of branching dialogue nodes and their relations.

Sequence (dialogue plot)

- DialogueSequence: id, graphRef, orderedNodeIds, keywords, authorNotes.

Runtime

- ConversationInstance: with localBlackboard, history, currentNodeId.

## Data heavy classes

### CommonNode
The fundamental unit for any dialogue or bark element.

| Field | Type | Description |
|--------|------|-------------|
| `id` | string | Unique identifier for the node. |
| `text` | string | Primary text content. |
| `speaker` | reference | Pointer to a character, player, or system actor. |
| `events_out` | list | List of effects triggered when this node is activated (state change, sound, etc). |
| `next_node` | reference | Pointer to another node (mutually exclusive with `choices`). |
| `choices` | list | Optional array of node references for branching. |

### DialogueNode
Derived from `CommonNode`. Used for structured story conversations.

| Field | Type | Description |
|--------|------|-------------|
| `speaker` | reference | Usually a character in the world (NPC or player). |
| `events_out` | list | May change world variables, play VO, modify relationships, etc. |
| `choices` | list | Player responses leading to other dialogue nodes. |
| `next_node` | reference | Used for linear follow-up dialogue. |
| `tags` | list | Optional metadata (emotion, tone, UI style). |

**Example event outputs**
- `set world.GateFixed = true`
- `npc.Mira.relationship += 1`
- `play_sound("repair_gate")`

### CharBarkNode
Represents reactive short barks from NPCs or ambient characters.

| Field | Type | Description |
|--------|------|-------------|
| `speaker` | reference | NPC or creature emitting the bark. |
| `conditions_in` | list | Often local or temporary variables (alert state, player proximity, distraction). |
| `events_out` | list | Triggers audio or local behavior changes. |
| `alt_texts` | list | Variations for randomization. |
| `priority` | number | Used for resolving simultaneous bark triggers. |
| `cooldown` | float | Prevents immediate re-triggering. |

**Example conditions**
- `world.alertLevel >= 2`
- `player.inProximity == true`
- `npc.isDistracted == true`

**Example events**
- `play_vo("npc_guard_angry_01")`
- `set npc.alertTimer = 10`

### SurrBarkNode
Represents inner voice or environmental narration elements.

| Field | Type | Description |
|--------|------|-------------|
| `speaker` | reference | Player inner voice or environmental actor. |
| `conditions_in` | list | Narrative context (player location, quest stage, health). |
| `events_out` | list | Dialogue triggers, audio events, or world-state influence. |
| `choices` | list | Occasionally presents internal monologue branches. |
| `next_node` | reference | Optional linear follow-up. |
| `channel` | enum | Audio layer: `inner`, `env`, `npc`, `narrative`. |

**Example conditions**
- `player.hp < 0.3`
- `world.quest("Sanctuary").state == COMPLETED`

**Example events**
- `trigger dialogue "Mira_Reaction"`
- `set player.trait("SensitiveToLight") = true`
- `play_inner_voice("limbic_system_warning")`

## Organizational Structures

### DialogueGraph
Represents the overall structure of a story conversation.

| Field | Type | Description |
|--------|------|-------------|
| `id` | string | Unique identifier. |
| `nodes` | list | Array of `DialogueNode` objects. |
| `edges` | list | Relationships between nodes (for editor rendering). |
| `conditions_in` | list | May include story flags, quest variables, or relationship levels. |
| `entry_node` | reference | The starting node. |
| `tags` | list | Metadata for quest or story classification. |

### DialogueSequence
Represents a recorded traversal path through a dialogue graph.

| Field | Type | Description |
|--------|------|-------------|
| `id` | string | Sequence ID. May be calculated from player session id, save id, etc. |
| `graph_id` | string | Reference to parent dialogue graph. |
| `path` | list | Ordered list of visited node IDs. |
| `dialogue_ended` | bool | Whether the path reached end node of the dialogue graph. |
| `keywords`? | list | Optional. Auto summary of player tone, moral, or narrative tendencies. May be useful for authors to quickly glance and select as conditions for other things. |

## Recording

### ConversationInstance
A runtime container representing an active conversation, which should be an ongoing story dialogue.

| Field | Type | Description |
|--------|------|-------------|
| `id` | string | Instance ID. |
| `graph_ref` | reference | Link to the `DialogueGraph`. |
| `dialogue_sequence_ref` | reference | Link to a `DialogueSequence`. |
| `current_node` | reference | Node currently being processed. |
| `active_speaker` | reference | Character currently speaking. |
| `world_state_snapshot` | dict | Relevant variable states at start. |

# Theoretical Test Scenarios

Small-scale **test scenarios** for evaluating the conceptual dialogue, bark, graphs etc data structures.

## Scenario 1: Short Story Dialogue

**Purpose:**  
Test the core `DialogueNode`, `DialogueGraph`, and `DialogueSequence` structures, plus UI involvement for focused story interactions.

> Note that all `id`s (the integers) are manually generated (radomly came up from brain).

### Context
Player wakes up from strange dreams mixed with unconcious convo with a mysterious force. The sleep was unrestful but the day has to go on. There are things to do.

### DialogueGraph

- id: 167390
- name: First quiet morning
- nodes: [19245, 6302, 3543, 8, 514, 172, 7182, 265351, end]
- choices/edges: [1262, 1263, 1264, 1265, 1266, 1267, 1268, 1269, 1270, 1271, 1272, 1273, 1274,1275]
- conditions_in: [quest_234 is completed,
                  is new game +]
- entry_node: 19245

> Imagine quest_234 is a pre-req quest that opens a new mission, and this story dialogues is a hidden one in that mission, which is only available in new game +.

> Choices may be interited from a base GraphEdge class, or carried by a GraphEdge as edge data.

> The choices/edges array is actually an array of references, just written like a number array for convenience. It is a collection of all choices/edges present in this graph.

### Dialogue Nodes

> Note that Choices are put close to their associated dialogue node. This is for convenience of reading. They still will be in the dialogue graph's choices array.

#### dialogue node id: 19245
- name: wake up
- speaker: Protagonist
- text: "I should wake up. Find the Marsh Witch."
- choices: [go to village (1262),
            go see Myrtle (1263),
            meditate (12641)]
- events_out: []

#### choice id: 1262
- text: "(Go to village.)"
- conditions: [mood >= 2]
- events_out: [social +1]
- next_node: 8
- prev_node: 19245
- presented: T

#### choice id: 1263
- text: "(Go check on Myrtle.)"
- conditions: []
- events_out: []
- next_node: 172
- prev_node: 19245
- presented: T

#### choice id: 1264
- text: "(Meditate on previous events.)"
- conditions: []
- events_out: [MP +1,
                memory fragment 37 +1]
- next_node: 6302
- prev_node: 19245
- presented: T

#### dialogue node id: 8
- name: village detour
- speaker: Protagonist
- text: "Alright I'll go to see if Eric got new phials.
        Oh he is on purple fire again... It will die out by itself very soon though."
- choices: [help Eric (1265),
            let him learn (1266)]
- events_out: []

#### choice id: 1265
- text: "Help him put it out now. I am in a good mood today."
- conditions: []
- events_out: []
- next_node: 514
- prev_node: 8
- presented: T

#### choice id: 1266
- text: "If I help him then he will never learn."
- conditions: []
- events_out: []
- next_node: 172
- prev_node: 8
- presented: T

#### dialogue node id: 514
- name: recieve rare fruit
- speaker: Eric
- text: "Thanks [protagonist_name]! I don't have to buy new workwear again.
        Here, I got this rare plum from a regular. I don't know how to use
        it anyway!"
- choices: []
- events_out: []

#### choice id: 1267
- text: ""
- conditions: []
- events_out: []
- next_node: end
- prev_node: 514
- presented: F

#### dialogue node id: 172
- name: knock Myrtle door
- speaker: Myrtle
- text: "Oh hi [protagonist_name]! Sorry for keeping you waiting. Insomnia.
        I was thinking about visiting you just a while ago.
        You going to London?"
- choices: [ask about alchemist (1268),
            ask about alchemist and give herb (1269)]
- events_out: []

#### choice id: 1268
- text: "(Ask her about the alchemist.)"
- conditions: []
- events_out: [set ConversationInstance.giving_myrtle_herb = F]
- next_node: 7182
- prev_node: 172
- presented: T

#### choice id: 1269
- text: "(Ask her about the alchemist and give her chamomile.)"
- conditions: [chamomile >= 1]
- events_out: [set ConversationInstance.giving_myrtle_herb = T]
- next_node: 7182
- prev_node: 172
- presented: T

#### dialogue node id: 7182
- name: ask info 1
- speaker: protagonist
- text: "Yes. I am selling these herbs.
        {{if ConversationInstance.giving_myrtle_herb == T} Here is one for your insomnia.}
        And I want to talk to that alchemist. Can you tell me the name again?"
- choices: []
- events_out: [chamomile -1 if giving_myrtle_herb == T,
               Myrtle relation +1 if giving_myrtle_herb == T]

#### choice id: 1270
- text: ""
- conditions: []
- events_out: []
- next_node: 265351
- prev_node: 7182
- presented: F

#### dialogue node id: 7183 (if no variables in texts)
- name: ask info 2
- speaker: protagonist
- text: "Yes. I am selling these herbs.
        And I want to talk to that alchemist. Can you tell me the name again?"
- choices: []
- events_out: []

#### choice id: 1271
- text: ""
- conditions: []
- events_out: []
- next_node: 265351
- prev_node: 7183
- presented: F

#### dialogue node id: 265351
- name: recieve info
- speaker: Myrtle
- text: "Sure! His name is Thomas. Be ware though. His shop is near the palace."
- choices: []
- events_out: [trigger optional goal *get chamomile* if giving_myrtle_herb == F]

#### choice id: 1272
- text: ""
- conditions: []
- events_out: []
- next_node: end
- prev_node: 265351
- presented: F

#### dialogue node id: 3543
- name: bump into squirrel
- speaker: squirrel
- text: "Chik chik. (The squirrel looks a bit scared.)
        (It holds a tramped-upon berry.)"
- choices: [pet it and move on (1273),
            feed it and play (1274)]
- events_out: []

#### choice id: 1273
- text: "(Pet it sympathetically and go on.)"
- conditions: []
- events_out: [play a CG]
- next_node: 172
- prev_node: 3543
- presented: T

#### choice id: 1274
- text: "I can repair the fruit. Got some energy to spare today."
- conditions: []
- events_out: [ConversationInstance.bumped_fed_squirrel == T]
- next_node: 6302
- prev_node: 3543
- presented: T

#### dialogue node id: 6302
- name: recieve info
- speaker: squirrel
- text: "Eeeeek! (The squirrel squeaked cheerfully.)
        {{if ConversationInstance.bumped_fed_squirrel == F}}(A strange squirrel appeared outside the open window, with something in its mouth.)
        (The squirrel left a mini scroll. On it is a note: Thomas (but dead).)"
- choices: []
- events_out: []

#### choice id: 1275
- text: ""
- conditions: []
- events_out: []
- next_node: end
- prev_node: 6302
- presented: F

#### dialogue node id: end
- name: go to London
- speaker: protagonist
- text: "Thanks. Time to go to London then ^_^"
- choices: []
- events_out: [set ConversationInstance.path_reaches_end = T,
               call ConversationInstance.save_dialogue_seq()]

### Theoretical Run

It can go like this:

Then we will at least have a DialogueSequence instance recording the players chosen path in this graph.

With the saved DialogueSequence instance in some file, we can later collect the choices made by the player, and the last node visited by the player. If there is anything needing to use "dialogue graph 167390 was traversed following path 7347865", it can use the id 7347865 as a condition.

#### Dialogue sequence id: p0065_167390

- graph_id: 167390
- path: 19245 -> 8 -> 172 -> 7183 -> 265351 -> end
- dialogue_ended: T
- keywords: [village, Myrtle, no giving herb]

## Scenario 2: Guard Barks in a Level

**Purpose:**  
Test `CharBarkNode` interactions with simple AI state machine and conditional triggering.  
No HUD, only in-world subtitles.

### Guard AI State Machine

In short, there are these behavior states:

```
guard_patrolling, guard_waiting, guard_searching, guard_stop_searching, guard_killing
```

. A behavior path might be:

```
guard_patrolling → guard_waiting → guard_searching → guard_stop_searching → guard_waiting
```

, and:
- Transitions depend on whether player enters view cone or escapes.
- `guard_alerted` flag indicates that the guard detected the player.
- Two mutually exclusive numerical fields:
    - `guard_prev_pos` field stores prev position on patrol route where guard detected the player in `Patrolling` state.
    - `guard_prev_wait_time` field stores prev time point where guard detected the player when in state `Waiting`.

#### AI States (not behavior states)

| State             | Description                                                                    | Typical Duration                         | Bark Opportunities                                   |
| ----------------- | ------------------------------------------------------------------------------ | ---------------------------------------- | ---------------------------------------------------- |
| **Patrolling**    | Walking between two points along a fixed route.                                | Continuous                               | idle barks (“humming”, “night’s quiet”)              |
| **Waiting**       | Pauses briefly at patrol route ends.                                           | 2–5 seconds                              | relaxed barks (“almost time to turn back”)           |
| **Alerted**       | Player enters guard’s detection cone (partial detection). Guard turns to look. | 1–2 seconds                              | “Huh?”, “What was that?”                             |
| **Searching**     | Guard moves toward the last known player position.                             | Until timer expires or player reappears. | “Come out, I saw you!”                               |
| **StopSearching** | Search expired or player lost. Guard calms down and returns to route.          | brief 1–2s before transition             | “Must be rats again.”                                |
| **Killing**       | Player confirmed as hostile within lethal range.                               | until resolved                           | “Die, intruder!”                                     |
| **Returning**     | Transitional recovery to patrol point or wait position after search.           | until arrival                            | (no bark, optional internal voice: “back to patrol”) |

#### Valid transitions

| From                 | To            | Condition                                                 |
| -------------------- | ------------- | --------------------------------------------------------- |
| Patrolling           | Waiting       | reached route end                                         |
| Waiting              | Patrolling    | wait timer expired                                        |
| Patrolling / Waiting | Alerted       | player in view cone                                       |
| Alerted              | Searching     | player confirmed (still visible after short confirm time) |
| Searching            | Killing       | player in close range and visible                         |
| Searching            | StopSearching | player lost, timeout elapsed                              |
| StopSearching        | Returning     | transition grace complete                                 |
| Returning            | Patrolling    | guard_prev_pos recorded                                   |
| Returning            | Waiting       | guard_prev_wait_time recorded                             |

### Internal Variables (world / AI accessible)

| Variable                   | Type    | Description                                         |
| -------------------------- | ------- | --------------------------------------------------- |
| `guard_alerted`            | bool    | whether the guard currently perceives the player    |
| `guard_prev_pos`           | Vector3 | last patrol position before entering searching      |
| `guard_prev_wait_time`     | float   | wait duration left before alert                     |
| `guard_search_timer`       | float   | counts down searching duration                      |
| `player_detected_recently` | bool    | helper world flag for bark cooldown (prevents spam) |
| `alert_level`              | int     | 0 = calm, 1 = alert, 2 = aggressive                 |
| `guard_last_bark_time`     | float   | global bark cooldown helper                         |

### Bark Triggers (for CharBarkNode testing)

| Transition                  | Bark Node ID                     | Notes                                 |
| --------------------------- | -------------------------------- | ------------------------------------- |
| `Patrolling → Waiting`      | `bark_guard_relaxed`             | Optional random bark, low priority    |
| `Waiting → Alerted`         | `bark_guard_spotted_something`   | Trigger when player enters view cone  |
| `Alerted → Searching`       | `bark_guard_searching_confirmed` | “I saw something, over here!”         |
| `Searching → Killing`       | `bark_guard_attack`              | Aggressive, overrides others          |
| `Searching → StopSearching` | `bark_guard_confused`            | “Weird… must’ve imagined it.”         |
| `StopSearching → Returning` | `bark_guard_resumes_patrol`      | “Back to my post.”                    |
| `Any → Killing`             | `bark_guard_final_threat`        | Optional fallback if quick escalation |

### Bark Cooldown Logic

Shared by CharBark system.

To prevent bark spam:
```
if (current_time - guard_last_bark_time < 8s) skip bark
else play bark and update guard_last_bark_time
```

### CharBarkNode Examples

| ID | Speaker | Text | Conditions | Priority | Cooldown | Events |
|----|----------|------|-------------|-----------|-----------|--------|
| `g_alert` | Guard | “What was that?” | guard_alerted == true | 1.0 | 5s | trigger:search |
| `g_resume_patrol` | Guard | “Must’ve been the wind.” | state == guard_stop_searching | 0.5 | 10s | clear_flag("guard_alerted") |
| `g_comment` | Guard | “This route never changes…” | state == guard_patrolling, random<0.1 | 0.2 | 20s | — |

### Theoretical Run

In short:

1. Player crosses guard’s view cone → `guard_alerted=true` → `g_alert` fires.  
2. Player escapes → guard transitions to `guard_stop_searching` → `g_resume_patrol` triggers.  
3. Later, during patrol loop, idle chatter like `g_comment` may occur randomly.

Long version below.

Scenario:
Player sneaks near a guard’s patrol, tosses a bottle (sound trigger), guard enters Alerted, then Searching, briefly shouts, loses the player, and returns to patrol.

Sequence:

1. Guard in Patrolling (idle hum bark plays every ~30s).
1. Sound event from bottle triggers guard_alerted = true → transition → Alerted.
1. Plays bark_guard_spotted_something (random variant).
1. 1s later, guard can’t see player but goes to Searching.
1. Plays bark_guard_searching_confirmed.
1. After 6 seconds, no sight → StopSearching.
1. Plays bark_guard_confused.
1. After 2s → Returning → then Patrolling again.
1. Optional bark_guard_resumes_patrol.

Throughout this, the CharBarkNode conditions read:
```
conditions_in:
  - world.guard_alerted == true
  - world.alert_level == 1
  - world.player_detected_recently == true
```

and optionally output:
```
events_out:
  - set(world.player_detected_recently, true)
  - set(world.alert_level, 1)
```

## Scenario 7: Two NPCs Exchange Greetings (Ambient Bark Chain)

**Purpose:**  
Test `CharBarkNode` sequencing between NPCs, with conditions and timing.  
No HUD. Player proximity triggers conversation.

### Context
Two guards at a checkpoint casually greet each other in the morning.

### Bark Group: `checkpoint_greeting_A_B`

| Property | Value |
|-----------|--------|
| Trigger Conditions | Player within 12m, both idle, time=morning |
| Priority | 0.2 |
| Cooldown | 180s |
| Max Channels | 1 |

### Bark Nodes

| ID | Speaker | Text | Conditions | Delay | Priority | Next | Cooldown |
|----|----------|------|-------------|--------|-----------|--------|-----------|
| `A_hello` | Guard A | “Morning, Cato.” | Guard B nearby | 0s | 0.2 | `B_reply` | 60s |
| `B_reply` | Guard B | “Morning. Patrol quiet?” | — | 0.7s | 0.2 | `A_close` | 60s |
| `A_close` | Guard A | “Too quiet. Makes me nervous.” | — | 0.8s | 0.2 | END | 60s |

### Theoretical Run
1. Player approaches → trigger conditions satisfied.  
2. Guard A says “Morning, Cato.” (start node).  
3. Guard B replies after delay.  
4. Guard A closes the conversation.  
5. Sequence ends; group enters cooldown.  
