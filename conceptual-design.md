<!-- TOC -->

- [Data structures](#data-structures)
- [Theoretical Test Scenarios](#theoretical-test-scenarios)
    - [Scenario 1: Short Story Dialogue](#scenario-1-short-story-dialogue)
        - [Context](#context)
        - [Dialogue Nodes](#dialogue-nodes)
        - [Theoretical Run](#theoretical-run)
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

# Theoretical Test Scenarios

Small-scale **test scenarios** for evaluating the conceptual dialogue, bark, graphs etc data structures.

## Scenario 1: Short Story Dialogue

**Purpose:**  
Test the core `DialogueNode`, `DialogueGraph`, and `DialogueSequence` structures, plus UI involvement for focused story interactions.

### Context
Player speaks with an NPC informant in a dimly lit room. The informant may reveal a clue if the player has completed an earlier task.

### Dialogue Nodes

TBC

### Theoretical Run

TBC

---

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
event_out:
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
