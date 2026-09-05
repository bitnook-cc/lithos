import { AgeId } from '@/types/game';
import { HexCoord, LandmarkId, MapFeatureId, ResourceNodeId, Tile, TileType } from '@/types/map';
import { LANDMARKS, MAP_FEATURES, RESOURCE_NODES } from '@/data/mapFeatures';
import { createHex, hexDistance, hexNeighbors } from '@/game/hex/hexUtils';
import { mulberry32 } from './random';

interface MapGenOptions { targetTiles: number; seed: number; age?: AgeId; }
interface ClimateCell { coord: HexCoord; elevation: number; moisture: number; }

const keyOf = (coord: HexCoord) => `${coord.q},${coord.r}`;
const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const isWater = (type: TileType) => type === 'water' || type === 'ice';

function createDisc(targetTiles: number, rand: () => number): HexCoord[] {
  let radius = 0;
  while (1 + 3 * radius * (radius + 1) < targetTiles) radius += 1;
  const all: HexCoord[] = [];
  for (let q = -radius; q <= radius; q++) {
    for (let r = Math.max(-radius, -q - radius); r <= Math.min(radius, -q + radius); r++) all.push(createHex(q, r));
  }
  const jitter = new Map(all.map(coord => [keyOf(coord), rand()]));
  return all.sort((a, b) => hexDistance(createHex(0, 0), a) - hexDistance(createHex(0, 0), b) || (jitter.get(keyOf(a)) ?? 0) - (jitter.get(keyOf(b)) ?? 0)).slice(0, targetTiles);
}

function smoothClimate(coords: HexCoord[], rand: () => number): ClimateCell[] {
  const elevations = new Map<string, number>();
  const moisture = new Map<string, number>();
  for (const coord of coords) {
    const continental = 0.54 - hexDistance(createHex(0, 0), coord) * 0.035;
    elevations.set(keyOf(coord), clamp01(continental + (rand() - 0.5) * 0.9));
    moisture.set(keyOf(coord), rand());
  }
  for (let pass = 0; pass < 3; pass++) {
    const nextE = new Map<string, number>();
    const nextM = new Map<string, number>();
    for (const coord of coords) {
      const neighbors = hexNeighbors(coord).filter(next => elevations.has(keyOf(next)));
      const avgE = neighbors.reduce((sum, next) => sum + (elevations.get(keyOf(next)) ?? 0), 0) / Math.max(1, neighbors.length);
      const avgM = neighbors.reduce((sum, next) => sum + (moisture.get(keyOf(next)) ?? 0), 0) / Math.max(1, neighbors.length);
      nextE.set(keyOf(coord), clamp01((elevations.get(keyOf(coord)) ?? 0) * 0.58 + avgE * 0.42));
      nextM.set(keyOf(coord), clamp01((moisture.get(keyOf(coord)) ?? 0) * 0.55 + avgM * 0.45));
    }
    for (const [key, value] of nextE) elevations.set(key, value);
    for (const [key, value] of nextM) moisture.set(key, value);
  }
  // Smoothing must not erase the climate extremes that support whole building paths.
  return coords.map(coord => ({ coord, elevation: clamp01(0.5 + ((elevations.get(keyOf(coord)) ?? 0.5) - 0.5) * 1.8), moisture: clamp01(0.5 + ((moisture.get(keyOf(coord)) ?? 0.5) - 0.5) * 2.2) }));
}

function classify(cell: ClimateCell, radius: number, rand: () => number): TileType {
  const latitude = radius ? Math.abs(cell.coord.r + cell.coord.q * 0.45) / radius : 0;
  const { elevation, moisture } = cell;
  if (elevation < 0.29) return latitude > 0.78 ? 'ice' : 'water';
  if (elevation > 0.68) return 'mountain';
  if (latitude > 0.84 && elevation > 0.42) return 'snow';
  if (elevation > 0.56) return 'hills';
  if (moisture < 0.25) return 'desert';
  if (moisture > 0.66 && elevation < 0.47) return 'swamp';
  if (moisture > 0.64 && latitude < 0.58) return 'rainforest';
  if (moisture > 0.57) return 'forest';
  if (moisture > 0.42 && elevation < 0.53) return 'fertile';
  if (rand() < 0.045) return 'ruins';
  return 'plains';
}

