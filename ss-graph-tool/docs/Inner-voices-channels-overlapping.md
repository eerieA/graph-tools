<!-- TOC -->

- [How many channels to overlap?](#how-many-channels-to-overlap)
    - [How many channels can overlap?](#how-many-channels-can-overlap)
        - [Typical Dialogue/Voice Channels](#typical-dialoguevoice-channels)
        - [Player Comprehension vs Immersion](#player-comprehension-vs-immersion)
        - [Suggested Rules of Thumb](#suggested-rules-of-thumb)
        - [What Hellblade / Disco Elysium seem to do](#what-hellblade--disco-elysium-seem-to-do)
        - [Possible Channel Arbitration](#possible-channel-arbitration)
    - [Follow up: for sounder engineers and for players?](#follow-up-for-sounder-engineers-and-for-players)
        - [For the **sound programmer**:](#for-the-sound-programmer)
        - [For the **player’s perception**:](#for-the-players-perception)
        - [Risk vs. reward](#risk-vs-reward)

<!-- /TOC -->

# How many channels to overlap?

A record of a radom discussion thread with an LLM about voice channels overlapping.

## How many channels can overlap?

Q

How many channels can overlap that does not make the player feel too annoyed? Because we may have inner voices (different voice lines like the "limbic system" and "Ancient Reptilian Brain" etc), environment voices (perhaps a "god" or "hidden recorded tape" voice that does not come from any character), NPC barks, and story dialogues. I think inner voices are all in the same channel? And that channel can overlap with NPC barks. Also the inner voice channel maybe can overlap with environment voice too. But perhaps not all three channel at once? Or can they overlap all at the same time span and not make the player overloaded?

A
Let’s break it down by *channels*, *overlap rules*, and *player experience*.

### Typical Dialogue/Voice Channels

1. **Story Dialogue (NPC conversations)**
    - Should always take **top priority**.
    - This is what players lean into and focus on for comprehension.
    - Generally: *never* allow anything else to stomp on this channel.
2. **NPC Barks (ambient chatter, combat shouts, greetings, detection)**
    - Lower priority.
    - Can safely overlap **with each other** in limited spatial clusters (two guards shouting in a fight is fine, ten guards at once is cacophony).
    - Should **duck under** story dialogue (reduce volume 30–50% if dialogue is active).
3. **Inner Voices (psychological narrator, Senua’s furies, Disco Elysium’s subsystems)**
    - This is unique — they are meant to be *immersive, intrusive, disorienting*.
    - Can overlap with NPC barks because those are “outside world” vs. “inside head.”
    - Usually 1–2 concurrent at a time max. Any more turns into unintelligible chaos.
4. **Environment Voices (god, tapes, supernatural whispers)**
    - A middle-ground between dialogue and inner voices.
    - Should be able to overlap with **either** NPC barks or inner voices, but careful not to overlap with *both at once*.
    - Think of these as “special event” voices that deserve clarity.

---

### Player Comprehension vs Immersion

- **1 channel** at a time → maximum clarity, but can feel sterile (no texture).
- **2 channels** → manageable if they’re *different semantic layers* (e.g., guard shouting + inner whisper). This is often the sweet spot.
- **3 channels** → risky. Can work *if* they’re short and differentiated in tone (e.g., dialogue + muffled guard bark + eerie whisper). Needs mixing discipline.
- **4 channels** (dialogue + bark + inner + environment) → almost always cognitive overload. Only acceptable for *brief moments of chaos* (e.g., climax, panic scenes, hallucination spikes).

---

### Suggested Rules of Thumb

- **Dialogue channel**: hard priority, ducks all others while active.
- **NPC barks**: capped at 1–2 simultaneous per local area, ducked by dialogue.
- **Inner voices**:
    - By default, max 1 active, but allow 2 if designed to be conversational (“limbic vs reptile brain”).
    - Use **spatial mixing (L/R panning, binaural reverb)** to make them separable.
- **Environment voices**:
    - Treat them as “foreground ambient” — allow them to overlap with either barks or inner voices, but not both.
    - If an environment voice starts, temporarily block inner voices from triggering for a few seconds.

---

### What Hellblade / Disco Elysium seem to do

- **Hellblade’s furies (inner voices)** → often multiple, but carefully mixed binaurally so they feel like distinct positions. Rarely more than 2–3 intelligible at once.
- **Disco Elysium’s skill voices** → almost always *only one at a time*. They’re treated like additional “dialogue participants” in the flow, not background chatter.
- **Skyrim/Fallout barks** → limited concurrency (guards don’t all yell at once).

---

### Possible Channel Arbitration

- **Dialogue (NPC story)**: exclusive, always ducks others.
- **Inner voices**: 1–2 max, can overlap with NPC barks, but blocked if dialogue is active.
- **NPC barks**: 1–2 in spatial cluster, duck if dialogue/inner voice is strong.
- **Environment voice**: solo channel, ducks inner voices when active.

So in practice:

- Normal exploration → NPC bark + inner voice is fine.
- Big setpiece → dialogue + subtle bark (ducked) + occasional whisper is okay.
- Climax/psychosis scene → 3–4 at once, but deliberately chaotic and short-lived.

## Follow up: for sounder engineers and for players?

Q

so you are saying inner voices can have 2 channels? How does that work for a sound programmer, and then how would that feel for the player (potentially too overloading or can be pleasantly immersive)?

A

### For the **sound programmer**:

If you treat “inner voices” as a *category* rather than a literal single channel, you can structure it like this:

- **Inner voice bus (group)**
    - Sub-channel A: “Primary cognition” (main narrative inner voice, e.g. *Limbic System*)
    - Sub-channel B: “Secondary cognition” (commentary or interruptions, e.g. *Ancient Reptilian Brain*)

Both feed into the same *inner voice bus*, which you can duck/mix differently from other categories (dialogue, NPC barks, ambient). That way:

- They *don’t cancel each other out* or fight over a single slot.
- The programmer can apply **priority rules** (e.g. if both want to talk, one waits, or one is mixed lower, or they overlap but are panned differently).
- They still sound like one unified *mental space* to the player.

It’s exactly the same way shooters often have separate channels for *radio chatter* vs. *tutorial VO* vs. *AI barks*, but the player just perceives “dialogue.”

---

### For the **player’s perception**:

Two simultaneous inner voices can *work*, but it depends on:

1. **Frequency of overlap**
    - Rare overlaps can feel *special* or “mental noise.”
    - Constant overlaps = fatigue, frustration, or ignored VO.
2. **Mixing / filtering**
    - Example: Main voice = dry and centered. Secondary = filtered (low-fi, whisper, stereo offset).
    - This way the brain recognizes them as *two thoughts*, not two people yelling in your head.
3. **Function**
    - If both are narratively important, *don’t overlap fully*. Give each space.
    - If one is commentary (sarcasm, doubt, urge), it can sit *underneath* another channel without needing full intelligibility.

---

### Risk vs. reward

- **Too many overlapping channels** → noise, players skip VO, annoyance.
- **Occasional dual inner-voice overlap** → feels immersive, “crowded mind” effect.
- **More than two at once (inner + inner + inner)** → almost always overwhelming unless deliberately designed as a *chaotic event*.

---

**Recommendation**:

- Support **two sub-channels** in the *inner voice bus*.
- Layer them sparingly (priority system: interrupt → queue → duck).
- Mix one as “foreground thought,” the other as “background whisper.”
- Never overlap them *and* NPC bark *and* environmental god voice *and* story dialogue unless it’s a climactic overload moment (and telegraphed as such).