import { describe, expect, it } from 'vitest';
import { choicePreview, constructionPreview } from '@/logic/decisionPreview';
import { createNewRun } from '@/logic/runEngine';
import { getBuildingDef, BUILDINGS } from '@/data/buildings';
import { STONE_AGE_EVENTS } from '@/data/events/stoneAge';
import { resolveEventChoice } from '@/logic/choiceEngine';
import { isChoiceAvailable } from '@/logic/eventEngine';
import { isStoneConclusion, stoneConclusion } from '@/logic/stoneConclusion';
import { dispatchCommand } from '@/logic/commandEngine';
import { decodeRun, encodeRun } from '@/store/runSave';
import { buildingSymbol } from '@/game/hex/buildingSymbols';
import { EventChoice } from '@/types/events';
import { GameState } from '@/types/game';

describe('informed decisions', () => {
  it('separates payment from immediate benefits and uses the actual cultural axes', () => {
    const state = createNewRun([], 42, true);
    const choice = STONE_AGE_EVENTS[0].choices[0];
    expect(choicePreview(state, choice)).toEqual({ immediate: ['+3 influence', 'More pacifist (12)', 'More mercantile (6)'], uncertain: false, fatal: false });
    expect(choicePreview(state, choice).immediate.join(' ')).not.toContain('food');
  });
  it('accounts for resource floors, reserve caps after costs, and culture limits', () => {
    const state = createNewRun([], 42);
    state.resources.food = 1; state.resources.knowledge = 24; state.civ.identity.knowledge = 98;
    const choice: EventChoice = { id: 'test', text: 'test', requires: {}, cost: { knowledge: 2 }, effects: { resources: { knowledge: 8, food: -3 }, identity: { knowledge: 10 } } };
    expect(choicePreview(state, choice).immediate).toEqual(['+2 research reserve (reserve cap)', '-1 food', 'More erudite (2)']);
    state.civ.identity.knowledge = 100;
    expect(choicePreview(state, choice).immediate).toContain('Erudite limit reached');
  });
  it('does not leak random rewards, narrative, fatal branches or rolls', () => {
    const state = createNewRun([], 42);
    const before = JSON.stringify(state);
    const choice: EventChoice = { id: 'risk', text: 'Risk', requires: {}, effects: { resources: { food: 1 }, outcomes: [{ weight: 1, text: 'Secret', resources: { wealth: 999 }, fatalReason: 'Secret ending' }] } };
    expect(choicePreview(state, choice)).toEqual({ immediate: ['+1 food'], uncertain: true, fatal: false });
    expect(JSON.stringify(state)).toBe(before);
    expect(choicePreview(state, { ...choice, effects: { fatalReason: 'Ends now' } }).fatal).toBe(true);
  });
  it('matches resource changes for every available deterministic Stone choice without special feat rewards', () => {
    const state = createNewRun([], 42, true);
    for (const event of STONE_AGE_EVENTS) for (const choice of event.choices) {
      if (!isChoiceAvailable(choice, state) || choice.effects.outcomes?.length || choice.effects.grantFeat) continue;
      const preview = choicePreview(state, choice);
      const after = resolveEventChoice(state, event, choice, () => .5).state;
      for (const [key, amount] of Object.entries(choice.effects.resources ?? {})) {
        if (!amount) continue;
        const resource = key as keyof GameState['resources'];
        const change = after.resources[resource] - Math.max(0, state.resources[resource] - (choice.cost?.[resource] ?? 0));
        expect(preview.immediate.some(text => text.startsWith(`${change > 0 ? '+' : ''}${change} `))).toBe(true);
      }
    }
  });
  it('warns when a known population loss ends the lineage and does not promise an existing trait', () => {
    const state = createNewRun([], 42);
    state.resources.population = 2;
    const choice: EventChoice = { id: 'loss', text: 'loss', requires: {}, effects: { resources: { population: -3 }, addLeaderTrait: state.civ.leaders[0].traits[0] } };
    expect(choicePreview(state, choice)).toEqual({ immediate: ['-2 people'], uncertain: false, fatal: true });
  });
  it('shows incremental district improvement, not the full replacement output', () => {
    const state = createNewRun([], 42);
    const tile = { ...state.map[0], type: 'plains' as const, building: 'gathering_site', feature: null, resource: null, landmark: null };
    expect(constructionPreview(state, tile, getBuildingDef('primitive_farm')!)).toContain('Food 3 → 5/turn (+2)');
    state.permanentEffects = [{ type: 'building_bonus', buildingId: 'gathering_site', resource: 'food', amount: 3 }];
    expect(constructionPreview(state, tile, getBuildingDef('primitive_farm')!)).toContain('Food 6 → 5/turn (-1)');
  });
  it('shows incremental military bonuses and does not mutate the district', () => {
    const state = createNewRun([], 42);
    const tile = { ...state.map[0], building: 'hill_fort' };
    const before = JSON.stringify(tile);
    expect(constructionPreview(state, tile, getBuildingDef('fortress')!)).toEqual(['+2 army toughness', '+1 army morale']);
    expect(JSON.stringify(tile)).toBe(before);
  });
});

