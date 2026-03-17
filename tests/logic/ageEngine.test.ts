import { describe, it, expect } from 'vitest';
import { transitionAge } from '@/logic/ageEngine';
import { GameState } from '@/types/game';

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    age: 'stone', turn: 10, actionPoints: 0, maxActionPoints: 3,
    resources: { food: 20, materials: 15, wealth: 0, knowledge: 0, influence: 0, population: 10 },
    army: { strength: 5, toughness: 3, speed: 2, stealth: 1, range: 0, morale: 5, numbers: 8 },
    civ: {
      identity: { military: 10, economy: 5, knowledge: 15 },
      tags: ['Beast Slayers'],
      leaders: [{ name: 'Kara', traits: ['Bold'] }],
    },
    map: [
      { coord: { q: 0, r: 0, s: 0 }, type: 'plains', visible: true, controlled: true, building: 'camp', rivalId: null },
    ],
    rivals: [], techs: [], flags: { shared_hunting_grounds: true },
    phase: 'ageTransition', currentEvent: null, gameOver: null,
    ...overrides,
  };
}

describe('ageEngine', () => {
  describe('transitionAge', () => {
    it('advances to the next age', () => {
      const result = transitionAge(makeState(), 42);
      expect(result.age).toBe('bronze');
    });

    it('resets turn counter', () => {
      const result = transitionAge(makeState(), 42);
      expect(result.turn).toBe(1);
    });

    it('preserves cultural identity', () => {
      const state = makeState();
      const result = transitionAge(state, 42);
      expect(result.civ.identity).toEqual(state.civ.identity);
    });

    it('preserves civ tags', () => {
      const state = makeState();
      const result = transitionAge(state, 42);
      expect(result.civ.tags).toContain('Beast Slayers');
    });

    it('preserves flags', () => {
      const result = transitionAge(makeState(), 42);
      expect(result.flags.shared_hunting_grounds).toBe(true);
    });

    it('generates new map', () => {
      const result = transitionAge(makeState(), 42);
      expect(result.map.length).toBeGreaterThan(1);
    });

    it('adds a new leader', () => {
      const state = makeState();
      const result = transitionAge(state, 42);
      expect(result.civ.leaders.length).toBe(2);
    });
  });
});
