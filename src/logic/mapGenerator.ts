import { Tile, TileType, HexCoord } from '@/types/map';
import { createHex, hexNeighbors, hexDistance } from '@/game/hex/hexUtils';

interface MapGenOptions { targetTiles: number; seed: number; }

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
  { type: 'plains', weight: 30 }, { type: 'forest', weight: 25 },
  { type: 'mountain', weight: 15 }, { type: 'water', weight: 10 },
  { type: 'desert', weight: 8 }, { type: 'fertile', weight: 7 },
  { type: 'ruins', weight: 3 }, { type: 'special', weight: 2 },
];

function pickTileType(rand: () => number): TileType {
  const total = TILE_WEIGHTS.reduce((s, w) => s + w.weight, 0);
  let roll = rand() * total;
  for (const { type, weight } of TILE_WEIGHTS) { roll -= weight; if (roll <= 0) return type; }
  return 'plains';
}

const hexKey = (c: HexCoord) => `${c.q},${c.r}`;

export function generateMap(options: MapGenOptions): Tile[] {
  const { targetTiles, seed } = options;
  const rand = mulberry32(seed);
  const tileMap = new Map<string, Tile>();
  const origin = createHex(0, 0);
  tileMap.set(hexKey(origin), {
    coord: origin, type: 'plains', visible: true, controlled: true, building: null, rivalId: null,
  });
  const frontier: HexCoord[] = [...hexNeighbors(origin)];
  while (tileMap.size < targetTiles && frontier.length > 0) {
    const idx = Math.floor(rand() * frontier.length);
    const coord = frontier[idx];
    frontier.splice(idx, 1);
    const key = hexKey(coord);
    if (tileMap.has(key)) continue;
    tileMap.set(key, { coord, type: pickTileType(rand), visible: false, controlled: false, building: null, rivalId: null });
    for (const n of hexNeighbors(coord)) { if (!tileMap.has(hexKey(n))) frontier.push(n); }
  }
  const tiles = Array.from(tileMap.values());
  for (const tile of tiles) { if (hexDistance(origin, tile.coord) <= 1) tile.visible = true; }
  return tiles;
}
