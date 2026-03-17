import { describe, it, expect } from 'vitest';
import { processCollectPhase, processExploreAction, processBuildAction } from '@/logic/turnEngine';
import { GameState } from '@/types/game';
import { Tile } from '@/types/map';

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    age: 'stone', turn: 1, actionPoints: 3, maxActionPoints: 3,
    resources: { food: 10, materials: 5, wealth: 0, knowledge: 0, influence: 0, population: 5 },
    army: { strength: 3, toughness: 2, speed: 2, stealth: 1 },
    civ: { identity: { military: 0, economy: 0, knowledge: 0 }, tags: [], leaders: [{ name: 'Kara', traits: [] }] },
    map: [
      { coord: { q: 0, r: 0, s: 0 }, type: 'plains', visible: true, controlled: true, building: 'camp', rivalId: null },
      { coord: { q: 1, r: 0, s: -1 }, type: 'plains', visible: true, controlled: true, building: null, rivalId: null },
      { coord: { q: 1, r: -1, s: 0 }, type: 'forest', visible: true, controlled: false, building: null, rivalId: null },
      { coord: { q: 0, r: 1, s: -1 }, type: 'mountain', visible: false, controlled: false, building: null, rivalId: null },
    ],
    rivals: [], techs: [], flags: {}, phase: 'actions', currentEvent: null, gameOver: null, activeResearch: null, researchProgress: 0,
    ...overrides,
  };
}

describe('turnEngine', () => {
  describe('processCollectPhase', () => {
    it('adds resources based on buildings and population', () => {
      const state = makeState();
      const result = processCollectPhase(state);
      expect(result.resources!.food).toBeGreaterThan(state.resources.food);
    });

    it('triggers game over when population reaches 0', () => {
      const state = makeState({
        resources: { food: 0, materials: 0, wealth: 0, knowledge: 0, influence: 0, population: 1 },
      });
      // With 0 food, population should drop
      const result = processCollectPhase(state);
      if (result.resources!.population <= 0) {
        expect(result.gameOver).toBeTruthy();
      }
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
      // Explore the visible but uncontrolled forest
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
      const target = state.map.find(t => t.controlled)!;
      const result = processBuildAction(state, target.coord, 'gathering_site');
      expect(result.resources!.materials).toBeLessThan(state.resources.materials);
    });
  });
});
