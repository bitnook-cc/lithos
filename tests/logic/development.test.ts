import { describe, expect, it } from 'vitest';
import { createNewRun } from '@/logic/runEngine';
import { processCollectPhase } from '@/logic/turnEngine';
import { getDevelopment, reserveLimit, researchEstimate } from '@/logic/developmentEngine';
import { transitionAge } from '@/logic/ageEngine';
import { dispatchCommand } from '@/logic/commandEngine';
import { getUnlockedBuildings } from '@/logic/buildingEngine';
import { rebalanceWorkers } from '@/logic/populationEngine';
import { economySummary } from '@/logic/economyView';
import { decodeRun, encodeRun } from '@/store/runSave';
import { generateMap } from '@/logic/mapGenerator';
import { GameState } from '@/types/game';

const collect = (state: GameState) => ({ ...state, ...processCollectPhase(state) });
describe('research economy and persistent methods', () => {
  it.each([2, 12, 10000])('requires two actual collections at %i knowledge per turn and retains excess', income => {
    let state = createNewRun([], 7);
    state.activeResearch = 'survival'; state.resources.knowledge = 24;
    state.permanentEffects = [{ type: 'resource_per_turn', resource: 'knowledge', amount: income }];
    expect(researchEstimate(state, 'survival', income)).toBe(2);
    state = collect(state);
    expect(state.techs.find(t => t.id === 'survival')?.researched).toBe(false);
    expect(state.researchProgress).toBe(4);
    expect(researchEstimate(state, 'survival', income)).toBe(1);
    state = collect(decodeRun(encodeRun(state)));
    expect(state.techs.find(t => t.id === 'survival')?.researched).toBe(true);
    expect(state.resources.knowledge).toBeLessThanOrEqual(reserveLimit(state));
    expect(state.resources.knowledge).toBeGreaterThan(0);
    expect(state.development?.unlockedBuildings).toContain('gathering_site');
  });
  it('banks idle income once and preserves progress and time when switching', () => {
    let state = collect(createNewRun([], 7));
    expect(state.resources.knowledge).toBe(2);
    state.phase = 'actions';
    state = dispatchCommand(state, { type: 'research', techId: 'survival' }).state;
    state = collect(state);
    state = dispatchCommand(state, { type: 'research', techId: 'mysticism' }).state;
    expect(state.researchProgress).toBe(0);
    state = dispatchCommand(state, { type: 'research', techId: 'survival' }).state;
    expect(state.researchProgress).toBe(4);
    expect(state.development?.projects.survival.ticks).toBe(1);
    expect(decodeRun(encodeRun(state))).toEqual(state);
  });
  it('retains discoveries, food districts and geography across both transitions', () => {
    let state = createNewRun([], 71);
    state.techs = state.techs.map(t => ({ ...t, researched: t.id === 'survival' }));
    state.development = getDevelopment(state);
    const farm = state.map.find(t => t.coord.q === 1 && t.coord.r === 0)!;
    Object.assign(farm, { controlled: true, surveyed: true, visible: true, worked: true, type: 'fertile', building: 'gathering_site', feature: null, resource: 'grain' });
    const before = JSON.stringify(state);
    for (const seed of [8, 9]) {
      const next = transitionAge(state, seed);
      expect(getUnlockedBuildings(next)).toContain('gathering_site');
      expect(next.map.find(t => t.coord.q === 1 && t.coord.r === 0)).toMatchObject({ type: 'fertile', building: 'gathering_site', controlled: true, resource: 'grain' });
      expect(economySummary(next).netFood).toBeGreaterThanOrEqual(0);
      expect(next.development?.inheritance?.districts).toBe(1);
      expect(collect(next).resources.population).toBeGreaterThanOrEqual(state.resources.population);
      if (seed === 8) expect(JSON.stringify(state)).toBe(before);
      state = next;
    }
  });
  it('can complete the Stone milestone with baseline research or extra science', () => {
    for (const science of [0, 8]) {
      let state = createNewRun([], 27); state.resources.food = 1000;
      state.permanentEffects = [{ type: 'resource_per_turn', resource: 'knowledge', amount: science }];
      const needed = new Set<string>();
      const add = (id: string) => { if (needed.has(id)) return; state.techs.find(t => t.id === id)!.requires.forEach(add); needed.add(id); };
      add('advance_bronze');
      for (const id of needed) {
        state.activeResearch = id; state.researchProgress = 0;
        let ticks = 0;
        do { state = collect(state); ticks++; } while (state.activeResearch && ticks < 30);
        expect(ticks).toBeGreaterThanOrEqual(2);
        expect(state.activeResearch).toBeNull();
      }
      expect(state.development?.discoveredTechs).toContain('advance_bronze');
    }
  });
});
describe('recoverable labor and useful geography', () => {
  it('moves a scarce worker from a quarry to food before the next collection', () => {
    let state = createNewRun([], 5); state.phase = 'actions'; state.resources.population = 2; state.resources.food = 0;
    const quarry = state.map.find(t => t.coord.q === 1 && t.coord.r === 0)!;
    const farm = state.map.find(t => t.coord.q === 2 && t.coord.r === 0)!;
    Object.assign(quarry, { controlled: true, visible: true, surveyed: true, building: 'quarry', type: 'mountain' });
    Object.assign(farm, { controlled: true, visible: true, surveyed: true, building: null, type: 'fertile' });
    state.map = rebalanceWorkers(state.map, 2);
    expect(state.map.find(t => t.coord.q === 2 && t.coord.r === 0)?.worked).toBe(false);
    const result = dispatchCommand(state, { type: 'prioritize', target: farm.coord });
    expect(result.accepted).toBe(true); state = result.state;
    expect(state.map.find(t => t.coord.q === 2 && t.coord.r === 0)?.worked).toBe(true);
    expect(state.actionPoints).toBe(2);
    expect(collect(state).resources.population).toBeGreaterThanOrEqual(2);
  });
  it('explains exact starvation timing at a fixed population', () => {
    const state = createNewRun([], 5); state.resources.food = 4;
    expect(economySummary(state)).toMatchObject({ netFood: -2, starvationIn: 3 });
  });
  it('provides food, coast and mountain alternatives across 50 seeds without identical maps', () => {
    const terrains = new Set<string>(); const layouts = new Set<string>();
    for (let seed = 0; seed < 50; seed++) {
      const map = generateMap({ targetTiles: 37, seed, age: 'stone' });
      expect(map.some(t => t.type === 'water')).toBe(true);
      expect(map.some(t => t.type === 'mountain')).toBe(true);
      expect(map.some(t => t.visible && !t.controlled && ['fertile', 'forest'].includes(t.type))).toBe(true);
      map.forEach(t => terrains.add(t.type)); layouts.add(map.map(t => t.type).join(','));
    }
    expect(terrains.size).toBeGreaterThanOrEqual(10); expect(layouts.size).toBe(50);
  });
});
