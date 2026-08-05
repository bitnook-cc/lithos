# Lithos

A mobile roguelike civilization game. Guide your civilization from a Stone Age tribe through multiple ages of history, making strategic choices that shape your culture, leaders, and destiny.

## Concept

Each run takes ~30 minutes across 7-8 ages (Stone, Bronze, Classical, Medieval, Renaissance, Industrial, Modern, and optionally Space). The map regenerates and zooms out with each age — starting with your camp and surrounding wilderness, eventually encompassing continents and beyond.

Death is expected. Each run teaches you the systems, and dying unlocks new leader traits and achievements that improve future runs.

## Core Mechanics

**Turn-based strategy** — Each turn you collect resources, spend action points (explore, build, research, diplomacy), face random events, and watch rival civilizations act.

**Cultural identity** — Three axes (Pacifist/Warlike, Isolationist/Mercantile, Traditional/Scholarly) shift with every choice, filtering which events appear and what options are available.

**Leader lineage** — Each age has a named leader with traits that gate event options. Leaders are recorded in your civilization's history and referenced in future events.

**Story events** — Data-driven events with branching choices, some chaining across ages. Locked options are visible but grayed out, showing what to aim for in future runs.

**Army as stats** — Your military is a stat block (strength, toughness, speed, stealth) modified by tech and events. Combat resolves through the event system.

**Multiple endings** — Nuclear war, space escape, going underground, global flood, golden age, conquest, and more unlockable through achievements.

## Tech Stack

- **Phaser 3** — hex map rendering, game loop, input
- **React 18** — UI overlay (event cards, tech tree, resource bars)
- **Zustand** — shared game state
- **TypeScript + Vite** — build tooling
- **PWA** — wrappable with Capacitor for mobile app stores

## Development

```bash
npm install
npm run dev        # dev server
npm test           # tests
npm run build      # typecheck and production build
```

### Docker development

The development image contains Node.js, Git, ripgrep, and the Codex CLI. The
game and Codex run as separate Compose services against the same bind-mounted
working tree.

```bash
# Build the image and run the game at http://localhost:5173
docker compose up --build lithos

# One-time Codex authentication for this Docker volume
docker compose run --rm codex codex login --device-auth

# Start an interactive Codex session in this repository
docker compose run --rm codex
```

Codex credentials are kept in the private `codex-home` Docker volume, not in
the image or repository. Project dependencies use the
`lithos-node-modules` volume so containers do not write Linux packages into
the Windows working tree.

## Status

Vertical slice complete — playable Stone Age with all core systems working. Future work: additional ages, more events/tech trees, meta-progression, and mobile packaging.
