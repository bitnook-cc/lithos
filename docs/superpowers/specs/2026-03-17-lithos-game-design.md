# Lithos — Game Design Spec

Mobile roguelike civilization game. Guide a civilization from Stone Age tribe through to modern era (and potentially space). Turn-based strategy with randomized story events, cultural identity system, and roguelike death-and-progression loop.

## Tech Stack

- **Phaser 3** — game loop, map rendering, camera, input
- **React 18** — UI overlay (event cards, army screen, resources, menus)
- **Zustand** — shared game state store, read by both Phaser and React
- **TypeScript** throughout
- **Vite** — build tool
- **PWA** — browser-based, wrappable with Capacitor for mobile app stores

## Architecture

```
┌─────────────────────────────────┐
│     React UI Layer (DOM)        │  Event cards, army screen, resources, menus
├─────────────────────────────────┤
│     Phaser Canvas Layer         │  Map rendering, fog of war, animations
├─────────────────────────────────┤
│     Game State (Zustand)        │  Run state — single source of truth
├─────────────────────────────────┤
│     Game Logic (pure TS)        │  Turns, events, combat resolution, age progression
├─────────────────────────────────┤
│     Content Data (JSON)         │  Events, techs, ages, event chains, endings
├─────────────────────────────────┤
│     Meta State (localStorage)   │  Achievements, unlocked traits, run history
└─────────────────────────────────┘
```

Game logic is pure functions: state in, new state out. Testable and deterministic. Phaser handles rendering and the game loop. React handles all UI. Zustand is the bridge.

### Swappable Map Renderer

Map rendering is behind an interface. The current age defines which renderer to use.

```
MapRenderer (interface)
  ├── HexMapRenderer    — default for terrestrial ages
  ├── StarMapRenderer   — node-and-edge graph for space scale
  └── NullMapRenderer   — event-only ages with no map
```

Each renderer implements: generate, render, handleInput, getTileAt.

## Ages

Target: ~30 minute full run. 7-8 ages at ~10-12 turns each, ~4 minutes per age.

| Age | Key Flavor |
|-----|-----------|
| **Stone** | Tribal survival, hunting, fire, basic tools |
| **Bronze** | First settlements, farming, early warfare, religion |
| **Classical** | Empires, philosophy, roads, organized armies |
| **Medieval** | Feudalism, siege warfare, trade guilds, plague |
| **Renaissance** | Exploration, science, gunpowder, diplomacy |
| **Industrial** | Factories, ideology, colonialism, railroads |
| **Modern** | Nuclear tension, global politics, information age |
| **Space** (optional) | Colonization, alien contact, endgame |

Space age is optional — unlocked via achievement or reaching Modern with the right conditions.

### Map Zoom Progression

The map regenerates each age, generally zooming out in scale. Stone Age is your camp and surrounding wilderness. Later ages show regions, continents, the world. Scale is a guideline, not rigid — driven by what makes the age interesting.

Previous map state informs generation: if you controlled mountains in Stone Age, your Bronze Age region starts near mountains. Settlements from the previous age consolidate into a single "home" tile carrying their bonuses.

## Turn Structure

Fully turn-based. No idle/real-time mechanics. Game waits for the player.

Each turn:
1. **Collect** — receive resources based on buildings, territory, population, techs
2. **Actions** — spend 2-3 action points: explore, build, research, diplomacy
3. **Event Phase** — random event may fire (weighted by triggers)
4. **Enemy Phase** — rival civs/threats take their actions

Age advances when the player researches the "advance" tech at the end of each age's tech tree. Delaying is possible but events get harder.

## Hex Map

- Procedurally generated per age, ~15-35 tiles depending on age
- Tile types: Plains, Forest, Mountain, Water, Desert, Ruins, Fertile, Special (age-specific)
- Fog of war — start with a few visible tiles, explore to reveal
- Structures: 1 per tile, provide per-turn resources and abilities, evolve visually across ages
- Rival civs: 1-3 placed at generation, simplified behavior (aggressive, defensive, trader)

### Tile-Based Event Triggers

Uncovering specific tile types can trigger events:
- Mountain → mining/ore discovery events
- Ruins → ancient discovery event chains
- Coast → seafaring events in later ages
- Desert in Industrial age → oil discovery
- Tile type + age combinations create unique triggers

## Cultural Identity

Three axes, scored -100 to +100, shaped by every choice:

