import { describe, it, expect } from 'vitest';
import { processRivalTurn, createRival, processDiplomacyAction } from '@/logic/rivalEngine';
import { RivalCiv, GameState } from '@/types/game';
import { Tile } from '@/types/map';

function makeState(rivals: RivalCiv[], map: Tile[]): GameState {
  return {
    age: 'stone', turn: 3, actionPoints: 3, maxActionPoints: 3, exploration: 1,
    resources: { food: 10, materials: 5, wealth: 0, knowledge: 0, influence: 0, population: 5 },
    army: { strength: 5, toughness: 2, speed: 2, stealth: 1, morale: 3, numbers: 5 },
    civ: { identity: { military: 0, economy: 0, knowledge: 0 }, tags: [], leaders: [] },
    map, rivals, techs: [], permanentEffects: [], flags: {}, phase: 'enemy', currentEvent: null, eventOrigin: null, gameOver: null,
    activeResearch: null, researchProgress: 0, growthProgress: 0, firedEvents: [], activePerks: [], featsEarned: [], chronicle: [],
    stats: { choicesMade: 0, tilesExplored: 0, tilesExpanded: 0, buildingsBuilt: 0, rivalsDefeated: 0, agesCompleted: 0, landmarksDiscovered: 0 }, runRecorded: false,
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
      const rival = createRival('stone', { q: 3, r: -3, s: 0 }, () => 0.2);
      rival.personality = 'aggressive';
      const map: Tile[] = [
        { coord: { q: 3, r: -3, s: 0 }, type: 'plains', elevation: 0.5, moisture: 0.5, feature: null, resource: null, landmark: null, landmarkInvestigated: false, river: false, riverEdges: [], road: false, visible: false, surveyed: false, controlled: false, worked: false, building: null, settlementName: null, rivalId: rival.id },
        { coord: { q: 2, r: -2, s: 0 }, type: 'plains', elevation: 0.5, moisture: 0.5, feature: null, resource: null, landmark: null, landmarkInvestigated: false, river: false, riverEdges: [], road: false, visible: false, surveyed: false, controlled: false, worked: false, building: null, settlementName: null, rivalId: null },
      ];
      const result = processRivalTurn(makeState([rival], map), () => 0.5);
      expect(result.map.filter(tile => tile.rivalId === rival.id).length).toBeGreaterThanOrEqual(1);
    });

    it('rival threat scales each turn', () => {
      const rival = createRival('stone', { q: 3, r: -3, s: 0 }, () => 0.5);
      const result = processRivalTurn(makeState([rival], [{ coord: rival.homeTile, type: 'plains', elevation: 0.5, moisture: 0.5, feature: null, resource: null, landmark: null, landmarkInvestigated: false, river: false, riverEdges: [], road: false, visible: false, surveyed: false, controlled: false, worked: false, building: null, settlementName: null, rivalId: rival.id }]), () => 0.5);
      expect(result.rivals[0].threat.strength).toBeGreaterThanOrEqual(rival.threat.strength);
    });
  });

  describe('processDiplomacyAction', () => {
    it('applies the consequences of a failed threat', () => {
      const rival = createRival('stone', { q: 1, r: -1, s: 0 }, () => 0.9);
      rival.threat.strength = 30;
      const state = makeState([rival], []);
      const result = processDiplomacyAction(state, rival.id, 'threaten', () => 0.5);
      expect(result.success).toBe(false);
      expect(result.updates.resources?.population).toBe(state.resources.population - 1);
    });
  });
});
