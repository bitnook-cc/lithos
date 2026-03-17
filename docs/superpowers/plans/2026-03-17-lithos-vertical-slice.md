# Lithos Vertical Slice Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a playable vertical slice — one full age (Stone Age) with all core systems working end-to-end, plus age transition to Bronze Age.

**Architecture:** Phaser 3 renders the hex map and runs the game loop. React 18 overlays UI (event cards, resource bars, menus). Zustand holds all game state as single source of truth. Game logic is pure TypeScript functions, content is JSON data.

**Tech Stack:** TypeScript, Vite, Phaser 3, React 18, Zustand, Vitest

---

## File Structure

```
lithos/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── src/
│   ├── main.tsx                    # Entry point, mounts React + Phaser
│   ├── App.tsx                     # React root, renders UI overlay
│   ├── store/
│   │   └── gameStore.ts            # Zustand store — all run state
│   ├── game/
│   │   ├── PhaserGame.tsx          # React component that creates Phaser instance
│   │   ├── config.ts               # Phaser game config
│   │   ├── scenes/
│   │   │   └── HexMapScene.ts      # Phaser scene: hex map rendering + input
│   │   └── hex/
│   │       ├── hexUtils.ts         # Hex math: cube coords, neighbors, distance
│   │       └── hexRenderer.ts      # Draw hex tiles on Phaser canvas
│   ├── logic/
│   │   ├── turnEngine.ts           # Turn phases: collect, actions, events, enemies
│   │   ├── resourceEngine.ts       # Resource collection calculation
│   │   ├── mapGenerator.ts         # Procedural hex map generation
│   │   ├── eventEngine.ts          # Event trigger evaluation + resolution
│   │   ├── techEngine.ts           # Tech research + effects
│   │   ├── combatEngine.ts         # Combat stat comparison + resolution
│   │   ├── rivalEngine.ts          # Rival civ AI behavior
│   │   └── ageEngine.ts            # Age transition logic
│   ├── ui/
│   │   ├── HUD.tsx                 # Resource bar + turn counter + action points
│   │   ├── EventCard.tsx           # Event narrative + choices
│   │   ├── TechTree.tsx            # Tech tree view
│   │   ├── ArmyPanel.tsx           # Army stat block display
│   │   ├── BuildMenu.tsx           # Building selection for a tile
│   │   └── GameOver.tsx            # Death/victory screen
│   ├── data/
│   │   ├── ages.ts                 # Age definitions
│   │   ├── events/
│   │   │   └── stoneAge.ts         # Stone Age events
│   │   ├── techs/
│   │   │   └── stoneAge.ts         # Stone Age tech tree
│   │   └── buildings.ts            # Building definitions
│   └── types/
│       ├── game.ts                 # Core game types (GameState, Tile, Resource, etc.)
│       ├── events.ts               # Event types (Event, Choice, Trigger, etc.)
│       └── map.ts                  # Map types (HexCoord, TileType, etc.)
├── tests/
│   ├── logic/
│   │   ├── turnEngine.test.ts
│   │   ├── resourceEngine.test.ts
│   │   ├── mapGenerator.test.ts
│   │   ├── eventEngine.test.ts
│   │   ├── techEngine.test.ts
│   │   ├── combatEngine.test.ts
│   │   ├── rivalEngine.test.ts
│   │   └── ageEngine.test.ts
│   └── hex/
│       └── hexUtils.test.ts
```

## Chunk 1: Project Scaffolding + Types + Game State

### Task 1: Project Setup

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `index.html`, `src/main.tsx`

- [ ] **Step 1: Initialize project and install dependencies**

```bash
npm init -y
npm install phaser react react-dom zustand
npm install -D typescript vite @vitejs/plugin-react vitest @types/react @types/react-dom
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src",
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src", "tests"]
}
```

- [ ] **Step 3: Create vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') }
  }
});
```

- [ ] **Step 4: Create vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') }
  },
  test: {
    globals: true,
    environment: 'node'
  }
});
```

- [ ] **Step 5: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Lithos</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #111; color: #eee; font-family: sans-serif; overflow: hidden; }
    #root { width: 100vw; height: 100vh; position: relative; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

- [ ] **Step 6: Create minimal src/main.tsx**

```tsx
import React from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  return <div style={{ padding: 20 }}>Lithos — loading...</div>;
}

createRoot(document.getElementById('root')!).render(<App />);
```

- [ ] **Step 7: Verify dev server starts**

Run: `npx vite --open`
Expected: Browser opens, shows "Lithos — loading..."

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "chore: scaffold project with Vite, React, Phaser, Zustand"
```

---

### Task 2: Core Types

**Files:**
- Create: `src/types/game.ts`, `src/types/events.ts`, `src/types/map.ts`

- [ ] **Step 1: Create src/types/map.ts**

```typescript
/** Cube coordinates for hex grid */
export interface HexCoord {
  q: number;
  r: number;
  s: number;
}

export type TileType = 'plains' | 'forest' | 'mountain' | 'water' | 'desert' | 'ruins' | 'fertile' | 'special';

export interface Tile {
  coord: HexCoord;
  type: TileType;
  visible: boolean;
  controlled: boolean;
  building: string | null;
  rivalId: string | null;
}
```

- [ ] **Step 2: Create src/types/game.ts**

```typescript
import { Tile, HexCoord } from './map';

export type AgeId = 'stone' | 'bronze' | 'classical' | 'medieval' | 'renaissance' | 'industrial' | 'modern' | 'space';

export interface Resources {
  food: number;
  materials: number;
  wealth: number;
  knowledge: number;
  influence: number;
  population: number;
}

export interface ArmyStats {
  strength: number;
  toughness: number;
  speed: number;
  stealth: number;
  range: number;
  morale: number;
  numbers: number;
}

export interface Leader {
  name: string;
  traits: string[];
}

export interface CivState {
  identity: {
    military: number;
    economy: number;
    knowledge: number;
  };
  tags: string[];
  leaders: Leader[];
}

export interface RivalCiv {
  id: string;
  name: string;
  personality: 'aggressive' | 'defensive' | 'trader';
  threat: ArmyStats;
  disposition: number;
  homeTile: HexCoord;
  controlledTiles: HexCoord[];
}

export interface TechNode {
  id: string;
  name: string;
  cost: number;
  researched: boolean;
  requires: string[];
  effects: TechEffects;
}

export interface TechEffects {
  resourceBonuses?: Partial<Resources>;
  armyBonuses?: Partial<ArmyStats>;
  unlocksBuilding?: string;
  addsCivTag?: string;
  addsLeaderTrait?: string;
  isAdvance?: boolean;
}

export interface BuildingDef {
  id: string;
  name: string;
  cost: Partial<Resources>;
  produces: Partial<Resources>;
  armyBonuses?: Partial<ArmyStats>;
  requiredTile?: TileType[];       // terrain requirements
  availableFrom: AgeId;
}

export interface AgeDef {
  id: AgeId;
  name: string;
  mapSize: number;                 // approximate tile count
  turnsPerAge: number;             // guideline, not hard cap
  startingResources?: Partial<Resources>;
}

export interface GameState {
  age: AgeId;
  turn: number;
  actionPoints: number;
  maxActionPoints: number;
  resources: Resources;
  army: ArmyStats;
  civ: CivState;
  map: Tile[];
  rivals: RivalCiv[];
  techs: TechNode[];
  flags: Record<string, boolean>;
  phase: 'collect' | 'actions' | 'event' | 'enemy' | 'gameOver' | 'ageTransition';
  currentEvent: string | null;
  gameOver: { reason: string; victory: boolean } | null;
}
```

Note: `BuildingDef` and `AgeDef` are used by the content data files (`src/data/buildings.ts`, `src/data/ages.ts`). `TileType` must be imported from `./map`.


- [ ] **Step 3: Create src/types/events.ts**

```typescript
import { AgeId, Resources, ArmyStats } from './game';
import { TileType } from './map';

export interface EventTrigger {
  age?: AgeId;
  minTurn?: number;
  maxTurn?: number;
  flags?: Record<string, boolean>;
  identity?: Partial<Record<'military' | 'economy' | 'knowledge', { min?: number; max?: number }>>;
  leaderTraits?: string[];
  civTags?: string[];
  tileRevealed?: TileType[];
}

export interface EventOutcome {
  weight: number;
  text: string;
  flags?: Record<string, boolean>;
  combat?: { enemyStrength: number; enemyToughness: number };
}

export interface EventChoice {
  id: string;
  text: string;
  requires: {
    identity?: Partial<Record<'military' | 'economy' | 'knowledge', number>>;
    leaderTraits?: string[];
    civTags?: string[];
    armyStats?: Partial<ArmyStats>;
  };
  effects: {
    resources?: Partial<Resources>;
    identity?: Partial<Record<'military' | 'economy' | 'knowledge', number>>;
    army?: Partial<ArmyStats>;
    flags?: Record<string, boolean>;
    addCivTag?: string;
    addLeaderTrait?: string;
    outcomes?: EventOutcome[];
  };
}

export interface GameEvent {
  id: string;
  age: AgeId;
  triggers: EventTrigger;
  text: string;
  choices: EventChoice[];
  chain?: {
    nextEvents: Record<string, string>;
  };
  unique?: boolean;
}
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add core type definitions for game state, events, and map"
```

---

### Task 3: Zustand Game Store

**Files:**
- Create: `src/store/gameStore.ts`

- [ ] **Step 1: Create src/store/gameStore.ts**

```typescript
import { create } from 'zustand';
import { GameState, AgeId, Resources, ArmyStats, Leader, TechNode, RivalCiv } from '@/types/game';
import { Tile } from '@/types/map';

const initialResources: Resources = {
  food: 10, materials: 5, wealth: 0, knowledge: 0, influence: 0, population: 5,
};

const initialArmy: ArmyStats = {
  strength: 3, toughness: 2, speed: 2, stealth: 1, range: 0, morale: 3, numbers: 5,
};

const initialState: GameState = {
  age: 'stone',
  turn: 1,
  actionPoints: 3,
  maxActionPoints: 3,
  resources: initialResources,
  army: initialArmy,
  civ: {
    identity: { military: 0, economy: 0, knowledge: 0 },
    tags: [],
    leaders: [],
  },
  map: [],
  rivals: [],
  techs: [],
  flags: {},
  phase: 'collect',
  currentEvent: null,
  gameOver: null,
};

interface GameActions {
  setState: (partial: Partial<GameState>) => void;
  updateResources: (delta: Partial<Resources>) => void;
  updateArmy: (delta: Partial<ArmyStats>) => void;
  updateIdentity: (delta: Partial<Record<'military' | 'economy' | 'knowledge', number>>) => void;
  setFlag: (key: string, value: boolean) => void;
  addCivTag: (tag: string) => void;
  addLeader: (leader: Leader) => void;
  addLeaderTrait: (trait: string) => void;
  spendActionPoint: () => boolean;
  nextPhase: () => void;
  resetRun: () => void;
}

export type GameStore = GameState & GameActions;

