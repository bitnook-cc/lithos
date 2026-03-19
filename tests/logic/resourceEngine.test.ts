import { describe, it, expect } from 'vitest';
import { calculateCollection } from '@/logic/resourceEngine';
import { Resources } from '@/types/game';
import { Tile } from '@/types/map';

function makeTile(overrides: Partial<Tile> = {}): Tile {
  return { coord: { q: 0, r: 0, s: 0 }, type: 'plains', visible: true, controlled: true, building: null, rivalId: null, ...overrides };
}

const baseResources: Resources = { food: 0, materials: 0, wealth: 0, knowledge: 0, influence: 0, population: 5 };

describe('calculateCollection', () => {
  it('returns food from controlled plains tile', () => {
    const result = calculateCollection({ map: [makeTile()], resources: baseResources, effects: [] });
    expect(result.food).toBe(1); // plains yields +1 food
  });

  it('controlled tile yields resources based on type', () => {
    const result = calculateCollection({ map: [makeTile({ type: 'forest' })], resources: baseResources, effects: [] });
    expect(result.food).toBe(1); // forest food
    expect(result.materials).toBe(1); // forest materials
  });

  it('fertile tile gives bonus food', () => {
    const result = calculateCollection({ map: [makeTile({ type: 'fertile' })], resources: baseResources, effects: [] });
    expect(result.food).toBe(2); // fertile +2
  });

  it('mountain tile gives materials', () => {
    const result = calculateCollection({ map: [makeTile({ type: 'mountain' })], resources: baseResources, effects: [] });
    expect(result.materials).toBe(2);
  });

  it('desert tile gives nothing', () => {
    const result = calculateCollection({ map: [makeTile({ type: 'desert' })], resources: baseResources, effects: [] });
    expect(result.food).toBe(0);
    expect(result.materials).toBe(0);
  });

  it('ruins give knowledge', () => {
    const result = calculateCollection({ map: [makeTile({ type: 'ruins' })], resources: baseResources, effects: [] });
    expect(result.knowledge).toBe(1);
  });

  it('adds building production on top of tile yield', () => {
    // plains (+1 food) + gathering_site (+2 food) = 3
    const result = calculateCollection({ map: [makeTile({ building: 'gathering_site' })], resources: baseResources, effects: [] });
    expect(result.food).toBe(3);
  });

  it('ignores uncontrolled tiles entirely', () => {
    const result = calculateCollection({ map: [makeTile({ building: 'gathering_site', controlled: false })], resources: baseResources, effects: [] });
    expect(result.food).toBe(0);
    expect(result.materials).toBe(0);
  });

  it('does not include population in delta', () => {
    const result = calculateCollection({ map: [makeTile()], resources: baseResources, effects: [] });
    expect(result.population).toBeUndefined();
  });
});
