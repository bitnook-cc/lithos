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
});