const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  setState: (partial) => set(partial),

  updateResources: (delta) => set((s) => {
    const resources = { ...s.resources };
    for (const [key, val] of Object.entries(delta)) {
      if (val !== undefined) {
        resources[key as keyof Resources] = Math.max(0, resources[key as keyof Resources] + val);
      }
    }
    return { resources };
  }),

  updateArmy: (delta) => set((s) => {
    const army = { ...s.army };
    for (const [key, val] of Object.entries(delta)) {
      if (val !== undefined) {
        army[key as keyof ArmyStats] = Math.max(0, army[key as keyof ArmyStats] + val);
      }
    }
    return { army };
  }),

  updateIdentity: (delta) => set((s) => {
    const identity = { ...s.civ.identity };
    for (const [key, val] of Object.entries(delta)) {
      if (val !== undefined) {
        identity[key as keyof typeof identity] = clamp(
          identity[key as keyof typeof identity] + val, -100, 100
        );
      }
    }
    return { civ: { ...s.civ, identity } };
  }),

  setFlag: (key, value) => set((s) => ({
    flags: { ...s.flags, [key]: value }
  })),

  addCivTag: (tag) => set((s) => ({
    civ: {
      ...s.civ,
      tags: s.civ.tags.includes(tag) ? s.civ.tags : [...s.civ.tags, tag]
    }
  })),

  addLeader: (leader) => set((s) => ({
    civ: { ...s.civ, leaders: [...s.civ.leaders, leader] }
  })),

  addLeaderTrait: (trait) => set((s) => {
    const leaders = [...s.civ.leaders];
    const current = leaders[leaders.length - 1];
    if (current && !current.traits.includes(trait)) {
      leaders[leaders.length - 1] = { ...current, traits: [...current.traits, trait] };
    }
    return { civ: { ...s.civ, leaders } };
  }),

  spendActionPoint: () => {
    const s = get();
    if (s.actionPoints <= 0) return false;
    set({ actionPoints: s.actionPoints - 1 });
    return true;
  },

  nextPhase: () => set((s) => {
    // gameOver and ageTransition are terminal — don't cycle from them
    if (s.phase === 'gameOver' || s.phase === 'ageTransition') return {};
    const phases: GameState['phase'][] = ['collect', 'actions', 'event', 'enemy'];
    const idx = phases.indexOf(s.phase);
    const nextIdx = (idx + 1) % phases.length;
    const next = phases[nextIdx];
    if (next === 'collect') {
      return { phase: next, turn: s.turn + 1, actionPoints: s.maxActionPoints };
    }
    return { phase: next };
  }),

  resetRun: () => set(structuredClone(initialState)),
}));
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: add Zustand game store with core actions"
```

## Chunk 2: Hex Math, Map Generation, Resource Engine

### Task 4: Hex Utilities

**Files:**
- Create: `src/game/hex/hexUtils.ts`, `tests/hex/hexUtils.test.ts`

- [ ] **Step 1: Write failing tests for hex math**

Create `tests/hex/hexUtils.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { hexNeighbors, hexDistance, hexToPixel, pixelToHex, createHex } from '@/game/hex/hexUtils';