describe('Stone Age conclusion', () => {
  function completed() {
    const state = createNewRun([], 9, true);
    state.phase = 'actions'; state.rivals = []; state.map = state.map.map(tile => ({ ...tile, rivalId: null })); state.firedEvents = STONE_AGE_EVENTS.map(e => e.id);
    state.techs = state.techs.map(t => ({ ...t, researched: t.id !== 'advance_bronze' }));
    const advance = state.techs.find(t => t.id === 'advance_bronze')!;
    state.activeResearch = advance.id; state.researchProgress = advance.cost;
    state.development!.projects[advance.id] = { progress: advance.cost, ticks: 1 };
    state.chronicle = [{ id: 'stone-first-choice', age: 'stone', turn: 1, title: 'The first choice', text: 'Our remembered choice.', tone: 'neutral' }];
    return dispatchCommand(state, { type: 'endTurn' }).state;
  }
  it('opens only on the completed Stone advancement notice', () => {
    const state = completed();
    expect(isStoneConclusion(state)).toBe(true);
    expect(isStoneConclusion({ ...state, age: 'bronze' })).toBe(false);
    expect(isStoneConclusion({ ...state, phase: 'actions' })).toBe(false);
    expect(isStoneConclusion({ ...state, gameOver: { victory: false, reason: 'Ended' } })).toBe(false);
    expect(isStoneConclusion(createNewRun([], 9))).toBe(false);
  });
  it('survives reload and resumes the same Bronze world exactly once', () => {
    const state = completed();
    const restored = dispatchCommand(decodeRun(encodeRun(state)), { type: 'resume' }).state;
    expect(isStoneConclusion(restored)).toBe(true);
    expect(stoneConclusion(restored)).toEqual(stoneConclusion(state));
    const command = { type: 'dismiss' as const, noticeId: state.runtime!.notices[0].id };
    const next = dispatchCommand(state, command);
    expect(next.state).toEqual(dispatchCommand(restored, command).state);
    expect(next.state.age).toBe('bronze');
    expect(next.state.stats.agesCompleted).toBe(1);
    expect(next.state.runtime!.notices[0]).toMatchObject({ type: 'age', age: 'bronze' });
    expect(dispatchCommand(next.state, command).accepted).toBe(false);
  });
  it('summarizes actual land, discoveries, culture and choices without inventing history', () => {
    const state = completed();
    const before = JSON.stringify(state);
    const summary = stoneConclusion(state);
    expect(summary.districts).toBe(state.map.filter(t => t.controlled).length);
    expect(summary.discoveries).toHaveLength(14);
    expect(summary.memories).toEqual([state.chronicle[0]]);
    expect(JSON.stringify(state)).toBe(before);
  });
  it('does not present the automatic founding entry as a player choice', () => {
    expect(stoneConclusion(createNewRun([], 42)).memories).toEqual([]);
  });
});

describe('building silhouettes', () => {
  it.each([['hearthstone', 'hearth'], ['gathering_site', 'food'], ['quarry', 'materials'], ['shrine', 'knowledge'], ['watchtower', 'defense'], ['fishing_dock', 'water']])('%s has a distinct %s silhouette', (id, symbol) => {
    expect(buildingSymbol(id)).toBe(symbol);
  });
  it('assigns a known shape to every building', () => {
    for (const building of BUILDINGS) expect(['hearth', 'food', 'materials', 'knowledge', 'defense', 'water', 'settlement']).toContain(buildingSymbol(building.id));
  });
});
