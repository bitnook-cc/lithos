import { describe, it, expect } from 'vitest';
import { transitionAge } from '@/logic/ageEngine';
import { GameState } from '@/types/game';

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    age: 'stone', turn: 10, actionPoints: 0, maxActionPoints: 3, exploration: 1,
    resources: { food: 20, materials: 15, wealth: 0, knowledge: 0, influence: 0, population: 10 },
    army: { strength: 5, toughness: 3, speed: 2, stealth: 1, morale: 5, numbers: 8 },
    civ: {
      identity: { military: 10, economy: 5, knowledge: 15 },
      tags: ['Beast Slayers'],
      leaders: [{ name: 'Kara', traits: ['Bold'] }],
    },
    map: [
      { coord: { q: 0, r: 0, s: 0 }, type: 'plains', elevation: 0.5, moisture: 0.5, feature: null, resource: null, landmark: null, landmarkInvestigated: false, river: false, road: false, visible: true, surveyed: true, controlled: true, worked: true, building: 'camp', rivalId: null },
    ],
    rivals: [], techs: [], permanentEffects: [], flags: { shared_hunting_grounds: true },
    phase: 'ageTransition', currentEvent: null, eventOrigin: null, gameOver: null, activeResearch: null, researchProgress: 0, growthProgress: 0, firedEvents: [], activePerks: [], featsEarned: [], chronicle: [], stats: { choicesMade: 0, tilesExplored: 0, tilesExpanded: 0, buildingsBuilt: 0, rivalsDefeated: 0, agesCompleted: 0, landmarksDiscovered: 0 }, runRecorded: false,
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


    it('produces a choice-shaped ending after Classical', () => {
      const result = transitionAge(makeState({ age: 'classical', flags: { legacy_wisdom: true } }), 42);
      expect(result.gameOver?.victory).toBe(true);
      expect(result.gameOver?.reason).toContain('schools');
    });

    it('adds a new leader', () => {
      const state = makeState();
      const result = transitionAge(state, 42);
      expect(result.civ.leaders.length).toBe(2);
    });
  });
});