| Axis | Negative | Positive |
|------|----------|----------|
| **Military** | Pacifist | Warlike |
| **Economy** | Isolationist | Mercantile |
| **Knowledge** | Traditional | Scholarly |

Effects:
- Filters which events appear
- Modifies available event options
- Affects rival civ behavior toward you
- Unlocks age-specific strategies and techs

## Traits & Tags

Both leaders and civilizations can gain traits and tags.

### Leader Traits

- Each age starts with a named leader with 1-2 traits from the unlockable trait pool
- Additional traits can be earned mid-age from events or achievements
- Traits gate event options and modify outcomes
- Examples: Bold, Cautious, Devout, Cunning, Visionary, Ruthless, Seafarer
- Rerollable at age start (limited rerolls, more unlocked via achievements)

### Civ Tags

- Persistent labels earned through play across the entire run
- Examples: "River People", "Plague Survivors", "Conquerors of the East"
- Carry across ages
- Referenced in narrative text, gate event options, modify outcomes

### Leader Lineage

Leaders are recorded in civ history when an age ends. Later events reference past leaders: "Following in the tradition of Kara the Bold, your people demand expansion."

## Army System

Army is a stat block, not units on the map.

| Stat | Purpose |
|------|---------|
| **Strength** | Raw damage dealt |
| **Toughness** | Damage absorbed |
| **Speed** | Initiative, retreat success |
| **Stealth** | Ambush chance, raid defense |
| **Range** | Pre-melee damage (bows, artillery) |
| **Morale** | Fight duration before retreat |
| **Numbers** | Multiplier on everything, costly to maintain |

Stats modified by:
- **Tech**: "Invented bows" → +Range
- **Buildings**: Barracks → +Numbers capacity, Walls → +Toughness defending
- **Leader traits**: Bold → +Morale, Cunning → +Stealth
- **Cultural identity**: Warlike → scaling Strength/Morale bonuses
- **Events**: "Veterans return" → +Strength, -Numbers

### Combat Resolution

Combat happens through the event system, not a separate tactical layer.

An event fires with combat options. Options may be gated by army stats or traits. Resolution is a weighted roll comparing your stats vs the threat's stats. Outcomes: resources gained/lost, numbers lost, territory changes, history flags set.

Example:
> "Raiders approach from the northern mountains"
> - **Fight head-on** (requires Strength > 15)
> - **Ambush them** (requires Stealth > 10)
> - **Negotiate** (requires Mercantile > 20)
> - **Retreat** (always available)

## Story Events

Data-driven (JSON). Core of the gameplay experience.

### Event Structure

- **Trigger conditions**: age, cultural identity thresholds, leader traits, civ tags, history flags, tile type uncovered, chain flags
- **Narrative text**: template variables for leader names, civ traits, past decisions
- **2-4 choices**: each with requirements, stat effects, identity shifts, outcomes (weighted random)
- **History flags**: choices set flags checked by later events

### Event Chains

Events can set chain flags checked by later events, even across ages. Multi-step branching narratives.

Example chain:
1. Stone Age: "A neighboring tribe asks to share your hunting grounds" → Accept sets `shared_hunting_grounds`
2. Bronze Age: if `shared_hunting_grounds` → "The tribe you welcomed has grown into a rival city-state"
3. Classical Age: chain continues based on subsequent choices

### Locked Options

Options with unmet requirements are visible but grayed out, showing what's needed. This teaches the player what to aim for in future runs.

## Narrative Endings

Triggered by conditions in the final age:

- **Nuclear War** — high Military + rival conflict escalation
- **Space Escape** — high Scholarly + specific tech chain
- **Going Underground** — environmental disaster event chain
- **Global Flood** — environmental neglect across ages
- **Golden Age Victory** — balanced identity, high prosperity
- **Conquest Victory** — dominate all rivals
- More unlockable through achievements

## Meta-Progression (Roguelike Loop)

### Death as Progression

- Dying is expected. First few runs teach the systems.
- Each death can unlock: traits, achievements, knowledge of event chains
- "Died to Bronze Age raiders" → unlocks "Fortifier" trait (build walls earlier)

### Achievements

- Unlock from victories, deaths, discoveries, specific event outcomes
- Expand the leader trait pool
- Expand the civ tag pool
- Unlock additional rerolls
- Can unlock the Space age

### Run History

Tracked across all runs: "Run #4 — Kara's tribe, wiped out by drought in the Iron Age." Viewable from the main menu.
