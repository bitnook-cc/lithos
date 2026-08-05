import { describe, it, expect } from 'vitest';
import { processCollectPhase, processSurveyAction, processExpandAction, processBuildAction, processInvestigateAction, growthThreshold } from '@/logic/turnEngine';
import { GameState } from '@/types/game';
import { Tile } from '@/types/map';
import { stoneAgeTechs } from '@/data/techs/stoneAge';

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    age: 'stone', turn: 1, actionPoints: 3, maxActionPoints: 3, exploration: 1,
    resources: { food: 10, materials: 5, wealth: 0, knowledge: 0, influence: 0, population: 3 },
    army: { strength: 3, toughness: 2, speed: 2, stealth: 1, morale: 3, numbers: 5 },
    civ: { identity: { military: 0, economy: 0, knowledge: 0 }, tags: [], leaders: [{ name: 'Kara', traits: [] }] },
    map: [
      { coord: { q: 0, r: 0, s: 0 }, type: 'plains', elevation: 0.5, moisture: 0.5, feature: null, resource: null, landmark: null, landmarkInvestigated: false, river: false, road: false, visible: true, surveyed: true, controlled: true, worked: true, building: 'hearthstone', rivalId: null },
      { coord: { q: 1, r: 0, s: -1 }, type: 'fertile', elevation: 0.5, moisture: 0.5, feature: null, resource: null, landmark: null, landmarkInvestigated: false, river: false, road: false, visible: true, surveyed: true, controlled: true, worked: true, building: 'gathering_site', rivalId: null },
      { coord: { q: -1, r: 0, s: 1 }, type: 'plains', elevation: 0.5, moisture: 0.5, feature: null, resource: null, landmark: null, landmarkInvestigated: false, river: false, road: false, visible: true, surveyed: true, controlled: true, worked: true, building: null, rivalId: null },
      { coord: { q: 1, r: -1, s: 0 }, type: 'forest', elevation: 0.5, moisture: 0.5, feature: null, resource: null, landmark: null, landmarkInvestigated: false, river: false, road: false, visible: true, surveyed: false, controlled: false, worked: false, building: null, rivalId: null },
      { coord: { q: 0, r: -1, s: 1 }, type: 'mountain', elevation: 0.5, moisture: 0.5, feature: null, resource: null, landmark: null, landmarkInvestigated: false, river: false, road: false, visible: false, surveyed: false, controlled: false, worked: false, building: null, rivalId: null },
    ],
    rivals: [], techs: stoneAgeTechs().map(tech => tech.id === 'survival' ? { ...tech, researched: true } : tech), permanentEffects: [], flags: {}, phase: 'actions', currentEvent: null, eventOrigin: null, gameOver: null, activeResearch: null, researchProgress: 0, growthProgress: 0, firedEvents: [], activePerks: [], featsEarned: [], chronicle: [], stats: { choicesMade: 0, tilesExplored: 0, tilesExpanded: 0, buildingsBuilt: 0, rivalsDefeated: 0, agesCompleted: 0, landmarksDiscovered: 0 }, runRecorded: false,
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
        map: [{ coord: { q: 0, r: 0, s: 0 }, type: 'desert', elevation: 0.5, moisture: 0.5, feature: null, resource: null, landmark: null, landmarkInvestigated: false, river: false, road: false, visible: true, surveyed: true, controlled: true, worked: true, building: null, rivalId: null }],
      });
      // No food production, pop 5 needs 5 food, but only 0 available
      const result = processCollectPhase(state);
      expect(result.resources!.population).toBe(4);
    });

    it('triggers game over when last pop dies', () => {
      const state = makeState({
        resources: { food: 0, materials: 0, wealth: 0, knowledge: 0, influence: 0, population: 1 },
        map: [{ coord: { q: 0, r: 0, s: 0 }, type: 'desert', elevation: 0.5, moisture: 0.5, feature: null, resource: null, landmark: null, landmarkInvestigated: false, river: false, road: false, visible: true, surveyed: true, controlled: true, worked: true, building: null, rivalId: null }],
      });
      const result = processCollectPhase(state);
      expect(result.gameOver).toBeTruthy();
    });

    it('makes outer territory dormant when population cannot staff every tile', () => {
      const state = makeState({ resources: { food: 10, materials: 5, wealth: 0, knowledge: 0, influence: 0, population: 2 } });
      state.map = state.map.map(tile => tile.controlled ? { ...tile, type: 'desert', building: null } : tile);
      const result = processCollectPhase(state);
      expect(result.map?.filter(tile => tile.worked)).toHaveLength(2);
      expect(result.map?.filter(tile => tile.controlled && !tile.worked)).toHaveLength(1);
    });

    it('carries over surplus growth', () => {
      // Pop 1, threshold 1, growthProgress 0, surplus = 3 → grow to 2, carry over 2
      const state = makeState({
        resources: { food: 10, materials: 5, wealth: 0, knowledge: 0, influence: 0, population: 1 },
        map: [
          { coord: { q: 0, r: 0, s: 0 }, type: 'fertile', elevation: 0.5, moisture: 0.5, feature: null, resource: null, landmark: null, landmarkInvestigated: false, river: false, road: false, visible: true, surveyed: true, controlled: true, worked: true, building: 'gathering_site', rivalId: null },
        ],
        growthProgress: 0,
      });
      const result = processCollectPhase(state);
      expect(result.resources!.population).toBe(2);
      expect(result.growthProgress).toBeGreaterThan(0); // surplus carried over
    });
  });

  describe('survey and expansion', () => {
    it('surveys a frontier tile and reveals nearby country without claiming it', () => {
      const state = makeState();
      const frontier = state.map.find(tile => tile.type === 'forest')!;
      const hidden = state.map.find(tile => !tile.visible)!;
      const result = processSurveyAction(state, frontier.coord);
      const surveyed = result.map!.find(tile => tile.coord.q === frontier.coord.q && tile.coord.r === frontier.coord.r)!;
      const revealed = result.map!.find(tile => tile.coord.q === hidden.coord.q && tile.coord.r === hidden.coord.r)!;
      expect(surveyed.surveyed).toBe(true);
      expect(surveyed.controlled).toBe(false);
      expect(revealed.visible).toBe(true);
    });

    it('reveals a wider area when exploration improves', () => {
      const state = makeState({ permanentEffects: [{ type: 'exploration_bonus', amount: 1 }] });
      state.map.push({ ...state.map[4], coord: { q: 3, r: -3, s: 0 }, visible: false });
      const frontier = state.map.find(tile => tile.type === 'forest')!;
      const result = processSurveyAction(state, frontier.coord);
      expect(result.map?.find(tile => tile.coord.q === 3)?.visible).toBe(true);
    });

    it('expands into surveyed land and reserves one available person', () => {
      const state = makeState({ resources: { food: 10, materials: 5, wealth: 0, knowledge: 0, influence: 0, population: 4 } });
      const frontier = state.map.find(tile => tile.type === 'forest')!;
      frontier.surveyed = true;
      const result = processExpandAction(state, frontier.coord);
      const expanded = result.map!.find(tile => tile.coord.q === frontier.coord.q && tile.coord.r === frontier.coord.r)!;
      expect(expanded.controlled).toBe(true);
      expect(expanded.worked).toBe(true);
      expect(result.stats?.tilesExpanded).toBe(1);
    });

    it('refuses expansion when every person is already reserved', () => {
      const state = makeState();
      const frontier = state.map.find(tile => tile.type === 'forest')!;
      frontier.surveyed = true;
      expect(processExpandAction(state, frontier.coord)).toEqual({});
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
  describe('processInvestigateAction', () => {
    it('marks the landmark known and opens its discovery event without ending the turn', () => {
      const state = makeState();
      state.map[0].landmark = 'painted_vault';
      const result = processInvestigateAction(state, state.map[0].coord);
      expect(result.map?.[0].landmarkInvestigated).toBe(true);
      expect(result.currentEvent).toBe('landmark_painted_vault');
      expect(result.eventOrigin).toBe('discovery');
      expect(result.phase).toBe('event');
      expect(result.stats?.landmarksDiscovered).toBe(1);
    });

    it('does not investigate an uncontrolled landmark', () => {
      const state = makeState();
      state.map[3].landmark = 'jungle_temple';
      expect(processInvestigateAction(state, state.map[3].coord)).toEqual({});
    });
  });
});