function chooseCompatible<T extends { id: string; terrains: TileType[] }>(values: T[], terrain: TileType, rand: () => number): T | null {
  const eligible = values.filter(value => value.terrains.includes(terrain));
  return eligible.length ? eligible[Math.floor(rand() * eligible.length)] : null;
}

function addRivers(tiles: Tile[], count: number, rand: () => number) {
  const byKey = new Map(tiles.map(tile => [keyOf(tile.coord), tile]));
  const occupied = new Set<string>();
  const boundary = (tile: Tile) => hexNeighbors(tile.coord).some(coord => !byKey.has(keyOf(coord)));
  const sources = tiles
    .filter(tile => !isWater(tile.type) && tile.elevation > 0.56)
    .sort((a, b) => b.elevation - a.elevation);
  let placed = 0;
  let attempts = 0;

  while (placed < count && sources.length && attempts < tiles.length * 2) {
    attempts += 1;
    const sourceIndex = Math.floor(rand() * Math.min(8, sources.length));
    const source = sources.splice(sourceIndex, 1)[0];
    if (occupied.has(keyOf(source.coord)) || hexNeighbors(source.coord).some(coord => occupied.has(keyOf(coord)))) continue;

    const path: Tile[] = [source];
    const visited = new Set([keyOf(source.coord)]);
    let current = source;
    for (let step = 0; step < 14; step++) {
      if (isWater(current.type) && path.length > 1) break;
      const candidates = hexNeighbors(current.coord)
        .map(coord => byKey.get(keyOf(coord)))
        .filter((tile): tile is Tile => Boolean(tile) && !visited.has(keyOf(tile!.coord)) && !occupied.has(keyOf(tile!.coord)))
        .filter(tile => hexNeighbors(tile.coord).every(coord => {
          const key = keyOf(coord);
          return key === keyOf(current.coord) || (!visited.has(key) && !occupied.has(key));
        }));
      if (!candidates.length) break;
      const downhill = candidates.filter(tile => tile.elevation <= current.elevation + 0.065);
      const pool = downhill.length ? downhill : candidates;
      const scored = pool.map(tile => ({
        tile,
        score: tile.elevation + Math.max(0, tile.elevation - current.elevation) * 2.5
          - (isWater(tile.type) ? 2 : 0)
          - (boundary(tile) && path.length >= 3 ? 0.42 : 0)
          + rand() * 0.12,
      })).sort((a, b) => a.score - b.score);
      current = scored[0].tile;
      path.push(current);
      visited.add(keyOf(current.coord));
      if (isWater(current.type) || (boundary(current) && path.length >= 4)) break;
    }

    if (path.length < 3) continue;
    for (let index = 0; index < path.length - 1; index++) {
      const from = path[index];
      const to = path[index + 1];
      const direction = hexNeighbors(from.coord).findIndex(coord => keyOf(coord) === keyOf(to.coord));
      if (direction < 0) continue;
      from.riverEdges.push(direction);
      to.riverEdges.push((direction + 3) % 6);
    }
    for (const tile of path) {
      tile.river = tile.riverEdges.length > 0;
      occupied.add(keyOf(tile.coord));
    }
    placed += 1;
  }
}

function addRoad(tiles: Tile[], destination: Tile) {
  const byKey = new Map(tiles.map(tile => [keyOf(tile.coord), tile]));
  const origin = createHex(0, 0);
  let current = byKey.get(keyOf(origin));
  const visited = new Set<string>();
  while (current && hexDistance(current.coord, destination.coord) > 0) {
    current.road = true;
    visited.add(keyOf(current.coord));
    const next = hexNeighbors(current.coord)
      .map(coord => byKey.get(keyOf(coord)))
      .filter((tile): tile is Tile => Boolean(tile) && !isWater(tile!.type) && !visited.has(keyOf(tile!.coord)))
      .sort((a, b) => hexDistance(a.coord, destination.coord) - hexDistance(b.coord, destination.coord))[0];
    if (!next) break;
    current = next;
  }
  if (current) current.road = true;
}

