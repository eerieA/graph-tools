<!-- TOC -->

- [Data structures](#data-structures)
    - [At a glance](#at-a-glance)
    - [Data-oriented classes](#data-oriented-classes)
        - [CommonNode](#commonnode)
        - [DialogueNode](#dialoguenode)
        - [DialogueLink](#dialoguelink)
        - [CharBarkNode](#charbarknode)
        - [SurrBarkNode](#surrbarknode)
    - [Organizational Structures](#organizational-structures)
        - [DialogueGraph](#dialoguegraph)
        - [DialogueSequence](#dialoguesequence)
    - [Recording or transient](#recording-or-transient)
        - [ConversationInstance](#conversationinstance)

<!-- /TOC -->

# Data structures

## At a glance

Node types (single canonical)
- CommonNode: Base class for various dialogue and bark nodes.
- DialogueNode: For relatively fixed story dialogues.
- CharBarkNode: For character barks.
- SurrBarkNode: For non-character barks like non-diegetic or semi-diegetic thoughts, narrations, or inner voice barks.

Graphs related

- DialogueGraph: Directed graph representing a cluster of branching dialogue nodes and their relations.
- DialogueLink: Basically edges of DialogueGraph graphs.

Sequence (dialogue plot)

- DialogueSequence: id, graphRef, orderedNodeIds, keywords, authorNotes.

Runtime

- ConversationInstance: with localBlackboard, history, currentNodeId.

## Data-oriented classes

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
| `conditions_in` | list | Optional. Often empty but can be useful for dynamic entry points, contextual replacements, etc. See notes. |
| `events_out` | list | May change world variables, play VO, modify relationships, etc. |
| `choices` | list | Player responses leading to other dialogue nodes. |
| `next_node` | reference | Used for linear follow-up dialogue. |
| `tags` | list | Optional metadata (emotion, tone, UI style). |

> Note 1: Do we need `conditions_in`? Here are some scenarios where we may want it:
> | Case                        | Example                                                                       | Why Node Conditions Help                                                             |
> | --------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
> | **Reactive nodes**          | “Myrtle smiles warmly” node only appears if Myrtle.relationship > 3           | It’s simpler than adding multiple conditional edges leading to the same node.        |
> | **Dynamic entry points**    | Player revisits a conversation later, game jumps directly to a node           | You might not know *which* edge led there, so you evaluate node conditions directly. |
> | **Contextual replacements** | One NPC has multiple variants of the same line (angry vs friendly)            | Each variant node checks relationship or world flags to see if it’s valid.           |
> | **Partial randomization**   | A node pool for ambient remarks, pick one whose conditions fit current state | Each node in the pool can self-filter with its own conditions.                       |


**Example event outputs**
- `set world.GateFixed = true`
- `npc.Mira.relationship += 1`
- `play_sound("repair_gate")`

### DialogueLink

Bascially an edge for a graph. Probably mainly used by story dialogues, from one DialogueNode to another in the dialogue graph. Can represent a linear continuation, a player choice, or an automatic conditional transition.

| Field           | Type                                   | Applies to Type (enum)            | Description                                                                                                                                                                            |
| --------------- | -------------------------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`          | `enum { Linear, Choice, Conditional }` | all                         | Defines the semantic role of this link: continues automatically, presents a player choice, or transitions based on conditions.                                             |
| `text`          | string                             | **Choice**                  | Text shown to the player for this choice. Ignored for Linear and Conditional links.                                                                                                    |
| `conditions_in` | list                               | **Conditional**, **Choice** | The conditions that must be true for this link to be available or valid. For Linear links, this is typically empty.                                                                    |
| `events_out`    | list                               | all                         | Events triggered **when this link is taken**, e.g., updating world variables, setting dialogue flags, playing SFX/VO, or firing game scripts. Think of it as “on transition” effects. |
| `next_node`     | reference                          | all                         | The target node this link leads to. |
| `prev_node`     | reference                          | all                         | The source node this link originates from. Maybe we don't need this. |

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
| `text` | string | Displayed subtitle text. |
| `conditions_in` | list | Narrative context (player location, quest stage, health). |
| `events_out` | list | Dialogue triggers, audio events, or world-state influence. |
| `choices` | list | Possible internal monologue branches. |
| `next_node` | reference | Possible linear follow-up. |
| `alt_texts`        | list<string>                                                       | Optional. Variations for randomization.         |
| `channel` | enum | `inner`, `env`, `narrator`. Determines audio routing and overlap priority (ducking rules). Typically `inner` for internal monologue, `env` for ambient non-character speech. |
| `spatialization` | enum | `none`, `binaural`, `world`, `2d`. Controls how sound is positioned.<br> - Binaural: for inside-head voices (e.g. Disco Elysium).<br> - World: anchored to a world position (e.g. a statue whispering).<br> - 2D: standard non-diegetic narration.|
| `priority`         | int                                                                | Used by `BarkArbitrator` when channels compete. Higher overrides lower.             |
| `interrupt_policy` | enum { `CanInterrupt`, `DuckIfBusy`, `QueueIfBusy`, `SkipIfBusy` } | Determines how to handle simultaneous playback with other channels.                                  |
| `cooldown`         | float seconds                                                      | Prevents over-repetition.                 |

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
| `links` | list | Relationships between nodes, for data traversal, editor rendering, etc. |
| `conditions_in` | list | Entrance requirements of this graph. May include story flags, quest variables, or relationship levels. |
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

## Recording or transient

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