describe('hexUtils', () => {
  describe('createHex', () => {
    it('creates a hex with q + r + s = 0', () => {
      const h = createHex(1, -1);
      expect(h).toEqual({ q: 1, r: -1, s: 0 });
    });
  });

  describe('hexNeighbors', () => {
    it('returns 6 neighbors for origin', () => {
      const neighbors = hexNeighbors({ q: 0, r: 0, s: 0 });
      expect(neighbors).toHaveLength(6);
    });

    it('returns correct neighbor coords', () => {
      const neighbors = hexNeighbors({ q: 0, r: 0, s: 0 });
      expect(neighbors).toContainEqual({ q: 1, r: -1, s: 0 });
      expect(neighbors).toContainEqual({ q: -1, r: 1, s: 0 });
    });
  });

  describe('hexDistance', () => {
    it('returns 0 for same hex', () => {
      expect(hexDistance({ q: 0, r: 0, s: 0 }, { q: 0, r: 0, s: 0 })).toBe(0);
    });

    it('returns 1 for adjacent hexes', () => {
      expect(hexDistance({ q: 0, r: 0, s: 0 }, { q: 1, r: -1, s: 0 })).toBe(1);
    });

    it('returns correct distance for far hexes', () => {
      expect(hexDistance({ q: 0, r: 0, s: 0 }, { q: 3, r: -3, s: 0 })).toBe(3);
    });
  });

  describe('hexToPixel', () => {
    it('maps origin to 0,0', () => {
      const { x, y } = hexToPixel({ q: 0, r: 0, s: 0 }, 32);
      expect(x).toBe(0);
      expect(y).toBe(0);
    });

    it('returns different coords for different hexes', () => {
      const a = hexToPixel({ q: 1, r: 0, s: -1 }, 32);
      const b = hexToPixel({ q: 0, r: 1, s: -1 }, 32);
      expect(a.x).not.toBe(b.x);
    });
  });

  describe('pixelToHex', () => {
    it('round-trips through hexToPixel', () => {
      const original = { q: 2, r: -1, s: -1 };
      const { x, y } = hexToPixel(original, 32);
      const result = pixelToHex(x, y, 32);
      expect(result).toEqual(original);
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/hex/hexUtils.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement hex utilities**

Create `src/game/hex/hexUtils.ts`:

```typescript
import { HexCoord } from '@/types/map';

export function createHex(q: number, r: number): HexCoord {
  return { q, r, s: -q - r };
}

const DIRECTIONS: HexCoord[] = [
  { q: 1, r: -1, s: 0 }, { q: 1, r: 0, s: -1 }, { q: 0, r: 1, s: -1 },
  { q: -1, r: 1, s: 0 }, { q: -1, r: 0, s: 1 }, { q: 0, r: -1, s: 1 },
];

export function hexNeighbors(hex: HexCoord): HexCoord[] {
  return DIRECTIONS.map(d => ({
    q: hex.q + d.q,
    r: hex.r + d.r,
    s: hex.s + d.s,
  }));
}

export function hexDistance(a: HexCoord, b: HexCoord): number {
  return Math.max(Math.abs(a.q - b.q), Math.abs(a.r - b.r), Math.abs(a.s - b.s));
}

/** Flat-top hex: pixel center from cube coords */
export function hexToPixel(hex: HexCoord, size: number): { x: number; y: number } {
  const x = size * (3 / 2 * hex.q);
  const y = size * (Math.sqrt(3) / 2 * hex.q + Math.sqrt(3) * hex.r);
  return { x, y };
}

/** Flat-top hex: cube coords from pixel position (with rounding) */
export function pixelToHex(x: number, y: number, size: number): HexCoord {
  const q = (2 / 3 * x) / size;
  const r = (-1 / 3 * x + Math.sqrt(3) / 3 * y) / size;
  return hexRound(q, r);
}

function hexRound(qf: number, rf: number): HexCoord {
  const sf = -qf - rf;
  let q = Math.round(qf);
  let r = Math.round(rf);
  let s = Math.round(sf);
  const qDiff = Math.abs(q - qf);
  const rDiff = Math.abs(r - rf);
  const sDiff = Math.abs(s - sf);
  if (qDiff > rDiff && qDiff > sDiff) {
    q = -r - s;
  } else if (rDiff > sDiff) {
    r = -q - s;
  } else {
    s = -q - r;
  }
  return { q, r, s };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/hex/hexUtils.test.ts`
Expected: All 7 tests PASS

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add hex coordinate utilities with tests"
```

---

### Task 5: Map Generator

**Files:**
- Create: `src/logic/mapGenerator.ts`, `tests/logic/mapGenerator.test.ts`

- [ ] **Step 1: Write failing tests for map generation**

Create `tests/logic/mapGenerator.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { generateMap } from '@/logic/mapGenerator';

describe('generateMap', () => {
  it('generates the requested number of tiles (approximately)', () => {
    const tiles = generateMap({ targetTiles: 15, seed: 42 });
    expect(tiles.length).toBeGreaterThanOrEqual(12);
    expect(tiles.length).toBeLessThanOrEqual(18);
  });

  it('starts with origin tile visible and controlled', () => {
    const tiles = generateMap({ targetTiles: 15, seed: 42 });
    const origin = tiles.find(t => t.coord.q === 0 && t.coord.r === 0);
    expect(origin).toBeDefined();
    expect(origin!.visible).toBe(true);
    expect(origin!.controlled).toBe(true);
  });

  it('has some tiles hidden (fog of war)', () => {
    const tiles = generateMap({ targetTiles: 15, seed: 42 });
    const hidden = tiles.filter(t => !t.visible);
    expect(hidden.length).toBeGreaterThan(0);
  });

  it('generates different maps with different seeds', () => {
    const a = generateMap({ targetTiles: 15, seed: 1 });
    const b = generateMap({ targetTiles: 15, seed: 2 });
    const typesA = a.map(t => t.type).join(',');
    const typesB = b.map(t => t.type).join(',');
    expect(typesA).not.toBe(typesB);
  });

  it('all tiles have valid cube coordinates (q + r + s = 0)', () => {
    const tiles = generateMap({ targetTiles: 20, seed: 42 });
    for (const tile of tiles) {
      expect(tile.coord.q + tile.coord.r + tile.coord.s).toBe(0);
    }
  });

  it('origin neighbors are visible (initial reveal radius)', () => {
    const tiles = generateMap({ targetTiles: 15, seed: 42 });
    const visible = tiles.filter(t => t.visible);
    expect(visible.length).toBeGreaterThanOrEqual(4);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/logic/mapGenerator.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement map generator**

Create `src/logic/mapGenerator.ts`:

```typescript
import { Tile, TileType, HexCoord } from '@/types/map';
import { createHex, hexNeighbors, hexDistance } from '@/game/hex/hexUtils';

interface MapGenOptions {
  targetTiles: number;
  seed: number;
}

/** Simple seeded PRNG (mulberry32) */
function mulberry32(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TILE_WEIGHTS: { type: TileType; weight: number }[] = [
  { type: 'plains', weight: 30 },
  { type: 'forest', weight: 25 },
  { type: 'mountain', weight: 15 },
  { type: 'water', weight: 10 },
  { type: 'desert', weight: 8 },
  { type: 'fertile', weight: 7 },
  { type: 'ruins', weight: 3 },
  { type: 'special', weight: 2 },
];

function pickTileType(rand: () => number): TileType {
  const total = TILE_WEIGHTS.reduce((s, w) => s + w.weight, 0);
  let roll = rand() * total;
  for (const { type, weight } of TILE_WEIGHTS) {
    roll -= weight;
    if (roll <= 0) return type;
  }
  return 'plains';
}

const hexKey = (c: HexCoord) => `${c.q},${c.r}`;

export function generateMap(options: MapGenOptions): Tile[] {
  const { targetTiles, seed } = options;
  const rand = mulberry32(seed);
  const tileMap = new Map<string, Tile>();

  // Start at origin
  const origin = createHex(0, 0);
  tileMap.set(hexKey(origin), {
    coord: origin,
    type: 'plains', // home is always plains
    visible: true,
    controlled: true,
    building: null,
    rivalId: null,
  });

  // Grow map by adding neighbors of existing tiles
  const frontier: HexCoord[] = [...hexNeighbors(origin)];

  while (tileMap.size < targetTiles && frontier.length > 0) {
    const idx = Math.floor(rand() * frontier.length);
    const coord = frontier[idx];
    frontier.splice(idx, 1);

    const key = hexKey(coord);
    if (tileMap.has(key)) continue;

    tileMap.set(key, {
      coord,
      type: pickTileType(rand),
      visible: false,
      controlled: false,
      building: null,
      rivalId: null,
    });

    // Add this tile's unexplored neighbors to frontier
    for (const n of hexNeighbors(coord)) {
      if (!tileMap.has(hexKey(n))) {
        frontier.push(n);
      }
    }
  }

  // Reveal tiles within distance 1 of origin
  const tiles = Array.from(tileMap.values());
  for (const tile of tiles) {
    if (hexDistance(origin, tile.coord) <= 1) {
      tile.visible = true;
    }
  }

  return tiles;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/logic/mapGenerator.test.ts`
Expected: All 6 tests PASS

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add procedural hex map generator with seeded RNG"
```

---

### Task 6: Resource Engine

**Files:**
- Create: `src/logic/resourceEngine.ts`, `tests/logic/resourceEngine.test.ts`, `src/data/buildings.ts`

- [ ] **Step 1: Create building definitions**

Create `src/data/buildings.ts`:

```typescript
import { BuildingDef } from '@/types/game';

export const BUILDINGS: BuildingDef[] = [
  {
    id: 'camp',
    name: 'Camp',
    cost: { materials: 0 },
    produces: { food: 1 },
    availableFrom: 'stone',
  },
  {
    id: 'gathering_site',
    name: 'Gathering Site',
    cost: { materials: 3 },
    produces: { food: 2 },
    requiredTile: ['plains', 'forest', 'fertile'],
    availableFrom: 'stone',
  },
  {
    id: 'quarry',
    name: 'Quarry',
    cost: { food: 3 },
    produces: { materials: 3 },
    requiredTile: ['mountain'],
    availableFrom: 'stone',
  },
  {
    id: 'woodcutter',
    name: 'Woodcutter',
    cost: { food: 2 },
    produces: { materials: 2 },
    requiredTile: ['forest'],
    availableFrom: 'stone',
  },
  {
    id: 'shrine',
    name: 'Shrine',
    cost: { materials: 5 },
    produces: { knowledge: 1 },
    availableFrom: 'stone',
  },
  {
    id: 'watchtower',
    name: 'Watchtower',
    cost: { materials: 4 },
    produces: {},
    armyBonuses: { toughness: 2 },
    availableFrom: 'stone',
  },
];

export function getBuildingDef(id: string): BuildingDef | undefined {
  return BUILDINGS.find(b => b.id === id);
}
```

- [ ] **Step 2: Write failing tests for resource collection**

Create `tests/logic/resourceEngine.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { calculateCollection } from '@/logic/resourceEngine';
import { GameState, Resources } from '@/types/game';
import { Tile } from '@/types/map';

function makeTile(overrides: Partial<Tile> = {}): Tile {
  return {
    coord: { q: 0, r: 0, s: 0 },
    type: 'plains',
    visible: true,
    controlled: true,
    building: null,
    rivalId: null,
    ...overrides,
  };
}

describe('calculateCollection', () => {
  it('returns base food from population', () => {
    const result = calculateCollection({
      map: [makeTile()],
      resources: { food: 0, materials: 0, wealth: 0, knowledge: 0, influence: 0, population: 5 },
      techs: [],
    });
    // base: 1 food per 2 population (foraging) = floor(5/2) = 2
    expect(result.food).toBeGreaterThanOrEqual(2);
  });

  it('adds building production from controlled tiles', () => {
    const result = calculateCollection({
      map: [makeTile({ building: 'gathering_site' })],
      resources: { food: 0, materials: 0, wealth: 0, knowledge: 0, influence: 0, population: 5 },
      techs: [],
    });
    expect(result.food).toBeGreaterThanOrEqual(4); // base 2 + building 2
  });

  it('ignores buildings on uncontrolled tiles', () => {
    const result = calculateCollection({
      map: [makeTile({ building: 'gathering_site', controlled: false })],
      resources: { food: 0, materials: 0, wealth: 0, knowledge: 0, influence: 0, population: 5 },
      techs: [],
    });
    expect(result.food).toBe(2); // just base
  });

  it('subtracts army upkeep from food', () => {
    const result = calculateCollection({
      map: [makeTile()],
      resources: { food: 0, materials: 0, wealth: 0, knowledge: 0, influence: 0, population: 10 },
      techs: [],
      armyNumbers: 8,
    });
    // army eats 1 food per 2 numbers = 4 upkeep
    expect(result.food).toBeLessThan(
      calculateCollection({
        map: [makeTile()],
        resources: { food: 0, materials: 0, wealth: 0, knowledge: 0, influence: 0, population: 10 },
        techs: [],
        armyNumbers: 0,
      }).food
    );
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run tests/logic/resourceEngine.test.ts`
Expected: FAIL — module not found

- [ ] **Step 4: Implement resource engine**

Create `src/logic/resourceEngine.ts`:

```typescript
import { Resources, TechNode } from '@/types/game';
import { Tile } from '@/types/map';
import { getBuildingDef } from '@/data/buildings';

interface CollectionInput {
  map: Tile[];
  resources: Resources;
  techs: TechNode[];
  armyNumbers?: number;
}

export function calculateCollection(input: CollectionInput): Partial<Resources> {
  const { map, resources, techs, armyNumbers = 0 } = input;
  const delta: Record<string, number> = {
    food: 0,
    materials: 0,
    wealth: 0,
    knowledge: 0,
    influence: 0,
    population: 0,
  };

  // Base foraging: 1 food per 2 population
  delta.food += Math.floor(resources.population / 2);

  // Building production from controlled tiles
  for (const tile of map) {
    if (!tile.controlled || !tile.building) continue;
    const building = getBuildingDef(tile.building);
    if (!building) continue;
    for (const [res, amount] of Object.entries(building.produces)) {
      if (amount) delta[res] = (delta[res] || 0) + amount;
    }
  }

  // Tech bonuses
  for (const tech of techs) {
    if (!tech.researched || !tech.effects.resourceBonuses) continue;
    for (const [res, amount] of Object.entries(tech.effects.resourceBonuses)) {
      if (amount) delta[res] = (delta[res] || 0) + amount;
    }
  }

  // Army upkeep: 1 food per 2 army numbers
  delta.food -= Math.floor(armyNumbers / 2);

  // Population growth: if food surplus > 3, +1 pop
  const netFood = (resources.food || 0) + delta.food;
  if (netFood > 3) {
    delta.population += 1;
  }

  return delta;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run tests/logic/resourceEngine.test.ts`
Expected: All 4 tests PASS

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: add resource engine with building production and army upkeep"
```

## Chunk 3: Event Engine, Tech Engine, Combat Engine

### Task 7: Tech Engine

**Files:**
- Create: `src/logic/techEngine.ts`, `tests/logic/techEngine.test.ts`, `src/data/techs/stoneAge.ts`

- [ ] **Step 1: Create Stone Age tech tree data**

Create `src/data/techs/stoneAge.ts`:

```typescript
import { TechNode } from '@/types/game';

export function stoneAgeTechs(): TechNode[] {
  return [
    {
      id: 'fire_making',
      name: 'Fire Making',
      cost: 3,
      researched: false,
      requires: [],
      effects: { resourceBonuses: { food: 1 } },
    },
    {
      id: 'tool_crafting',
      name: 'Tool Crafting',
      cost: 5,
      researched: false,
      requires: ['fire_making'],
      effects: { resourceBonuses: { materials: 1 } },
    },
    {
      id: 'spear_hunting',
      name: 'Spear Hunting',
      cost: 5,
      researched: false,
      requires: ['tool_crafting'],
      effects: { armyBonuses: { strength: 2 }, resourceBonuses: { food: 1 } },
    },
    {
      id: 'shelter_building',
      name: 'Shelter Building',
      cost: 4,
      researched: false,
      requires: ['fire_making'],
      effects: { unlocksBuilding: 'shelter' },
    },
    {
      id: 'tribal_lore',
      name: 'Tribal Lore',
      cost: 6,
      researched: false,
      requires: ['shelter_building'],
      effects: { addsCivTag: 'Oral Tradition' },
    },
    {
      id: 'advance_bronze',
      name: 'Dawn of Bronze',
      cost: 10,
      researched: false,
      requires: ['tool_crafting', 'tribal_lore'],
      effects: { isAdvance: true },
    },
  ];
}
```

- [ ] **Step 2: Write failing tests for tech engine**

Create `tests/logic/techEngine.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { canResearch, researchTech } from '@/logic/techEngine';
import { TechNode, Resources } from '@/types/game';
import { stoneAgeTechs } from '@/data/techs/stoneAge';

describe('techEngine', () => {
  let techs: TechNode[];

  beforeEach(() => {
    techs = stoneAgeTechs();
  });

  describe('canResearch', () => {
    it('allows researching a tech with no prerequisites', () => {
      expect(canResearch('fire_making', techs, { knowledge: 3 } as Resources)).toBe(true);
    });

    it('blocks tech with unmet prerequisites', () => {
      expect(canResearch('tool_crafting', techs, { knowledge: 10 } as Resources)).toBe(false);
    });

    it('blocks tech with insufficient knowledge', () => {
      expect(canResearch('fire_making', techs, { knowledge: 1 } as Resources)).toBe(false);
    });

    it('allows tech when prerequisites are researched', () => {
      techs.find(t => t.id === 'fire_making')!.researched = true;
      expect(canResearch('tool_crafting', techs, { knowledge: 5 } as Resources)).toBe(true);
    });

    it('blocks already-researched tech', () => {
      techs.find(t => t.id === 'fire_making')!.researched = true;
      expect(canResearch('fire_making', techs, { knowledge: 10 } as Resources)).toBe(false);
    });
  });

  describe('researchTech', () => {
    it('marks the tech as researched', () => {
      const result = researchTech('fire_making', techs);
      expect(result.techs.find(t => t.id === 'fire_making')!.researched).toBe(true);
    });

    it('returns the tech effects', () => {
      const result = researchTech('fire_making', techs);
      expect(result.effects.resourceBonuses).toEqual({ food: 1 });
    });

    it('detects advance tech', () => {
      // Research prerequisites first
      techs.find(t => t.id === 'fire_making')!.researched = true;
      techs.find(t => t.id === 'tool_crafting')!.researched = true;
      techs.find(t => t.id === 'shelter_building')!.researched = true;
      techs.find(t => t.id === 'tribal_lore')!.researched = true;
      const result = researchTech('advance_bronze', techs);
      expect(result.effects.isAdvance).toBe(true);
    });
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run tests/logic/techEngine.test.ts`
Expected: FAIL — module not found

- [ ] **Step 4: Implement tech engine**

Create `src/logic/techEngine.ts`:

```typescript
import { TechNode, TechEffects, Resources } from '@/types/game';

export function canResearch(techId: string, techs: TechNode[], resources: Resources): boolean {
  const tech = techs.find(t => t.id === techId);
  if (!tech || tech.researched) return false;
  if (resources.knowledge < tech.cost) return false;
  return tech.requires.every(reqId => {
    const req = techs.find(t => t.id === reqId);
    return req?.researched === true;
  });
}

export function researchTech(techId: string, techs: TechNode[]): { techs: TechNode[]; effects: TechEffects } {
  const newTechs = techs.map(t =>
    t.id === techId ? { ...t, researched: true } : t
  );
  const tech = newTechs.find(t => t.id === techId)!;
  return { techs: newTechs, effects: tech.effects };
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run tests/logic/techEngine.test.ts`
Expected: All 6 tests PASS

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: add tech engine with Stone Age tech tree"
```

---

### Task 8: Event Engine

**Files:**
- Create: `src/logic/eventEngine.ts`, `tests/logic/eventEngine.test.ts`, `src/data/events/stoneAge.ts`

- [ ] **Step 1: Create Stone Age events data**

Create `src/data/events/stoneAge.ts`:

```typescript
import { GameEvent } from '@/types/events';

export const STONE_AGE_EVENTS: GameEvent[] = [
  {
    id: 'stone_neighboring_tribe',
    age: 'stone',
    triggers: { minTurn: 2, tileRevealed: ['plains', 'forest'] },
    text: 'A neighboring tribe approaches {leaderName}\'s camp. They offer to share their knowledge of the land in exchange for access to your hunting grounds.',
    choices: [
      {
        id: 'accept',
        text: 'Welcome them',
        requires: {},
        effects: {
          resources: { food: -2, knowledge: 5 },
          identity: { economy: 10 },
          flags: { shared_hunting_grounds: true },
        },
      },
      {
        id: 'refuse',
        text: 'Turn them away',
        requires: {},
        effects: {
          identity: { economy: -10 },
          flags: { refused_tribe: true },
        },
      },
      {
        id: 'demand',
        text: 'Demand they submit to your rule',
        requires: { identity: { military: 20 } },
        effects: {
          identity: { military: 10 },
          army: { numbers: 3 },
          flags: { subjugated_tribe: true },
          outcomes: [
            { weight: 0.6, text: 'They submit to your authority.' },
            { weight: 0.4, text: 'They fight back!', combat: { enemyStrength: 8, enemyToughness: 4 } },
          ],
        },
      },
    ],
    chain: {
      nextEvents: {
        shared_hunting_grounds: 'bronze_tribe_grows',
        refused_tribe: 'bronze_tribe_hostile',
        subjugated_tribe: 'bronze_tribe_revolt',
      },
    },
    unique: true,
  },
  {
    id: 'stone_wild_beast',
    age: 'stone',
    triggers: { tileRevealed: ['forest'] },
    text: 'A massive beast has been spotted in the forests near your camp. Your hunters are nervous.',
    choices: [
      {
        id: 'hunt',
        text: 'Organize a great hunt',
        requires: { armyStats: { strength: 3 } },
        effects: {
          resources: { food: 8 },
          identity: { military: 5 },
          addCivTag: 'Beast Slayers',
        },
      },
      {
        id: 'avoid',
        text: 'Avoid the forest',
        requires: {},
        effects: {
          resources: { food: -2 },
        },
      },
      {
        id: 'study',
        text: 'Observe the beast from afar',
        requires: { civTags: ['Oral Tradition'] },
        effects: {
          resources: { knowledge: 4 },
          identity: { knowledge: 10 },
        },
      },
    ],
    unique: true,
  },
  {
    id: 'stone_strange_stones',
    age: 'stone',
    triggers: { tileRevealed: ['mountain', 'ruins'] },
    text: 'Your scouts discover strange markings on stones in the hills. They seem to tell an ancient story.',
    choices: [
      {
        id: 'study_stones',
        text: 'Spend time deciphering them',
        requires: {},
        effects: {
          resources: { knowledge: 6 },
          identity: { knowledge: 15 },
          flags: { found_ancient_stones: true },
        },
      },
      {
        id: 'use_stones',
        text: 'Use the stones for building',
        requires: {},
        effects: {
          resources: { materials: 5 },
          identity: { knowledge: -5 },
        },
      },
    ],
    unique: true,
  },
  {
    id: 'stone_harsh_winter',
    age: 'stone',
    triggers: { minTurn: 5 },
    text: 'A brutal winter descends on your people. Food stores are dwindling.',
    choices: [
      {
        id: 'ration',
        text: 'Ration carefully',
        requires: {},
        effects: {
          resources: { food: -4, population: -1 },
          identity: { knowledge: 5 },
        },
      },
      {
        id: 'raid',
        text: 'Raid a neighboring camp',
        requires: { armyStats: { strength: 5 } },
        effects: {
          resources: { food: 6 },
          identity: { military: 15 },
          flags: { raided_neighbors: true },
        },
      },
      {
        id: 'migrate',
        text: 'Move camp to warmer lands',
        requires: {},
        effects: {
          resources: { food: -2, materials: -3 },
          addCivTag: 'Nomadic',
        },
      },
    ],
    unique: true,
  },
  {
    id: 'stone_fire_discovery',
    age: 'stone',
    triggers: { minTurn: 1, maxTurn: 3 },
    text: 'Lightning strikes a dry tree, setting the grasslands ablaze. Your people watch in awe and terror.',
    choices: [
      {
        id: 'capture_fire',
        text: 'Capture the flames',
        requires: {},
        effects: {
          resources: { knowledge: 3 },
          identity: { knowledge: 10 },
          addLeaderTrait: 'Visionary',
        },
      },
      {
        id: 'flee',
        text: 'Flee to safety',
        requires: {},
        effects: {
          resources: { food: -1 },
          army: { speed: 1 },
        },
      },
    ],
    unique: true,
  },
];
```

- [ ] **Step 2: Write failing tests for event engine**

Create `tests/logic/eventEngine.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { evaluateTriggers, getAvailableEvents, isChoiceAvailable } from '@/logic/eventEngine';
import { GameState } from '@/types/game';
import { GameEvent, EventChoice } from '@/types/events';
import { STONE_AGE_EVENTS } from '@/data/events/stoneAge';

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    age: 'stone',
    turn: 3,
    actionPoints: 3,
    maxActionPoints: 3,
    resources: { food: 10, materials: 5, wealth: 0, knowledge: 0, influence: 0, population: 5 },
    army: { strength: 5, toughness: 2, speed: 2, stealth: 1, range: 0, morale: 3, numbers: 5 },
    civ: {
      identity: { military: 0, economy: 0, knowledge: 0 },
      tags: [],
      leaders: [{ name: 'Kara', traits: ['Bold'] }],
    },
    map: [
      { coord: { q: 0, r: 0, s: 0 }, type: 'plains', visible: true, controlled: true, building: null, rivalId: null },
      { coord: { q: 1, r: -1, s: 0 }, type: 'forest', visible: true, controlled: false, building: null, rivalId: null },
    ],
    rivals: [],
    techs: [],
    flags: {},
    phase: 'event',
    currentEvent: null,
    gameOver: null,
    ...overrides,
  };
}

describe('eventEngine', () => {
  describe('evaluateTriggers', () => {
    it('matches event with met age and turn triggers', () => {
      const state = makeState();
      const event = STONE_AGE_EVENTS.find(e => e.id === 'stone_neighboring_tribe')!;
      expect(evaluateTriggers(event.triggers, state)).toBe(true);
    });

    it('rejects event with unmet turn trigger', () => {
      const state = makeState({ turn: 1 });
      const event = STONE_AGE_EVENTS.find(e => e.id === 'stone_harsh_winter')!;
      expect(evaluateTriggers(event.triggers, state)).toBe(false);
    });
  });

  describe('isChoiceAvailable', () => {
    it('allows choice with no requirements', () => {
      const choice: EventChoice = { id: 'x', text: 'x', requires: {}, effects: {} };
      const state = makeState();
      expect(isChoiceAvailable(choice, state)).toBe(true);
    });

    it('blocks choice requiring unmet identity', () => {
      const choice: EventChoice = {
        id: 'x', text: 'x',
        requires: { identity: { military: 50 } },
        effects: {},
      };
      const state = makeState();
      expect(isChoiceAvailable(choice, state)).toBe(false);
    });

    it('allows choice when army stats met', () => {
      const choice: EventChoice = {
        id: 'x', text: 'x',
        requires: { armyStats: { strength: 3 } },
        effects: {},
      };
      const state = makeState();
      expect(isChoiceAvailable(choice, state)).toBe(true);
    });
  });

  describe('getAvailableEvents', () => {
    it('returns events matching current state', () => {
      const state = makeState();
      const available = getAvailableEvents(STONE_AGE_EVENTS, state);
      expect(available.length).toBeGreaterThan(0);
    });

    it('excludes events whose flags are already set (unique)', () => {
      const state = makeState({ flags: { shared_hunting_grounds: true } });
      const available = getAvailableEvents(STONE_AGE_EVENTS, state);
      const tribe = available.find(e => e.id === 'stone_neighboring_tribe');
      // unique event already triggered via flag — should be excluded
      expect(tribe).toBeUndefined();
    });
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run tests/logic/eventEngine.test.ts`
Expected: FAIL — module not found

- [ ] **Step 4: Implement event engine**

Create `src/logic/eventEngine.ts`:

```typescript
import { GameState, ArmyStats } from '@/types/game';
import { EventTrigger, EventChoice, GameEvent, EventOutcome } from '@/types/events';
import { TileType } from '@/types/map';

export function evaluateTriggers(triggers: EventTrigger, state: GameState): boolean {
  if (triggers.age && triggers.age !== state.age) return false;
  if (triggers.minTurn && state.turn < triggers.minTurn) return false;
  if (triggers.maxTurn && state.turn > triggers.maxTurn) return false;

  if (triggers.flags) {
    for (const [key, val] of Object.entries(triggers.flags)) {
      if (state.flags[key] !== val) return false;
    }
  }

  if (triggers.identity) {
    for (const [axis, range] of Object.entries(triggers.identity)) {
      const val = state.civ.identity[axis as keyof typeof state.civ.identity];
      if (range.min !== undefined && val < range.min) return false;
      if (range.max !== undefined && val > range.max) return false;
    }
  }

  if (triggers.leaderTraits) {
    const currentLeader = state.civ.leaders[state.civ.leaders.length - 1];
    if (!currentLeader) return false;
    if (!triggers.leaderTraits.every(t => currentLeader.traits.includes(t))) return false;
  }

  if (triggers.civTags) {
    if (!triggers.civTags.every(t => state.civ.tags.includes(t))) return false;
  }

  if (triggers.tileRevealed) {
    const visibleTypes = new Set(state.map.filter(t => t.visible).map(t => t.type));
    if (!triggers.tileRevealed.some(tt => visibleTypes.has(tt))) return false;
  }

  return true;
}

export function isChoiceAvailable(choice: EventChoice, state: GameState): boolean {
  const req = choice.requires;

  if (req.identity) {
    for (const [axis, minVal] of Object.entries(req.identity)) {
      if (state.civ.identity[axis as keyof typeof state.civ.identity] < minVal) return false;
    }
  }

  if (req.leaderTraits) {
    const currentLeader = state.civ.leaders[state.civ.leaders.length - 1];
    if (!currentLeader || !req.leaderTraits.every(t => currentLeader.traits.includes(t))) return false;
  }

  if (req.civTags) {
    if (!req.civTags.every(t => state.civ.tags.includes(t))) return false;
  }

  if (req.armyStats) {
    for (const [stat, minVal] of Object.entries(req.armyStats)) {
      if (state.army[stat as keyof ArmyStats] < minVal) return false;
    }
  }

  return true;
}

export function getAvailableEvents(allEvents: GameEvent[], state: GameState): GameEvent[] {
  return allEvents.filter(event => {
    // Skip unique events that already fired (check if any of their choice flags are set)
    if (event.unique) {
      const allChoiceFlags = event.choices.flatMap(c =>
        c.effects.flags ? Object.keys(c.effects.flags) : []
      );
      if (allChoiceFlags.some(f => state.flags[f])) return false;
    }
    return evaluateTriggers(event.triggers, state);
  });
}

export function pickRandomEvent(events: GameEvent[], rand: () => number): GameEvent | null {
  if (events.length === 0) return null;
  return events[Math.floor(rand() * events.length)];
}

export function resolveOutcome(outcomes: EventOutcome[], rand: () => number): EventOutcome {
  const total = outcomes.reduce((s, o) => s + o.weight, 0);
  let roll = rand() * total;
  for (const outcome of outcomes) {
    roll -= outcome.weight;
    if (roll <= 0) return outcome;
  }
  return outcomes[outcomes.length - 1];
}

export function interpolateText(text: string, state: GameState): string {
  const leader = state.civ.leaders[state.civ.leaders.length - 1];
  return text
    .replace(/\{leaderName\}/g, leader?.name ?? 'Your leader')
    .replace(/\{civTag\}/g, state.civ.tags[state.civ.tags.length - 1] ?? '');
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run tests/logic/eventEngine.test.ts`
Expected: All 6 tests PASS

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: add event engine with trigger evaluation and Stone Age events"
```

---

### Task 9: Combat Engine

**Files:**
- Create: `src/logic/combatEngine.ts`, `tests/logic/combatEngine.test.ts`

- [ ] **Step 1: Write failing tests for combat resolution**

Create `tests/logic/combatEngine.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { resolveCombat, CombatResult } from '@/logic/combatEngine';
import { ArmyStats } from '@/types/game';

const strongArmy: ArmyStats = {
  strength: 15, toughness: 10, speed: 5, stealth: 3, range: 5, morale: 8, numbers: 10,
};

const weakArmy: ArmyStats = {
  strength: 3, toughness: 2, speed: 2, stealth: 1, range: 0, morale: 3, numbers: 5,
};

describe('combatEngine', () => {
  it('strong army wins against weak enemy', () => {
    const result = resolveCombat(strongArmy, { enemyStrength: 5, enemyToughness: 3 }, () => 0.5);
    expect(result.victory).toBe(true);
  });

  it('weak army can lose to strong enemy', () => {
    const result = resolveCombat(weakArmy, { enemyStrength: 20, enemyToughness: 15 }, () => 0.5);
    expect(result.victory).toBe(false);
  });

  it('always returns casualties', () => {
    const result = resolveCombat(strongArmy, { enemyStrength: 5, enemyToughness: 3 }, () => 0.5);
    expect(result.numbersLost).toBeGreaterThanOrEqual(0);
    expect(result.numbersLost).toBeDefined();
  });

  it('higher range gives pre-combat advantage', () => {
    const rangedArmy = { ...weakArmy, range: 10 };
    const resultWithRange = resolveCombat(rangedArmy, { enemyStrength: 10, enemyToughness: 5 }, () => 0.5);
    const resultWithout = resolveCombat(weakArmy, { enemyStrength: 10, enemyToughness: 5 }, () => 0.5);
    // Ranged army should lose fewer numbers
    expect(resultWithRange.numbersLost).toBeLessThanOrEqual(resultWithout.numbersLost);
  });

  it('result includes descriptive text', () => {
    const result = resolveCombat(strongArmy, { enemyStrength: 5, enemyToughness: 3 }, () => 0.5);
    expect(result.text).toBeTruthy();
    expect(typeof result.text).toBe('string');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/logic/combatEngine.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement combat engine**

Create `src/logic/combatEngine.ts`:

```typescript
import { ArmyStats } from '@/types/game';

interface EnemyStats {
  enemyStrength: number;
  enemyToughness: number;
}

export interface CombatResult {
  victory: boolean;
  numbersLost: number;
  text: string;
}

export function resolveCombat(
  army: ArmyStats,
  enemy: EnemyStats,
  rand: () => number
): CombatResult {
  // Calculate effective attack power
  const rangeBonus = Math.min(army.range, enemy.enemyStrength); // pre-combat damage
  const effectiveStrength = army.strength * (1 + army.numbers / 10) + rangeBonus;
  const effectiveToughness = army.toughness * (1 + army.numbers / 10);

  // Enemy power
  const enemyPower = enemy.enemyStrength * 1.5;
  const enemyDefense = enemy.enemyToughness;

  // Combat score: how much we outclass the enemy
  const attackScore = effectiveStrength - enemyDefense;
  const defenseScore = effectiveToughness - enemyPower;
  const totalScore = attackScore + defenseScore;

  // Add randomness: ±20% swing
  const roll = (rand() - 0.5) * 0.4;
  const finalScore = totalScore * (1 + roll);

  // Morale check: low morale makes defeat more likely
  const moraleFactor = army.morale / 10; // 0.0 to 1.0+

  const victory = (finalScore + moraleFactor * 5) > 0;

  // Casualties: based on enemy strength vs our toughness
  const baseCasualties = Math.max(0, Math.ceil(enemyPower / Math.max(1, effectiveToughness) * 2));
  // Speed helps reduce casualties (fast retreat)
  const speedReduction = Math.floor(army.speed / 5);
  const numbersLost = Math.max(0, baseCasualties - speedReduction - (victory ? 1 : 0));

  const text = victory
    ? `Victory! Your forces prevailed, losing ${numbersLost} warriors.`
    : `Defeat. Your forces were driven back, losing ${numbersLost} warriors.`;

  return { victory, numbersLost, text };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/logic/combatEngine.test.ts`
Expected: All 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add combat engine with stat-based resolution"
```

## Chunk 4: Rival Engine, Turn Engine, Age Engine

### Task 10: Rival Engine

**Files:**
- Create: `src/logic/rivalEngine.ts`, `tests/logic/rivalEngine.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/logic/rivalEngine.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { processRivalTurn, createRival } from '@/logic/rivalEngine';
import { RivalCiv, GameState } from '@/types/game';
import { Tile } from '@/types/map';

function makeState(rivals: RivalCiv[], map: Tile[]): GameState {
  return {
    age: 'stone', turn: 3, actionPoints: 3, maxActionPoints: 3,
    resources: { food: 10, materials: 5, wealth: 0, knowledge: 0, influence: 0, population: 5 },
    army: { strength: 5, toughness: 2, speed: 2, stealth: 1, range: 0, morale: 3, numbers: 5 },
    civ: { identity: { military: 0, economy: 0, knowledge: 0 }, tags: [], leaders: [] },
    map, rivals, techs: [], flags: {}, phase: 'enemy', currentEvent: null, gameOver: null,
  };
}

describe('rivalEngine', () => {
  describe('createRival', () => {
    it('creates a rival with valid stats', () => {
      const rival = createRival('stone', { q: 3, r: -3, s: 0 }, () => 0.5);
      expect(rival.id).toBeTruthy();
      expect(rival.threat.strength).toBeGreaterThan(0);
      expect(['aggressive', 'defensive', 'trader']).toContain(rival.personality);
    });
  });

  describe('processRivalTurn', () => {
    it('aggressive rival expands to unclaimed tiles', () => {
      const rival = createRival('stone', { q: 3, r: -3, s: 0 }, () => 0.2); // aggressive
      rival.personality = 'aggressive';
      const map: Tile[] = [
        { coord: { q: 3, r: -3, s: 0 }, type: 'plains', visible: false, controlled: false, building: null, rivalId: rival.id },
        { coord: { q: 2, r: -2, s: 0 }, type: 'plains', visible: false, controlled: false, building: null, rivalId: null },
      ];
      const state = makeState([rival], map);
      const result = processRivalTurn(state, () => 0.5);
      const expanded = result.map.filter(t => t.rivalId === rival.id);
      expect(expanded.length).toBeGreaterThanOrEqual(1);
    });

    it('rival threat scales each turn', () => {
      const rival = createRival('stone', { q: 3, r: -3, s: 0 }, () => 0.5);
      const initialStrength = rival.threat.strength;
      const map: Tile[] = [
        { coord: { q: 3, r: -3, s: 0 }, type: 'plains', visible: false, controlled: false, building: null, rivalId: rival.id },
      ];
      const state = makeState([rival], map);
      const result = processRivalTurn(state, () => 0.5);
      const updatedRival = result.rivals.find(r => r.id === rival.id)!;
      expect(updatedRival.threat.strength).toBeGreaterThanOrEqual(initialStrength);
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/logic/rivalEngine.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement rival engine**

Create `src/logic/rivalEngine.ts`:

```typescript
import { RivalCiv, ArmyStats, GameState, AgeId } from '@/types/game';
import { HexCoord, Tile } from '@/types/map';
import { hexNeighbors } from '@/game/hex/hexUtils';

const NAMES = ['Wolf Clan', 'River People', 'Hill Tribe', 'Stone Band', 'Fire Walkers'];
const PERSONALITIES: RivalCiv['personality'][] = ['aggressive', 'defensive', 'trader'];

const hexKey = (c: HexCoord) => `${c.q},${c.r}`;

export function createRival(age: AgeId, homeTile: HexCoord, rand: () => number): RivalCiv {
  const baseStrength = age === 'stone' ? 3 : 6;
  return {
    id: `rival_${homeTile.q}_${homeTile.r}`,
    name: NAMES[Math.floor(rand() * NAMES.length)],
    personality: PERSONALITIES[Math.floor(rand() * PERSONALITIES.length)],
    threat: {
      strength: baseStrength + Math.floor(rand() * 3),
      toughness: baseStrength - 1 + Math.floor(rand() * 2),
      speed: 2, stealth: 1, range: 0, morale: 3,
      numbers: 4 + Math.floor(rand() * 4),
    },
    disposition: 0,
    homeTile,
    controlledTiles: [homeTile],
  };
}

export function processRivalTurn(
  state: GameState,
  rand: () => number
): { rivals: RivalCiv[]; map: Tile[] } {
  const newMap = state.map.map(t => ({ ...t }));
  const mapLookup = new Map(newMap.map(t => [hexKey(t.coord), t]));
  const newRivals = state.rivals.map(r => ({
    ...r,
    threat: { ...r.threat },
    controlledTiles: [...r.controlledTiles],
  }));

  for (const rival of newRivals) {
    // Scale threat slightly each turn
    rival.threat.strength += 1;
    rival.threat.numbers = Math.min(rival.threat.numbers + 1, 15);

    // Aggressive rivals expand
    if (rival.personality === 'aggressive' || (rival.personality === 'trader' && rand() > 0.7)) {
      const candidates: Tile[] = [];
      for (const controlled of rival.controlledTiles) {
        for (const neighbor of hexNeighbors(controlled)) {
          const tile = mapLookup.get(hexKey(neighbor));
          if (tile && !tile.controlled && tile.rivalId === null && tile.type !== 'water') {
            candidates.push(tile);
          }
        }
      }
      if (candidates.length > 0) {
        const target = candidates[Math.floor(rand() * candidates.length)];
        target.rivalId = rival.id;
        rival.controlledTiles.push(target.coord);
      }
    }
  }

  return { rivals: newRivals, map: newMap };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/logic/rivalEngine.test.ts`
Expected: All 3 tests PASS

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add rival engine with expansion and threat scaling"
```

---

### Task 11: Turn Engine

**Files:**
- Create: `src/logic/turnEngine.ts`, `tests/logic/turnEngine.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/logic/turnEngine.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { processCollectPhase, processExploreAction, processBuildAction } from '@/logic/turnEngine';
import { GameState } from '@/types/game';
import { Tile } from '@/types/map';

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    age: 'stone', turn: 1, actionPoints: 3, maxActionPoints: 3,
    resources: { food: 10, materials: 5, wealth: 0, knowledge: 0, influence: 0, population: 5 },
    army: { strength: 3, toughness: 2, speed: 2, stealth: 1, range: 0, morale: 3, numbers: 5 },
    civ: { identity: { military: 0, economy: 0, knowledge: 0 }, tags: [], leaders: [{ name: 'Kara', traits: [] }] },
    map: [
      { coord: { q: 0, r: 0, s: 0 }, type: 'plains', visible: true, controlled: true, building: null, rivalId: null },
      { coord: { q: 1, r: -1, s: 0 }, type: 'forest', visible: true, controlled: false, building: null, rivalId: null },
      { coord: { q: 0, r: 1, s: -1 }, type: 'mountain', visible: false, controlled: false, building: null, rivalId: null },
    ],
    rivals: [], techs: [], flags: {}, phase: 'actions', currentEvent: null, gameOver: null,
    ...overrides,
  };
}

describe('turnEngine', () => {
  describe('processCollectPhase', () => {
    it('adds resources based on buildings and population', () => {
      const state = makeState();
      const result = processCollectPhase(state);
      expect(result.resources.food).toBeGreaterThan(state.resources.food);
    });

    it('triggers game over when population reaches 0', () => {
      const state = makeState({
        resources: { food: 0, materials: 0, wealth: 0, knowledge: 0, influence: 0, population: 1 },
      });
      // With 0 food and army upkeep, population should drop
      const result = processCollectPhase(state);
      if (result.resources.population <= 0) {
        expect(result.gameOver).toBeTruthy();
      }
    });
  });

  describe('processExploreAction', () => {
    it('reveals hidden tiles adjacent to controlled territory', () => {
      const state = makeState();
      const hidden = state.map.find(t => !t.visible)!;
      const result = processExploreAction(state, hidden.coord);
      const tile = result.map.find(t => t.coord.q === hidden.coord.q && t.coord.r === hidden.coord.r);
      expect(tile!.visible).toBe(true);
    });

    it('claims the explored tile', () => {
      const state = makeState();
      // Explore the visible but uncontrolled forest
      const target = state.map.find(t => t.type === 'forest' && !t.controlled)!;
      const result = processExploreAction(state, target.coord);
      const tile = result.map.find(t => t.coord.q === target.coord.q);
      expect(tile!.controlled).toBe(true);
    });
  });

  describe('processBuildAction', () => {
    it('places a building on a controlled tile', () => {
      const state = makeState();
      const target = state.map.find(t => t.controlled && !t.building)!;
      const result = processBuildAction(state, target.coord, 'gathering_site');
      const tile = result.map.find(t => t.coord.q === target.coord.q);
      expect(tile!.building).toBe('gathering_site');
    });

    it('deducts building cost from resources', () => {
      const state = makeState();
      const target = state.map.find(t => t.controlled)!;
      const result = processBuildAction(state, target.coord, 'gathering_site');
      expect(result.resources.materials).toBeLessThan(state.resources.materials);
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/logic/turnEngine.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement turn engine**

Create `src/logic/turnEngine.ts`:

```typescript
import { GameState, Resources } from '@/types/game';
import { HexCoord, Tile } from '@/types/map';
import { calculateCollection } from './resourceEngine';
import { hexNeighbors } from '@/game/hex/hexUtils';
import { getBuildingDef } from '@/data/buildings';

const hexKey = (c: HexCoord) => `${c.q},${c.r}`;

export function processCollectPhase(state: GameState): Partial<GameState> {
  const delta = calculateCollection({
    map: state.map,
    resources: state.resources,
    techs: state.techs,
    armyNumbers: state.army.numbers,
  });

  const newResources = { ...state.resources };
  for (const [key, val] of Object.entries(delta)) {
    if (val !== undefined) {
      newResources[key as keyof Resources] = Math.max(0, newResources[key as keyof Resources] + val);
    }
  }

  // Starvation: if food is 0, lose population
  if (newResources.food <= 0) {
    newResources.population = Math.max(0, newResources.population - 2);
  }

  // Check loss condition
  if (newResources.population <= 0) {
    return {
      resources: newResources,
      phase: 'gameOver',
      gameOver: { reason: 'Your people have perished.', victory: false },
    };
  }

  return { resources: newResources };
}

export function processExploreAction(state: GameState, target: HexCoord): Partial<GameState> {
  const newMap = state.map.map(t => ({ ...t }));
  const tile = newMap.find(t => t.coord.q === target.q && t.coord.r === target.r && t.coord.s === target.s);

  if (!tile) return {};

  tile.visible = true;
  tile.controlled = tile.rivalId === null;

  // Also reveal neighbors
  for (const neighbor of hexNeighbors(target)) {
    const nTile = newMap.find(t => t.coord.q === neighbor.q && t.coord.r === neighbor.r);
    if (nTile) nTile.visible = true;
  }

  return { map: newMap };
}

export function processBuildAction(state: GameState, target: HexCoord, buildingId: string): Partial<GameState> {
  const building = getBuildingDef(buildingId);
  if (!building) return {};

  // Check cost
  const newResources = { ...state.resources };
  for (const [res, cost] of Object.entries(building.cost)) {
    if (cost && newResources[res as keyof Resources] < cost) return {}; // can't afford
  }

  // Deduct cost
  for (const [res, cost] of Object.entries(building.cost)) {
    if (cost) newResources[res as keyof Resources] -= cost;
  }

  // Place building
  const newMap = state.map.map(t => {
    if (t.coord.q === target.q && t.coord.r === target.r && t.coord.s === target.s) {
      return { ...t, building: buildingId };
    }
    return t;
  });

  return { resources: newResources, map: newMap };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/logic/turnEngine.test.ts`
Expected: All 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add turn engine with collect, explore, and build actions"
```

---

### Task 12: Age Engine

**Files:**
- Create: `src/logic/ageEngine.ts`, `tests/logic/ageEngine.test.ts`, `src/data/ages.ts`

- [ ] **Step 1: Create age definitions**

Create `src/data/ages.ts`:

```typescript
import { AgeDef } from '@/types/game';

export const AGES: AgeDef[] = [
  { id: 'stone', name: 'Stone Age', mapSize: 15, turnsPerAge: 12 },
  { id: 'bronze', name: 'Bronze Age', mapSize: 25, turnsPerAge: 12 },
  { id: 'classical', name: 'Classical Age', mapSize: 30, turnsPerAge: 12 },
  { id: 'medieval', name: 'Medieval Age', mapSize: 35, turnsPerAge: 12 },
  { id: 'renaissance', name: 'Renaissance', mapSize: 35, turnsPerAge: 10 },
  { id: 'industrial', name: 'Industrial Age', mapSize: 30, turnsPerAge: 10 },
  { id: 'modern', name: 'Modern Age', mapSize: 30, turnsPerAge: 10 },
  { id: 'space', name: 'Space Age', mapSize: 30, turnsPerAge: 10 },
];

export function getNextAge(current: string): AgeDef | null {
  const idx = AGES.findIndex(a => a.id === current);
  if (idx < 0 || idx >= AGES.length - 1) return null;
  return AGES[idx + 1];
}

export function getAgeDef(id: string): AgeDef | undefined {
  return AGES.find(a => a.id === id);
}
```

- [ ] **Step 2: Write failing tests for age engine**

Create `tests/logic/ageEngine.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { transitionAge } from '@/logic/ageEngine';
import { GameState } from '@/types/game';

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    age: 'stone', turn: 10, actionPoints: 0, maxActionPoints: 3,
    resources: { food: 20, materials: 15, wealth: 0, knowledge: 0, influence: 0, population: 10 },
    army: { strength: 5, toughness: 3, speed: 2, stealth: 1, range: 0, morale: 5, numbers: 8 },
    civ: {
      identity: { military: 10, economy: 5, knowledge: 15 },
      tags: ['Beast Slayers'],
      leaders: [{ name: 'Kara', traits: ['Bold'] }],
    },
    map: [
      { coord: { q: 0, r: 0, s: 0 }, type: 'plains', visible: true, controlled: true, building: 'camp', rivalId: null },
    ],
    rivals: [], techs: [], flags: { shared_hunting_grounds: true },
    phase: 'ageTransition', currentEvent: null, gameOver: null,
    ...overrides,
  };
}

describe('ageEngine', () => {
  describe('transitionAge', () => {
    it('advances to the next age', () => {
      const result = transitionAge(makeState(), 42);
      expect(result.age).toBe('bronze');
    });

    it('resets turn counter', () => {
      const result = transitionAge(makeState(), 42);
      expect(result.turn).toBe(1);
    });

    it('preserves cultural identity', () => {
      const state = makeState();
      const result = transitionAge(state, 42);
      expect(result.civ.identity).toEqual(state.civ.identity);
    });

    it('preserves civ tags', () => {
      const state = makeState();
      const result = transitionAge(state, 42);
      expect(result.civ.tags).toContain('Beast Slayers');
    });

    it('preserves flags', () => {
      const result = transitionAge(makeState(), 42);
      expect(result.flags.shared_hunting_grounds).toBe(true);
    });

    it('generates new map', () => {
      const result = transitionAge(makeState(), 42);
      expect(result.map.length).toBeGreaterThan(1);
    });

    it('adds a new leader', () => {
      const state = makeState();
      const result = transitionAge(state, 42);
      expect(result.civ.leaders.length).toBe(2);
    });
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run tests/logic/ageEngine.test.ts`
Expected: FAIL — module not found

- [ ] **Step 4: Implement age engine**

Create `src/logic/ageEngine.ts`:

```typescript
import { GameState, AgeId, Leader } from '@/types/game';
import { getNextAge } from '@/data/ages';
import { generateMap } from './mapGenerator';
import { stoneAgeTechs } from '@/data/techs/stoneAge';

const LEADER_NAMES = [
  'Kara', 'Theron', 'Ayla', 'Bron', 'Seren', 'Dax', 'Lyra', 'Orin',
  'Nala', 'Voss', 'Eira', 'Tobin', 'Mira', 'Cael', 'Juno', 'Rook',
];

const BASE_TRAITS = ['Bold', 'Cautious', 'Devout', 'Cunning', 'Visionary', 'Ruthless'];

function generateLeader(rand: () => number, existingNames: string[]): Leader {
  const available = LEADER_NAMES.filter(n => !existingNames.includes(n));
  const name = available.length > 0
    ? available[Math.floor(rand() * available.length)]
    : LEADER_NAMES[Math.floor(rand() * LEADER_NAMES.length)];
  const trait = BASE_TRAITS[Math.floor(rand() * BASE_TRAITS.length)];
  return { name, traits: [trait] };
}

/** Simple seeded PRNG (mulberry32) */
function mulberry32(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function getTechsForAge(_ageId: AgeId): ReturnType<typeof stoneAgeTechs> {
  // For now, only Stone Age techs are defined. Future ages will add their own.
  // Returns empty array for undefined ages — techs are loaded per-age.
  switch (_ageId) {
    case 'stone': return stoneAgeTechs();
    default: return []; // placeholder — future chunks add age-specific tech trees
  }
}

export function transitionAge(state: GameState, seed: number): GameState {
  const nextAge = getNextAge(state.age);
  if (!nextAge) {
    // Final age complete — victory
    return {
      ...state,
      phase: 'gameOver',
      gameOver: { reason: 'Your civilization has reached its zenith!', victory: true },
    };
  }

  const rand = mulberry32(seed);
  const existingNames = state.civ.leaders.map(l => l.name);
  const newLeader = generateLeader(rand, existingNames);

  const newMap = generateMap({ targetTiles: nextAge.mapSize, seed });

  return {
    ...state,
    age: nextAge.id,
    turn: 1,
    actionPoints: 3,
    maxActionPoints: 3,
    civ: {
      ...state.civ,
      leaders: [...state.civ.leaders, newLeader],
    },
    map: newMap,
    rivals: [], // new rivals generated separately
    techs: getTechsForAge(nextAge.id),
    phase: 'collect',
    currentEvent: null,
  };
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run tests/logic/ageEngine.test.ts`
Expected: All 7 tests PASS

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: add age engine with transition logic and leader generation"
```

## Chunk 5: Phaser Hex Map + React UI

### Task 13: Phaser Game Setup

**Files:**
- Create: `src/game/config.ts`, `src/game/PhaserGame.tsx`, `src/game/scenes/HexMapScene.ts`, `src/game/hex/hexRenderer.ts`

- [ ] **Step 1: Create Phaser config**

Create `src/game/config.ts`:

```typescript
import Phaser from 'phaser';
import { HexMapScene } from './scenes/HexMapScene';

export function createGameConfig(parent: string): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    backgroundColor: '#1a1a2e',
    scale: {
      mode: Phaser.Scale.RESIZE,
      width: '100%',
      height: '100%',
    },
    scene: [HexMapScene],
  };
}
```

- [ ] **Step 2: Create hex renderer**

Create `src/game/hex/hexRenderer.ts`:

```typescript
import Phaser from 'phaser';
import { Tile, TileType } from '@/types/map';
import { hexToPixel } from './hexUtils';

const HEX_SIZE = 32;

const TILE_COLORS: Record<TileType, number> = {
  plains: 0x7ec850,
  forest: 0x2d6a2d,
  mountain: 0x8b8b8b,
  water: 0x4a90d9,
  desert: 0xd4a853,
  ruins: 0x8b6914,
  fertile: 0x4caf50,
  special: 0xab47bc,
};

const FOG_COLOR = 0x333344;

export function drawHex(graphics: Phaser.GameObjects.Graphics, x: number, y: number, size: number): void {
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i);
    points.push({
      x: x + size * Math.cos(angle),
      y: y + size * Math.sin(angle),
    });
  }
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < 6; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
}

export function renderMap(
  graphics: Phaser.GameObjects.Graphics,
  tiles: Tile[],
  offsetX: number,
  offsetY: number
): void {
  graphics.clear();

  for (const tile of tiles) {
    if (!tile.visible) {
      // Draw fog
      const { x, y } = hexToPixel(tile.coord, HEX_SIZE);
      graphics.fillStyle(FOG_COLOR, 0.5);
      graphics.lineStyle(1, 0x222233);
      drawHex(graphics, x + offsetX, y + offsetY, HEX_SIZE);
      continue;
    }

    const { x, y } = hexToPixel(tile.coord, HEX_SIZE);
    const color = TILE_COLORS[tile.type] ?? 0x666666;

    graphics.fillStyle(color);
    graphics.lineStyle(1, 0x111111);
    drawHex(graphics, x + offsetX, y + offsetY, HEX_SIZE);

    // Controlled indicator
    if (tile.controlled) {
      graphics.lineStyle(2, 0xffd700);
      drawHex(graphics, x + offsetX, y + offsetY, HEX_SIZE - 2);
    }

    // Rival indicator
    if (tile.rivalId) {
      graphics.lineStyle(2, 0xff4444);
      drawHex(graphics, x + offsetX, y + offsetY, HEX_SIZE - 2);
    }
  }
}

export { HEX_SIZE };
```

- [ ] **Step 3: Create HexMapScene**

Create `src/game/scenes/HexMapScene.ts`:

```typescript
import Phaser from 'phaser';
import { renderMap, HEX_SIZE } from '../hex/hexRenderer';
import { pixelToHex } from '../hex/hexUtils';
import { useGameStore } from '@/store/gameStore';

export class HexMapScene extends Phaser.Scene {
  private graphics!: Phaser.GameObjects.Graphics;
  private cameraOffset = { x: 0, y: 0 };
  private isDragging = false;
  private dragStart = { x: 0, y: 0 };

  constructor() {
    super({ key: 'HexMapScene' });
  }

  create(): void {
    this.graphics = this.add.graphics();

    // Center camera offset
    this.cameraOffset = {
      x: this.scale.width / 2,
      y: this.scale.height / 2,
    };

    // Pan with drag
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.isDragging = true;
      this.dragStart = { x: pointer.x - this.cameraOffset.x, y: pointer.y - this.cameraOffset.y };
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging) {
        this.cameraOffset.x = pointer.x - this.dragStart.x;
        this.cameraOffset.y = pointer.y - this.dragStart.y;
      }
    });

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (!this.isDragging) return;
      this.isDragging = false;

      // If minimal drag, treat as click
      const dx = Math.abs(pointer.x - (this.dragStart.x + this.cameraOffset.x));
      const dy = Math.abs(pointer.y - (this.dragStart.y + this.cameraOffset.y));
      if (dx < 5 && dy < 5) {
        this.handleTileClick(pointer.x, pointer.y);
      }
    });

    // Subscribe to store changes
    useGameStore.subscribe(() => this.renderCurrentMap());
    this.renderCurrentMap();
  }

  private renderCurrentMap(): void {
    const { map } = useGameStore.getState();
    renderMap(this.graphics, map, this.cameraOffset.x, this.cameraOffset.y);
  }

  update(): void {
    this.renderCurrentMap();
  }

  private handleTileClick(screenX: number, screenY: number): void {
    const worldX = screenX - this.cameraOffset.x;
    const worldY = screenY - this.cameraOffset.y;
    const coord = pixelToHex(worldX, worldY, HEX_SIZE);

    const state = useGameStore.getState();
    const tile = state.map.find(t =>
      t.coord.q === coord.q && t.coord.r === coord.r && t.coord.s === coord.s
    );

    if (tile) {
      // Emit tile selection for React UI to handle
      window.dispatchEvent(new CustomEvent('tile-selected', { detail: { tile, coord } }));
    }
  }
}
```

- [ ] **Step 4: Create PhaserGame React component**

Create `src/game/PhaserGame.tsx`:

```tsx
import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { createGameConfig } from './config';

export function PhaserGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const config = createGameConfig('phaser-container');
    gameRef.current = new Phaser.Game(config);

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <div
      id="phaser-container"
      ref={containerRef}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
    />
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add Phaser hex map rendering with pan and tile click"
```

---

### Task 14: React UI Components

**Files:**
- Create: `src/ui/HUD.tsx`, `src/ui/EventCard.tsx`, `src/ui/TechTree.tsx`, `src/ui/ArmyPanel.tsx`, `src/ui/BuildMenu.tsx`, `src/ui/GameOver.tsx`, `src/App.tsx`

- [ ] **Step 1: Create HUD component**

Create `src/ui/HUD.tsx`:

```tsx
import React from 'react';
import { useGameStore } from '@/store/gameStore';

const styles: Record<string, React.CSSProperties> = {
  hud: {
    position: 'absolute', top: 0, left: 0, right: 0,
    padding: '8px 16px', background: 'rgba(0,0,0,0.8)',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    fontSize: 14, zIndex: 10, color: '#eee',
  },
  resources: { display: 'flex', gap: 16 },
  res: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center' },
  label: { fontSize: 10, color: '#999', textTransform: 'uppercase' as const },
  val: { fontSize: 16, fontWeight: 'bold' },
  info: { display: 'flex', gap: 16, alignItems: 'center' },
};

export function HUD() {
  const { age, turn, actionPoints, resources, phase } = useGameStore();

  return (
    <div style={styles.hud}>
      <div style={styles.resources}>
        {Object.entries(resources).map(([key, val]) => (
          <div key={key} style={styles.res}>
            <span style={styles.label}>{key}</span>
            <span style={styles.val}>{val}</span>
          </div>
        ))}
      </div>
      <div style={styles.info}>
        <span>{age.toUpperCase()} AGE</span>
        <span>Turn {turn}</span>
        <span>AP: {actionPoints}</span>
        <span style={{ color: '#999' }}>{phase}</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create EventCard component**

Create `src/ui/EventCard.tsx`:

```tsx
import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { GameEvent, EventChoice } from '@/types/events';
import { isChoiceAvailable, interpolateText } from '@/logic/eventEngine';

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.7)', display: 'flex',
    justifyContent: 'center', alignItems: 'center', zIndex: 20,
  },
  card: {
    background: '#1a1a2e', borderRadius: 12, padding: 24, maxWidth: 500,
    width: '90%', border: '1px solid #333',
  },
  text: { fontSize: 16, lineHeight: 1.6, marginBottom: 20, color: '#ddd' },
  choice: {
    padding: '12px 16px', marginBottom: 8, borderRadius: 8,
    border: '1px solid #444', cursor: 'pointer', color: '#eee',
    background: '#252540', transition: 'background 0.2s',
  },
  disabled: { opacity: 0.4, cursor: 'not-allowed', background: '#1a1a2e' },
  req: { fontSize: 11, color: '#ff6b6b', marginTop: 4 },
};

interface Props {
  event: GameEvent;
  onChoice: (choice: EventChoice) => void;
}

export function EventCard({ event, onChoice }: Props) {
  const state = useGameStore();
  const text = interpolateText(event.text, state);

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.text}>{text}</div>
        {event.choices.map(choice => {
          const available = isChoiceAvailable(choice, state);
          return (
            <div
              key={choice.id}
              style={{ ...styles.choice, ...(available ? {} : styles.disabled) }}
              onClick={() => available && onChoice(choice)}
            >
              {choice.text}
              {!available && (
                <div style={styles.req}>
                  {choice.requires.identity && Object.entries(choice.requires.identity).map(([k, v]) =>
                    `Requires ${k} ≥ ${v}`
                  ).join(', ')}
                  {choice.requires.armyStats && Object.entries(choice.requires.armyStats).map(([k, v]) =>
                    `Requires ${k} ≥ ${v}`
                  ).join(', ')}
                  {choice.requires.leaderTraits?.map(t => `Requires trait: ${t}`).join(', ')}
                  {choice.requires.civTags?.map(t => `Requires: ${t}`).join(', ')}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create TechTree component**

Create `src/ui/TechTree.tsx`:

```tsx
import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { canResearch } from '@/logic/techEngine';
import { TechNode } from '@/types/game';

const styles: Record<string, React.CSSProperties> = {
  panel: {
    position: 'absolute', right: 0, top: 60, bottom: 60,
    width: 250, background: 'rgba(0,0,0,0.85)', padding: 16,
    overflowY: 'auto', zIndex: 10, borderLeft: '1px solid #333',
  },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  tech: {
    padding: '8px 12px', marginBottom: 6, borderRadius: 6,
    border: '1px solid #444', fontSize: 13,
  },
  researched: { background: '#1a3a1a', borderColor: '#4caf50' },
  available: { background: '#2a2a4a', cursor: 'pointer', borderColor: '#6a6aff' },
  locked: { background: '#1a1a1a', opacity: 0.5 },
};

interface Props {
  onResearch: (techId: string) => void;
}

export function TechTree({ onResearch }: Props) {
  const { techs, resources } = useGameStore();

  return (
    <div style={styles.panel}>
      <div style={styles.title}>Research</div>
      {techs.map(tech => {
        const available = canResearch(tech.id, techs, resources);
        const style = tech.researched
          ? { ...styles.tech, ...styles.researched }
          : available
            ? { ...styles.tech, ...styles.available }
            : { ...styles.tech, ...styles.locked };

        return (
          <div
            key={tech.id}
            style={style}
            onClick={() => available && onResearch(tech.id)}
          >
            <div>{tech.name}</div>
            <div style={{ fontSize: 11, color: '#999' }}>
              {tech.researched ? '✓ Researched' : `Cost: ${tech.cost} knowledge`}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Create ArmyPanel component**

Create `src/ui/ArmyPanel.tsx`:

```tsx
import React from 'react';
import { useGameStore } from '@/store/gameStore';

const styles: Record<string, React.CSSProperties> = {
  panel: {
    position: 'absolute', left: 0, bottom: 0,
    background: 'rgba(0,0,0,0.85)', padding: 12,
    borderRadius: '0 8px 0 0', zIndex: 10, fontSize: 12,
    border: '1px solid #333', borderLeft: 'none', borderBottom: 'none',
  },
  title: { fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  stat: { display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 2 },
};

export function ArmyPanel() {
  const { army } = useGameStore();

  return (
    <div style={styles.panel}>
      <div style={styles.title}>Army</div>
      {Object.entries(army).map(([key, val]) => (
        <div key={key} style={styles.stat}>
          <span style={{ color: '#999' }}>{key}</span>
          <span>{val}</span>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Create BuildMenu component**

Create `src/ui/BuildMenu.tsx`:

```tsx
import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { BUILDINGS } from '@/data/buildings';
import { Tile } from '@/types/map';
import { Resources } from '@/types/game';

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.6)', display: 'flex',
    justifyContent: 'center', alignItems: 'center', zIndex: 20,
  },
  menu: {
    background: '#1a1a2e', borderRadius: 12, padding: 20,
    maxWidth: 400, width: '90%', border: '1px solid #333',
  },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  item: {
    padding: '10px 14px', marginBottom: 6, borderRadius: 6,
    border: '1px solid #444', cursor: 'pointer', background: '#252540',
  },
  disabled: { opacity: 0.4, cursor: 'not-allowed' },
};

interface Props {
  tile: Tile;
  onBuild: (buildingId: string) => void;
  onClose: () => void;
}

function canAfford(cost: Partial<Resources>, resources: Resources): boolean {
  return Object.entries(cost).every(([k, v]) =>
    !v || resources[k as keyof Resources] >= v
  );
}

export function BuildMenu({ tile, onBuild, onClose }: Props) {
  const { resources, age } = useGameStore();
  const available = BUILDINGS.filter(b => {
    if (!b.requiredTile || b.requiredTile.includes(tile.type)) return true;
    return false;
  });

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.menu} onClick={e => e.stopPropagation()}>
        <div style={styles.title}>Build on {tile.type}</div>
        {available.map(b => {
          const affordable = canAfford(b.cost, resources);
          return (
            <div
              key={b.id}
              style={{ ...styles.item, ...(affordable ? {} : styles.disabled) }}
              onClick={() => affordable && onBuild(b.id)}
            >
              <div>{b.name}</div>
              <div style={{ fontSize: 11, color: '#999' }}>
                Cost: {Object.entries(b.cost).map(([k, v]) => `${v} ${k}`).join(', ') || 'Free'}
                {' | '}
                Produces: {Object.entries(b.produces).map(([k, v]) => `+${v} ${k}`).join(', ') || 'None'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create GameOver component**

Create `src/ui/GameOver.tsx`:

```tsx
import React from 'react';
import { useGameStore } from '@/store/gameStore';

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.85)', display: 'flex',
    justifyContent: 'center', alignItems: 'center', zIndex: 30,
  },
  card: {
    background: '#1a1a2e', borderRadius: 12, padding: 32,
    maxWidth: 400, width: '90%', textAlign: 'center',
    border: '1px solid #333',
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  reason: { fontSize: 16, color: '#999', marginBottom: 24 },
  btn: {
    padding: '12px 24px', borderRadius: 8, border: 'none',
    background: '#4a4a8a', color: '#eee', fontSize: 16, cursor: 'pointer',
  },
};

export function GameOver() {
  const { gameOver, resetRun, civ, age, turn } = useGameStore();
  if (!gameOver) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={{ ...styles.title, color: gameOver.victory ? '#4caf50' : '#ff4444' }}>
          {gameOver.victory ? 'Victory!' : 'Civilization Collapsed'}
        </div>
        <div style={styles.reason}>{gameOver.reason}</div>
        <div style={{ marginBottom: 16, fontSize: 13, color: '#888' }}>
          <div>Age: {age} | Turn: {turn}</div>
          <div>Leaders: {civ.leaders.map(l => l.name).join(' → ')}</div>
          <div>Tags: {civ.tags.join(', ') || 'None'}</div>
        </div>
        <button style={styles.btn} onClick={resetRun}>New Run</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Create App.tsx (main orchestrator)**

Create `src/App.tsx`:

```tsx
import React, { useEffect, useState, useCallback } from 'react';
import { PhaserGame } from '@/game/PhaserGame';
import { HUD } from '@/ui/HUD';
import { EventCard } from '@/ui/EventCard';
import { TechTree } from '@/ui/TechTree';
import { ArmyPanel } from '@/ui/ArmyPanel';
import { BuildMenu } from '@/ui/BuildMenu';
import { GameOver } from '@/ui/GameOver';
import { useGameStore } from '@/store/gameStore';
import { Tile } from '@/types/map';
import { GameEvent, EventChoice } from '@/types/events';
import { STONE_AGE_EVENTS } from '@/data/events/stoneAge';
import { stoneAgeTechs } from '@/data/techs/stoneAge';
import { getAvailableEvents, pickRandomEvent, resolveOutcome } from '@/logic/eventEngine';
import { processCollectPhase, processExploreAction, processBuildAction } from '@/logic/turnEngine';
import { researchTech } from '@/logic/techEngine';
import { resolveCombat } from '@/logic/combatEngine';
import { processRivalTurn } from '@/logic/rivalEngine';
import { transitionAge } from '@/logic/ageEngine';
import { generateMap } from '@/logic/mapGenerator';
import { createRival } from '@/logic/rivalEngine';

function mulberry32(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function App() {
  const store = useGameStore();
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [activeEvent, setActiveEvent] = useState<GameEvent | null>(null);
  const [showTech, setShowTech] = useState(false);
  const [showBuild, setShowBuild] = useState(false);
  const randRef = React.useRef(mulberry32(Date.now()));
  const rand = randRef.current;

  // Initialize game on first mount
  useEffect(() => {
    if (store.map.length === 0) {
      const seed = Date.now();
      const map = generateMap({ targetTiles: 15, seed });
      const techs = stoneAgeTechs();
      // Place a rival
      const farTile = map.find(t => !t.controlled && !t.visible && t.type !== 'water');
      const rivals = farTile ? [createRival('stone', farTile.coord, mulberry32(seed + 1))] : [];
      if (farTile && rivals[0]) {
        const rivalTile = map.find(t =>
          t.coord.q === farTile.coord.q && t.coord.r === farTile.coord.r
        );
        if (rivalTile) rivalTile.rivalId = rivals[0].id;
      }
      store.setState({ map, techs, rivals });
      store.addLeader({ name: 'Kara', traits: ['Bold'] });
    }
  }, []);

  // Listen for tile selection from Phaser
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setSelectedTile(detail.tile);
    };
    window.addEventListener('tile-selected', handler);
    return () => window.removeEventListener('tile-selected', handler);
  }, []);

  // Process phases
  useEffect(() => {
    if (store.phase === 'collect') {
      const updates = processCollectPhase(store);
      store.setState(updates);
      if (!updates.gameOver) store.nextPhase(); // → actions
    } else if (store.phase === 'event') {
      const available = getAvailableEvents(STONE_AGE_EVENTS, store);
      const event = pickRandomEvent(available, rand);
      if (event) {
        setActiveEvent(event);
        store.setState({ currentEvent: event.id });
      } else {
        store.nextPhase(); // skip to enemy
      }
    } else if (store.phase === 'enemy') {
      const result = processRivalTurn(store, rand);
      store.setState(result);
      store.nextPhase(); // → collect (new turn)
    }
  }, [store.phase, store.turn]);

  const handleExplore = useCallback((tile: Tile) => {
    if (store.phase !== 'actions' || store.actionPoints <= 0) return;
    const updates = processExploreAction(store, tile.coord);
    store.setState(updates);
    store.spendActionPoint();
  }, [store.phase, store.actionPoints]);

  const handleBuild = useCallback((buildingId: string) => {
    if (!selectedTile || store.phase !== 'actions' || store.actionPoints <= 0) return;
    const updates = processBuildAction(store, selectedTile.coord, buildingId);
    store.setState(updates);
    store.spendActionPoint();
    setShowBuild(false);
    setSelectedTile(null);
  }, [selectedTile, store.phase, store.actionPoints]);

  const handleResearch = useCallback((techId: string) => {
    if (store.phase !== 'actions' || store.actionPoints <= 0) return;
    const { techs, effects } = researchTech(techId, store.techs);
    store.setState({ techs });
    store.updateResources({ knowledge: -store.techs.find(t => t.id === techId)!.cost });
    if (effects.resourceBonuses) store.updateResources(effects.resourceBonuses);
    if (effects.armyBonuses) store.updateArmy(effects.armyBonuses);
    if (effects.addsCivTag) store.addCivTag(effects.addsCivTag);
    if (effects.addsLeaderTrait) store.addLeaderTrait(effects.addsLeaderTrait);
    if (effects.isAdvance) {
      const newState = transitionAge(store, Date.now());
      store.setState(newState);
    }
    store.spendActionPoint();
  }, [store.phase, store.actionPoints]);

  const handleEventChoice = useCallback((choice: EventChoice) => {
    if (choice.effects.resources) store.updateResources(choice.effects.resources);
    if (choice.effects.identity) store.updateIdentity(choice.effects.identity);
    if (choice.effects.army) store.updateArmy(choice.effects.army);
    if (choice.effects.flags) {
      for (const [k, v] of Object.entries(choice.effects.flags)) store.setFlag(k, v);
    }
    if (choice.effects.addCivTag) store.addCivTag(choice.effects.addCivTag);
    if (choice.effects.addLeaderTrait) store.addLeaderTrait(choice.effects.addLeaderTrait);

    if (choice.effects.outcomes) {
      const outcome = resolveOutcome(choice.effects.outcomes, rand);
      if (outcome.flags) {
        for (const [k, v] of Object.entries(outcome.flags)) store.setFlag(k, v);
      }
      if (outcome.combat) {
        const result = resolveCombat(store.army, outcome.combat, rand);
        store.updateArmy({ numbers: -result.numbersLost });
      }
    }

    setActiveEvent(null);
    store.setState({ currentEvent: null });
    store.nextPhase(); // → enemy
  }, []);

  const handleEndTurn = useCallback(() => {
    if (store.phase === 'actions') {
      store.nextPhase(); // → event
    }
  }, [store.phase]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <PhaserGame />
      <HUD />
      <ArmyPanel />

      {/* Action buttons */}
      {store.phase === 'actions' && (
        <div style={{
          position: 'absolute', bottom: 16, right: 16, zIndex: 10,
          display: 'flex', gap: 8,
        }}>
          {selectedTile && !selectedTile.controlled && selectedTile.visible && (
            <button
              style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#4a8a4a', color: '#fff', cursor: 'pointer' }}
              onClick={() => handleExplore(selectedTile)}
            >
              Explore
            </button>
          )}
          {selectedTile && selectedTile.controlled && !selectedTile.building && (
            <button
              style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#4a4a8a', color: '#fff', cursor: 'pointer' }}
              onClick={() => setShowBuild(true)}
            >
              Build
            </button>
          )}
          <button
            style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#6a4a8a', color: '#fff', cursor: 'pointer' }}
            onClick={() => setShowTech(!showTech)}
          >
            Research
          </button>
          <button
            style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#8a4a4a', color: '#fff', cursor: 'pointer' }}
            onClick={handleEndTurn}
          >
            End Turn
          </button>
        </div>
      )}

      {showTech && <TechTree onResearch={handleResearch} />}
      {showBuild && selectedTile && (
        <BuildMenu tile={selectedTile} onBuild={handleBuild} onClose={() => setShowBuild(false)} />
      )}
      {activeEvent && <EventCard event={activeEvent} onChoice={handleEventChoice} />}
      <GameOver />
    </div>
  );
}
```

- [ ] **Step 8: Update src/main.tsx to use App**

Update `src/main.tsx`:

```tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')!).render(<App />);
```

- [ ] **Step 9: Verify the app compiles and renders**

Run: `npx vite`
Expected: App opens in browser showing hex map with HUD, clickable tiles, and action buttons

- [ ] **Step 10: Commit**

```bash
git add -A && git commit -m "feat: add React UI layer with HUD, event cards, tech tree, and build menu"
```

---

### Task 15: Integration Test — Full Turn Cycle

- [ ] **Step 1: Run all tests**

Run: `npx vitest run`
Expected: All tests pass

- [ ] **Step 2: Manual smoke test**

Open the app in browser and verify:
1. Hex map renders with colored tiles and fog of war
2. Clicking a tile shows Explore/Build buttons
3. Exploring reveals adjacent tiles
4. Building deducts resources and shows on tile
5. Research panel shows tech tree
6. End Turn advances phases
7. Events fire and present choices
8. Game over triggers when population hits 0

- [ ] **Step 3: Final commit**

```bash
git add -A && git commit -m "feat: complete vertical slice — playable Stone Age with all core systems"
```
