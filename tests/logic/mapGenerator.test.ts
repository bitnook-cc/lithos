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
    expect(tiles.filter(tile => tile.landmark)).toHaveLength(6);
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
});
