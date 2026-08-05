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
  return coords.map(coord => ({ coord, elevation: elevations.get(keyOf(coord)) ?? 0.5, moisture: moisture.get(keyOf(coord)) ?? 0.5 }));
}

function classify(cell: ClimateCell, radius: number, rand: () => number): TileType {
  const latitude = radius ? Math.abs(cell.coord.r + cell.coord.q * 0.45) / radius : 0;
  const { elevation, moisture } = cell;
  if (elevation < 0.29) return latitude > 0.78 ? 'ice' : 'water';
  if (elevation > 0.79) return 'mountain';
  if (latitude > 0.84 && elevation > 0.42) return 'snow';
  if (elevation > 0.67) return 'hills';
  if (moisture < 0.25) return 'desert';
  if (moisture > 0.76 && elevation < 0.47) return 'swamp';
  if (moisture > 0.7 && latitude < 0.58) return 'rainforest';
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
  const sources = tiles.filter(tile => tile.elevation > 0.61 && !isWater(tile.type)).sort((a, b) => b.elevation - a.elevation);
  for (let riverIndex = 0; riverIndex < count && sources.length; riverIndex++) {
    let current = sources.splice(Math.floor(rand() * Math.min(sources.length, 8)), 1)[0];
    const visited = new Set<string>();
    for (let step = 0; step < 10; step++) {
      if (visited.has(keyOf(current.coord))) break;
      visited.add(keyOf(current.coord));
      current.river = true;
      const options = hexNeighbors(current.coord).map(coord => byKey.get(keyOf(coord))).filter((tile): tile is Tile => Boolean(tile) && !visited.has(keyOf(tile!.coord)));
      if (!options.length || isWater(current.type)) break;
      options.sort((a, b) => (a.elevation + (rand() * 0.08)) - (b.elevation + (rand() * 0.08)));
      current = options[0];
      if (isWater(current.type)) { current.river = true; break; }
    }
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
    rivalId: null,
    feature: null,
    resource: null,
    landmark: null,
    landmarkInvestigated: false,
    river: false,
    road: false,
  }));

  // The capital and its first ring always form a playable land foothold.
  for (const tile of tiles) {
    const distance = hexDistance(origin, tile.coord);
    if (distance === 0) { tile.type = 'fertile'; tile.elevation = 0.52; tile.moisture = 0.55; }
    else if (distance === 1 && isWater(tile.type)) { tile.type = tile.moisture > 0.6 ? 'forest' : 'plains'; tile.elevation = 0.48; }
  }

  addRivers(tiles, Math.max(1, Math.floor(radius / 2)), rand);

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
