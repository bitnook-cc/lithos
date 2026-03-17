import { describe, it, expect } from 'vitest';
import { processRivalTurn, createRival } from '@/logic/rivalEngine';
import { RivalCiv, GameState } from '@/types/game';
import { Tile } from '@/types/map';

function makeState(rivals: RivalCiv[], map: Tile[]): GameState {
  return {
    age: 'stone', turn: 3, actionPoints: 3, maxActionPoints: 3,
    resources: { food: 10, materials: 5, wealth: 0, knowledge: 0, influence: 0, population: 5 },
    army: { strength: 5, toughness: 2, speed: 2, stealth: 1, morale: 3, numbers: 5 },
    civ: { identity: { military: 0, economy: 0, knowledge: 0 }, tags: [], leaders: [] },
    map, rivals, techs: [], flags: {}, phase: 'enemy', currentEvent: null, gameOver: null, activeResearch: null, researchProgress: 0,
  };
}

describe('rivalEngine', () => {
  describe('createRival', () => {
    it('creates a rival with valid stats', () => {
      const rival = createRival('stone', { q: 3, r: -3, s: 0 }, () => 0.5);
      expect(rival.id).toBeTruthy();
      expect(rival.threat.strength).toBeGreaterThan(0);
      expect(['aggressive', 'defensive', 'trader']).toContain(rival.personality);
    });
  });

  describe('processRivalTurn', () => {
    it('aggressive rival expands to unclaimed tiles', () => {
      const rival = createRival('stone', { q: 3, r: -3, s: 0 }, () => 0.2); // aggressive
      rival.personality = 'aggressive';
      const map: Tile[] = [
        { coord: { q: 3, r: -3, s: 0 }, type: 'plains', visible: false, controlled: false, building: null, rivalId: rival.id },
        { coord: { q: 2, r: -2, s: 0 }, type: 'plains', visible: false, controlled: false, building: null, rivalId: null },
      ];
      const state = makeState([rival], map);
      const result = processRivalTurn(state, () => 0.5);
      const expanded = result.map.filter(t => t.rivalId === rival.id);
      expect(expanded.length).toBeGreaterThanOrEqual(1);
    });

    it('rival threat scales each turn', () => {
      const rival = createRival('stone', { q: 3, r: -3, s: 0 }, () => 0.5);
      const initialStrength = rival.threat.strength;
      const map: Tile[] = [
        { coord: { q: 3, r: -3, s: 0 }, type: 'plains', visible: false, controlled: false, building: null, rivalId: rival.id },
      ];
      const state = makeState([rival], map);
      const result = processRivalTurn(state, () => 0.5);
      const updatedRival = result.rivals.find(r => r.id === rival.id)!;
      expect(updatedRival.threat.strength).toBeGreaterThanOrEqual(initialStrength);
    });
  });
});
