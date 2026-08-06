import { describe, expect, it } from 'vitest';
import { generateSettlementName } from '@/data/settlementNames';
import { createNewRun } from '@/logic/runEngine';

describe('settlement names', () => {
  it('is deterministic for the same world seed', () => {
    expect(generateSettlementName('stone', 42)).toBe(generateSettlementName('stone', 42));
  });

  it('varies names across world seeds and never uses the building type as the name', () => {
    const names = new Set(Array.from({ length: 30 }, (_, seed) => generateSettlementName('stone', seed)));
    expect(names.size).toBeGreaterThan(8);
    expect(names.has('Hearthstone')).toBe(false);
  });

  it('assigns the generated name to the starting settlement', () => {
    const state = createNewRun([], 4815);
    const capital = state.map.find(tile => tile.coord.q === 0 && tile.coord.r === 0)!;
    expect(capital.settlementName).toBe(generateSettlementName('stone', 4815));
    expect(capital.building).toBe('hearthstone');
  });
});