export function generateMap(options: MapGenOptions): Tile[] {
  const { targetTiles, seed, age = 'stone' } = options;
  const rand = mulberry32(seed);
  const origin = createHex(0, 0);
  const coords = createDisc(targetTiles, rand);
  const radius = Math.max(...coords.map(coord => hexDistance(origin, coord)));
  const climate = smoothClimate(coords, rand);
  const tiles: Tile[] = climate.map(cell => ({
    coord: cell.coord,
    type: classify(cell, radius, rand),
    elevation: cell.elevation,
    moisture: cell.moisture,
    visible: hexDistance(origin, cell.coord) <= 1,
    surveyed: hexDistance(origin, cell.coord) === 0,
    controlled: hexDistance(origin, cell.coord) === 0,
    worked: hexDistance(origin, cell.coord) === 0,
    building: null,
    settlementName: null,
    rivalId: null,
    feature: null,
    resource: null,
    landmark: null,
    landmarkInvestigated: false,
    river: false,
    riverEdges: [],
    road: false,
  }));

  // The capital and its first ring always form a playable land foothold.
  for (const tile of tiles) {
    const distance = hexDistance(origin, tile.coord);
    if (distance === 0) { tile.type = 'fertile'; tile.elevation = 0.52; tile.moisture = 0.55; }
    else if (distance === 1 && isWater(tile.type)) { tile.type = tile.moisture > 0.6 ? 'forest' : 'plains'; tile.elevation = 0.48; }
  }

  const ring = tiles.filter(t => hexDistance(origin, t.coord) === 1);
  if (ring.length && !ring.some(t => t.type === 'fertile' || t.type === 'forest')) ring[0].type = 'forest';
  // Guarantee basic strategic alternatives, not every specialty on every map.
  const outer = tiles.filter(t => hexDistance(origin, t.coord) > 1);
  if (outer.length > 2) {
    if (!tiles.some(t => t.type === 'mountain')) [...outer].sort((a, b) => b.elevation - a.elevation)[0].type = 'mountain';
    if (!tiles.some(t => t.type === 'water')) [...outer].sort((a, b) => a.elevation - b.elevation)[0].type = 'water';
  }
  addRivers(tiles, Math.max(2, Math.ceil(radius / 2)), rand);

  const featureDefs = Object.values(MAP_FEATURES);
  const resourceDefs = Object.values(RESOURCE_NODES);
  for (const tile of tiles) {
    if (hexDistance(origin, tile.coord) === 0) continue;
    if (rand() < 0.32) tile.feature = chooseCompatible(featureDefs, tile.type, rand)?.id as MapFeatureId ?? null;
    const resourceChance = age === 'stone' ? 0.22 : 0.3;
    if (rand() < resourceChance) tile.resource = chooseCompatible(resourceDefs, tile.type, rand)?.id as ResourceNodeId ?? null;
  }

  const landmarkDefs = Object.values(LANDMARKS).filter(landmark => landmark.ages.includes(age));
  const landmarkCount = Math.min(landmarkDefs.length, Math.max(3, Math.round(targetTiles / 14)));
  const shuffledDefs = [...landmarkDefs].sort(() => rand() - 0.5);
  const candidates = tiles
    .filter(tile => hexDistance(origin, tile.coord) > 1)
    .sort((a, b) => hexDistance(origin, b.coord) - hexDistance(origin, a.coord) || rand() - 0.5);
  let placedLandmarks = 0;
  for (const definition of shuffledDefs) {
    if (placedLandmarks >= landmarkCount) break;
    const index = candidates.findIndex(tile => definition.terrains.includes(tile.type) && !tile.landmark);
    if (index < 0) continue;
    const tile = candidates.splice(index, 1)[0];
    tile.landmark = definition.id as LandmarkId;
    tile.feature = null;
    placedLandmarks += 1;
  }

  if (age !== 'stone') {
    for (const destination of tiles.filter(tile => tile.landmark).slice(0, age === 'classical' ? 3 : 2)) addRoad(tiles, destination);
  }
  return tiles;
}
