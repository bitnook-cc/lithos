import { describe, it, expect } from 'vitest';
import { processCollectPhase, processExploreAction, processBuildAction, growthThreshold } from '@/logic/turnEngine';
import { GameState } from '@/types/game';
import { Tile } from '@/types/map';

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    age: 'stone', turn: 1, actionPoints: 3, maxActionPoints: 3,
    resources: { food: 10, materials: 5, wealth: 0, knowledge: 0, influence: 0, population: 3 },
    army: { strength: 3, toughness: 2, speed: 2, stealth: 1, morale: 3, numbers: 5 },
    civ: { identity: { military: 0, economy: 0, knowledge: 0 }, tags: [], leaders: [{ name: 'Kara', traits: [] }] },
    map: [
      { coord: { q: 0, r: 0, s: 0 }, type: 'plains', visible: true, controlled: true, building: 'hearthstone', rivalId: null },
      { coord: { q: 1, r: 0, s: -1 }, type: 'fertile', visible: true, controlled: true, building: 'gathering_site', rivalId: null },
      { coord: { q: -1, r: 0, s: 1 }, type: 'plains', visible: true, controlled: true, building: null, rivalId: null },
      { coord: { q: 1, r: -1, s: 0 }, type: 'forest', visible: true, controlled: false, building: null, rivalId: null },
      { coord: { q: 0, r: 1, s: -1 }, type: 'mountain', visible: false, controlled: false, building: null, rivalId: null },
    ],
    rivals: [], techs: [], flags: {}, phase: 'actions', currentEvent: null, gameOver: null, activeResearch: null, researchProgress: 0, growthProgress: 0, firedEvents: [],
    ...overrides,
  };
}

describe('turnEngine', () => {
  describe('growthThreshold', () => {
    it('follows fibonacci sequence', () => {
      expect(growthThreshold(1)).toBe(1);
      expect(growthThreshold(2)).toBe(1);
      expect(growthThreshold(3)).toBe(2);
      expect(growthThreshold(4)).toBe(3);
      expect(growthThreshold(5)).toBe(5);
    });
  });

  describe('processCollectPhase', () => {
    it('food production adds to stockpile', () => {
      const state = makeState();
      const result = processCollectPhase(state);
      // hearthstone (+1 food) + plains (+1) + fertile (+2) + gathering_site (+2) = 6 food produced
      // population consumes 3 food, so net +3 food
      expect(result.resources!.food).toBeGreaterThan(state.resources.food);
    });

    it('population grows when food surplus fills the growth meter', () => {
      // Pop 1, threshold = 1. With surplus food, should grow.
      const state = makeState({
        resources: { food: 10, materials: 5, wealth: 0, knowledge: 0, influence: 0, population: 1 },
        growthProgress: 0,
      });
      const result = processCollectPhase(state);
      // With pop 1 consuming 1 food and producing 6+, surplus is 5+
      // Threshold for pop 1→2 is 1, so should grow
      expect(result.resources!.population).toBe(2);
    });

    it('starvation kills 1 pop when food runs out', () => {
      const state = makeState({
        resources: { food: 0, materials: 5, wealth: 0, knowledge: 0, influence: 0, population: 5 },
        map: [{ coord: { q: 0, r: 0, s: 0 }, type: 'desert', visible: true, controlled: true, building: null, rivalId: null }],
      });
      // No food production, pop 5 needs 5 food, but only 0 available
      const result = processCollectPhase(state);
      expect(result.resources!.population).toBe(4);
    });

    it('triggers game over when last pop dies', () => {
      const state = makeState({
        resources: { food: 0, materials: 0, wealth: 0, knowledge: 0, influence: 0, population: 1 },
        map: [{ coord: { q: 0, r: 0, s: 0 }, type: 'desert', visible: true, controlled: true, building: null, rivalId: null }],
      });
      const result = processCollectPhase(state);
      expect(result.gameOver).toBeTruthy();
    });

    it('carries over surplus growth', () => {
      // Pop 1, threshold 1, growthProgress 0, surplus = 3 → grow to 2, carry over 2
      const state = makeState({
        resources: { food: 10, materials: 5, wealth: 0, knowledge: 0, influence: 0, population: 1 },
        map: [
          { coord: { q: 0, r: 0, s: 0 }, type: 'fertile', visible: true, controlled: true, building: 'gathering_site', rivalId: null },
        ],
        growthProgress: 0,
      });
      const result = processCollectPhase(state);
      expect(result.resources!.population).toBe(2);
      expect(result.growthProgress).toBeGreaterThan(0); // surplus carried over
    });
  });

  describe('processExploreAction', () => {
    it('reveals hidden tiles adjacent to controlled territory', () => {
      const state = makeState();
      const hidden = state.map.find(t => !t.visible)!;
      const result = processExploreAction(state, hidden.coord);
      const tile = result.map!.find(t => t.coord.q === hidden.coord.q && t.coord.r === hidden.coord.r);
      expect(tile!.visible).toBe(true);
    });

    it('claims the explored tile', () => {
      const state = makeState();
      const target = state.map.find(t => t.type === 'forest' && !t.controlled)!;
      const result = processExploreAction(state, target.coord);
      const tile = result.map!.find(t => t.coord.q === target.coord.q);
      expect(tile!.controlled).toBe(true);
    });
  });

  describe('processBuildAction', () => {
    it('places a building on a controlled tile', () => {
      const state = makeState();
      const target = state.map.find(t => t.controlled && !t.building)!;
      const result = processBuildAction(state, target.coord, 'gathering_site');
      const tile = result.map!.find(t => t.coord.q === target.coord.q);
      expect(tile!.building).toBe('gathering_site');
    });

    it('deducts building cost from resources', () => {
      const state = makeState();
      const target = state.map.find(t => t.controlled && !t.building)!;
      const result = processBuildAction(state, target.coord, 'gathering_site');
      expect(result.resources!.materials).toBeLessThan(state.resources.materials);
    });
  });
});
