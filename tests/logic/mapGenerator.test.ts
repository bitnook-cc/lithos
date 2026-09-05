import { describe, it, expect } from 'vitest';
import { generateMap } from '@/logic/mapGenerator';
import { hexNeighbors } from '@/game/hex/hexUtils';
import { ensureRiverConnections } from '@/logic/riverEngine';

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
    expect(tiles.filter(t => !t.visible).length).toBeGreaterThan(0);
  });
  it('generates different maps with different seeds', () => {
    const a = generateMap({ targetTiles: 15, seed: 1 });
    const b = generateMap({ targetTiles: 15, seed: 2 });
    expect(a.map(t => t.type).join(',')).not.toBe(b.map(t => t.type).join(','));
  });
  it('all tiles have valid cube coordinates (q + r + s = 0)', () => {
    const tiles = generateMap({ targetTiles: 20, seed: 42 });
    for (const tile of tiles) { expect(tile.coord.q + tile.coord.r + tile.coord.s).toBe(0); }
  });
  it('origin neighbors are visible (initial reveal radius)', () => {
    const tiles = generateMap({ targetTiles: 15, seed: 42 });
    expect(tiles.filter(t => t.visible).length).toBeGreaterThanOrEqual(4);
  });
  it('builds a layered classical world with landmarks, routes, and strategic texture', () => {
    const tiles = generateMap({ targetTiles: 91, seed: 90210, age: 'classical' });
    expect(tiles).toHaveLength(91);
    expect(new Set(tiles.map(tile => tile.type)).size).toBeGreaterThanOrEqual(4);
    expect(tiles.filter(tile => tile.landmark)).toHaveLength(7);
    expect(tiles.some(tile => tile.feature)).toBe(true);
    expect(tiles.some(tile => tile.resource)).toBe(true);
    expect(tiles.some(tile => tile.river)).toBe(true);
    expect(tiles.some(tile => tile.road)).toBe(true);
  });

  it('is deterministic for a given world seed', () => {
    const first = generateMap({ targetTiles: 61, seed: 1357, age: 'bronze' });
    const second = generateMap({ targetTiles: 61, seed: 1357, age: 'bronze' });
    expect(second).toEqual(first);
  });
  it('begins with only the capital surveyed, controlled, and worked', () => {
    const tiles = generateMap({ targetTiles: 37, seed: 81, age: 'stone' });
    const origin = tiles[0];
    expect(origin.surveyed).toBe(true);
    expect(origin.controlled).toBe(true);
    expect(origin.worked).toBe(true);
    expect(tiles.filter(tile => tile.surveyed)).toHaveLength(1);
  });
  it('generates rivers as reciprocal non-branching paths without intersections or loops', () => {
    const tiles = generateMap({ targetTiles: 91, seed: 90210, age: 'classical' });
    const key = (coord: { q: number; r: number; s: number }) => `${coord.q},${coord.r},${coord.s}`;
    const byKey = new Map(tiles.map(tile => [key(tile.coord), tile]));
    const riverTiles = tiles.filter(tile => tile.riverEdges.length > 0);
    expect(riverTiles.length).toBeGreaterThan(2);
    for (const tile of riverTiles) {
      expect(new Set(tile.riverEdges).size).toBe(tile.riverEdges.length);
      expect(tile.riverEdges.length).toBeLessThanOrEqual(2);
      for (const direction of tile.riverEdges) {
        const neighbor = byKey.get(key(hexNeighbors(tile.coord)[direction]));
        expect(neighbor?.riverEdges).toContain((direction + 3) % 6);
      }
    }
    const remaining = new Set(riverTiles.map(tile => key(tile.coord)));
    while (remaining.size) {
      const component = new Set<string>();
      const stack = [remaining.values().next().value as string];
      while (stack.length) {
        const currentKey = stack.pop()!;
        if (component.has(currentKey)) continue;
        component.add(currentKey);
        remaining.delete(currentKey);
        const tile = byKey.get(currentKey)!;
        for (const direction of tile.riverEdges) stack.push(key(hexNeighbors(tile.coord)[direction]));
      }
      const degrees = [...component].map(item => byKey.get(item)!.riverEdges.length);
      expect(degrees.reduce((sum, degree) => sum + degree, 0) / 2).toBe(component.size - 1);
      expect(degrees.filter(degree => degree === 1)).toHaveLength(2);
    }
  });

  it('migrates a legacy star-shaped river into degree-two paths', () => {
    const tiles = generateMap({ targetTiles: 37, seed: 77, age: 'stone' }).map(tile => ({ ...tile, river: false, riverEdges: [] }));
    const center = tiles.find(tile => tile.coord.q === 0 && tile.coord.r === 0)!;
    center.river = true;
    for (const coord of hexNeighbors(center.coord).slice(0, 4)) tiles.find(tile => tile.coord.q === coord.q && tile.coord.r === coord.r)!.river = true;
    const migrated = ensureRiverConnections(tiles);
    expect(migrated.every(tile => tile.riverEdges.length <= 2)).toBe(true);
    expect(migrated.find(tile => tile.coord.q === 0 && tile.coord.r === 0)!.riverEdges.length).toBeLessThanOrEqual(2);
  });
});
