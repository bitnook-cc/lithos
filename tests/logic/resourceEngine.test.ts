import { describe, it, expect } from 'vitest';
import { calculateCollection } from '@/logic/resourceEngine';
import { Resources } from '@/types/game';
import { Tile } from '@/types/map';

function makeTile(overrides: Partial<Tile> = {}): Tile {
  return { coord: { q: 0, r: 0, s: 0 }, type: 'plains', visible: true, controlled: true, building: null, rivalId: null, ...overrides };
}

describe('calculateCollection', () => {
  it('returns base food from population', () => {
    const result = calculateCollection({ map: [makeTile()], resources: { food: 0, materials: 0, wealth: 0, knowledge: 0, influence: 0, population: 5 }, techs: [] });
    expect(result.food).toBeGreaterThanOrEqual(2);
  });
  it('adds building production from controlled tiles', () => {
    const result = calculateCollection({ map: [makeTile({ building: 'gathering_site' })], resources: { food: 0, materials: 0, wealth: 0, knowledge: 0, influence: 0, population: 5 }, techs: [] });
    expect(result.food).toBeGreaterThanOrEqual(4);
  });
  it('ignores buildings on uncontrolled tiles', () => {
    const result = calculateCollection({ map: [makeTile({ building: 'gathering_site', controlled: false })], resources: { food: 0, materials: 0, wealth: 0, knowledge: 0, influence: 0, population: 5 }, techs: [] });
    expect(result.food).toBe(2);
  });
});
