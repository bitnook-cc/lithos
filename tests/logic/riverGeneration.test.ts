import { describe, expect, it } from 'vitest';
import { generateMap } from '@/logic/mapGenerator';
import { classifyWaterBodies, generateRivers, isRiverWater, riverKey } from '@/logic/riverGeneration';
import { buildRiverCurves, riverPaths } from '@/game/hex/riverGeometry';
import { createHex, hexNeighbors } from '@/game/hex/hexUtils';
import { createNewRun } from '@/logic/runEngine';
import { transitionAge } from '@/logic/ageEngine';
import { decodeRun, encodeRun } from '@/store/runSave';
import { Tile } from '@/types/map';

function checkDrainage(tiles: Tile[]) {
  const paths = riverPaths(tiles);
  expect(paths.flat().length).toBe(tiles.filter(tile => tile.river).length);
  for (const path of paths) {
    expect(['hills', 'mountain']).toContain(path[0].type);
    expect(isRiverWater(path[path.length - 1])).toBe(true);
    expect(path[path.length - 1].riverDownstream).toBeNull();
    expect(['lake', 'ocean']).toContain(path[path.length - 1].waterBody);
    expect(new Set(path.map(riverKey)).size).toBe(path.length);
    path.forEach((tile, i) => {
      expect(tile.riverEdges.length).toBe(i === 0 || i === path.length - 1 ? 1 : 2);
      if (i === path.length - 1) return;
      const next = path[i + 1], coord = hexNeighbors(tile.coord)[tile.riverDownstream!];
      expect(coord).toEqual(next.coord);
      expect(next.elevation).toBeLessThan(tile.elevation);
      expect(next.riverEdges).toContain((tile.riverDownstream! + 3) % 6);
    });
  }
  return paths;
}

describe('complete river drainage', () => {
  it('routes to water without uphill flow or loops over 300 seeded worlds', () => {
    let populated = 0;
    for (const targetTiles of [37, 61, 91]) for (let seed = 1; seed <= 100; seed++) {
      const tiles = generateMap({ targetTiles, seed });
      if (checkDrainage(tiles).length) populated++;
      expect(tiles.filter(tile => tile.visible).every(tile => !isRiverWater(tile))).toBe(true);
    }
    expect(populated).toBeGreaterThanOrEqual(285);
  });

  it('retains complete old routes and their geometry inputs through both age transitions', () => {
    for (let seed = 1; seed <= 30; seed++) {
      let state = createNewRun([], seed, true);
      checkDrainage(state.map);
      for (const nextSeed of [seed + 100, seed + 200]) {
        const before = structuredClone(state);
        const next = transitionAge(state, nextSeed);
        checkDrainage(next.map);
        const beforeCurves = buildRiverCurves(state.map, 36);
        const afterCurves = buildRiverCurves(next.map, 36);
        for (const old of state.map) {
          const tile = next.map.find(tile => riverKey(tile) === riverKey(old))!;
          expect(tile).toBeDefined();
          expect([tile.type, tile.elevation, tile.riverEdges, tile.riverDownstream, tile.waterBody])
            .toEqual([old.type, old.elevation, old.riverEdges, old.riverDownstream, old.waterBody]);
          expect(afterCurves.filter(curve => curve.tileKey === riverKey(old)))
            .toEqual(beforeCurves.filter(curve => curve.tileKey === riverKey(old)));
        }
        expect(state).toEqual(before);
        state = next;
      }
    }
  });

  it('round-trips new metadata and leaves legacy terrain and edges untouched', () => {
    const run = createNewRun([], 42);
    expect(decodeRun(encodeRun(run)).map).toEqual(run.map);
    run.map.forEach(tile => { delete tile.riverDownstream; delete tile.waterBody; });
    expect(decodeRun(encodeRun(run)).map).toEqual(run.map);
  });

  it('distinguishes inland lakes from boundary oceans', () => {
    const tiles = generateMap({ targetTiles: 37, seed: 42 }).map(tile => ({ ...tile, type: 'plains' as const, waterBody: undefined })) as Tile[];
    tiles.find(tile => tile.coord.q === 0 && tile.coord.r === 0)!.type = 'water';
    tiles.find(tile => tile.coord.q === 3 && tile.coord.r === 0)!.type = 'water';
    classifyWaterBodies(tiles);
    expect(tiles.find(tile => tile.coord.q === 0 && tile.coord.r === 0)!.waterBody).toBe('lake');
    expect(tiles.find(tile => tile.coord.q === 3 && tile.coord.r === 0)!.waterBody).toBe('ocean');
  });

  it('cuts a shallow outlet but rejects dry dead ends and deep trenches', () => {
    const template = generateMap({ targetTiles: 37, seed: 42 })[0];
    const channel = (ridge: number): Tile[] => [0.72, 0.45, ridge, 0.22].map((elevation, i) => ({
      ...template, coord: createHex(i + 2, 0), type: i === 0 ? 'mountain' : i === 3 ? 'water' : 'plains',
      elevation, river: false, riverEdges: [], riverDownstream: undefined,
    }));
    const tiles = channel(0.49);
    classifyWaterBodies(tiles); generateRivers(tiles, 1, () => 0.5);
    expect(checkDrainage(tiles)).toHaveLength(1);
    expect(tiles[2].elevation).toBeLessThan(tiles[1].elevation);
    const blocked = channel(0.9);
    generateRivers(blocked, 1, () => 0.5);
    expect(blocked.some(tile => tile.river)).toBe(false);
    const dry = channel(0.49).slice(0, 3);
    generateRivers(dry, 1, () => 0.5);
    expect(dry.some(tile => tile.river)).toBe(false);
  });
});
