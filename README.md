# Lithos

Lithos is a mobile-first roguelike civilization game. Lead one people from a fragile Stone Age hearth through the city-states of the Bronze Age and into a Classical civilization whose final ideals become its ending.

This repository contains a playable three-age prototype focused on consequential narrative choices, compact strategy, and progression between runs.

## The run

Each turn follows a deliberate rhythm:

1. Collect resources, feed the population, grow, and advance active research.
2. Spend action points exploring, building institutions, or approaching rival civilizations.
3. Face a state-aware narrative event with visible locked alternatives.
4. Watch rival factions expand, trade, or test the frontier.

Research culminates in an age-defining discovery. Maps regenerate at a broader scale between ages while cultural identity, tags, leaders, permanent discoveries, feats, and the civilization chronicle carry forward.

## Roguelike legacy

Choices can accomplish **feats**. A feat provides an immediate reward to the current civilization and permanently unlocks an **ancestral perk** for later runs. Before starting another lineage, the player may equip up to two unlocked perks.

Examples include preserving the first flame, welcoming displaced people into a Bronze Age city, founding a citizen assembly, or carrying one civilization through all three ages. Perks alter starting resources, army capabilities, action points, or per-turn production, so later runs enable materially different strategies and event paths.

Current prototype content includes:

- Stone, Bronze, and Classical ages with distinct maps, buildings, research trees, factions, and narrative themes
- 40 state-aware story events, including cross-age consequences
- 54 technologies across three branching trees (14 Stone, 18 Bronze, 22 Classical)
- Seven persistent feats and seven selectable ancestral perks
- Cultural identity, leader traits, civilization tags, and a readable run chronicle
- Resource economy, population growth/starvation, effective army stats, event combat, rival pressure, and diplomacy
- Versioned run saves plus separately persisted legacy progression

## Architecture

- **Content registry** — age packages expose definitions, technologies, events, and starting settlements through `src/data/content.ts`.
- **Pure domain engines** — turn, resource, event-choice, combat, rival, age, and run generation logic live under `src/logic`.
- **Commands** — `dispatchCommand` validates actions atomically, resolves automatic phases, enforces defeat, and queues persistent outcomes. React only requests actions and acknowledges messages.
- **Run state** — Zustand stores one saveable run; Zod and semantic checks validate versioned saves, with retained backups and visible storage failures.
- **Legacy state** — a separate Zustand store persists feats, perks, run history, victories, and the furthest age across run resets.
- **Presentation** — React renders narrative/UI overlays while Phaser renders and handles the hex map. Zustand is their shared boundary.
- **Determinism** — the run persists its random cursor and pending results, so reloading does not reroll outcomes or repeat their rewards.

## Development

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
npm test
npm run build
```

The test suite covers hex math, resources, turns, research, events, choice resolution, combat, rivals, age transitions, the three-age content registry, and roguelike perk/feat behavior.

See [Milestone 1 implementation notes](docs/milestone-1.md) for command rules, save migration/recovery, and verification coverage.

## Prototype scope

The three-age arc is complete and winnable. The broader design still leaves room for later historical ages, more event chains and endings, deeper rival diplomacy, audio/animation, accessibility passes, and mobile-store packaging.
