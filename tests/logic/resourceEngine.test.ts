import { describe, it, expect } from 'vitest';
import { calculateCollection } from '@/logic/resourceEngine';
import { Resources } from '@/types/game';
import { Tile } from '@/types/map';

function makeTile(overrides: Partial<Tile> = {}): Tile {
  return { coord: { q: 0, r: 0, s: 0 }, type: 'plains', visible: true, controlled: true, building: null, rivalId: null, ...overrides };
}

const baseResources: Resources = { food: 0, materials: 0, wealth: 0, knowledge: 0, influence: 0, population: 5 };

describe('calculateCollection', () => {
  it('returns base food from population', () => {
    // pop 5 => floor(5/2) = 2 foraging, plus 1 from controlled plains tile = 3
    const result = calculateCollection({ map: [makeTile()], resources: baseResources, techs: [] });
    expect(result.food).toBe(3);
  });

  it('controlled tile yields resources based on type', () => {
    const result = calculateCollection({ map: [makeTile({ type: 'forest' })], resources: baseResources, techs: [] });
    expect(result.food).toBeGreaterThanOrEqual(3); // foraging + forest food
    expect(result.materials).toBeGreaterThanOrEqual(1); // forest materials
  });

  it('fertile tile gives bonus food', () => {
    const result = calculateCollection({ map: [makeTile({ type: 'fertile' })], resources: baseResources, techs: [] });
    expect(result.food).toBe(4); // foraging 2 + fertile 2
  });

  it('mountain tile gives materials', () => {
    const result = calculateCollection({ map: [makeTile({ type: 'mountain' })], resources: baseResources, techs: [] });
    expect(result.materials).toBe(2);
  });

  it('desert tile gives nothing', () => {
    const result = calculateCollection({ map: [makeTile({ type: 'desert' })], resources: baseResources, techs: [] });
    expect(result.food).toBe(2); // just foraging, no tile yield
    expect(result.materials).toBe(0);
  });

  it('ruins give knowledge', () => {
    const result = calculateCollection({ map: [makeTile({ type: 'ruins' })], resources: baseResources, techs: [] });
    expect(result.knowledge).toBe(1);
  });

  it('adds building production on top of tile yield', () => {
    // plains (+1 food) + gathering_site (+2 food) + foraging (2) = 5
    const result = calculateCollection({ map: [makeTile({ building: 'gathering_site' })], resources: baseResources, techs: [] });
    expect(result.food).toBe(5);
  });

  it('ignores uncontrolled tiles entirely', () => {
    const result = calculateCollection({ map: [makeTile({ building: 'gathering_site', controlled: false })], resources: baseResources, techs: [] });
    expect(result.food).toBe(2); // just foraging
    expect(result.materials).toBe(0);
  });
});
