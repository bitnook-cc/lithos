import { GameState } from '@/types/game';
import { GameStateSchema } from './saveSchema';
import { getAgeContent } from '@/data/content';
import { getBuildingDef } from '@/data/buildings';
import { getFeat, getPerk } from '@/data/legacy';
import { ensureRiverConnections } from '@/logic/riverEngine';
import { generateSettlementName } from '@/data/settlementNames';
import { enforceDefeat, findCurrentEvent, normalizeRuntime } from '@/logic/commandEngine';

export const SAVE_VERSION = 3;
export const CONTENT_VERSION = '2026-09-06-milestone-1';
export const RUN_SAVE_KEY = 'lithos_run_v3';
export const LEGACY_RUN_KEY = 'lithos_run_v2';

export function decodeRun(raw: string): GameState {
  const value = JSON.parse(raw);
  const envelope = value && typeof value === 'object' && 'version' in value;
  if (envelope && (value.version !== SAVE_VERSION || value.contentVersion !== CONTENT_VERSION)) throw new Error('Unsupported save version');
  let state = GameStateSchema.parse(envelope ? value.state : value) as GameState;
  if (envelope && !state.runtime) throw new Error('Missing saved runtime');
  if (!['stone', 'bronze', 'classical'].includes(state.age)) throw new Error('Unsupported age');
  if (state.actionPoints > state.maxActionPoints || state.researchProgress < 0 || state.growthProgress < 0) throw new Error('Invalid counters');
  if (state.activePerks.length > 2 || new Set(state.activePerks).size !== state.activePerks.length || state.activePerks.some(id => !getPerk(id)) || state.featsEarned.some(id => !getFeat(id))) throw new Error('Unknown legacy');
  if (state.map.some(tile => tile.building && !getBuildingDef(tile.building))) throw new Error('Unknown building');
  if (new Set(state.map.map(t => `${t.coord.q},${t.coord.r}`)).size !== state.map.length) throw new Error('Duplicate districts');
  if (state.map.some(t => t.rivalId && !state.rivals.some(r => r.id === t.rivalId))) throw new Error('Unknown rival');
  const definitions = getAgeContent(state.age).createTechs();
  if (state.techs.some(t => !definitions.some(def => def.id === t.id))) throw new Error('Unmapped old discovery');
  if (state.activeResearch && !definitions.some(t => t.id === state.activeResearch && !state.techs.find(old => old.id === t.id)?.researched)) throw new Error('Invalid research');
  state = { ...state, runtime: normalizeRuntime(state), techs: state.phase === 'setup' ? [] : definitions.map(def => ({ ...def, researched: state.techs.some(t => t.id === def.id && t.researched) })) };
  state.map = ensureRiverConnections(state.map.map(tile => ({ ...tile, surveyed: tile.surveyed ?? tile.controlled, worked: tile.worked ?? tile.controlled })));
  const capital = state.map.find(tile => tile.coord.q === 0 && tile.coord.r === 0 && tile.controlled);
  if (capital && !capital.settlementName) capital.settlementName = generateSettlementName(state.age, state.turn * 7919 + state.map.length);
  if (state.currentEvent && !findCurrentEvent(state)) throw new Error('Unknown pending event');
  if (state.phase === 'ageTransition' && !state.techs.some(t => t.researched && t.effects.some(e => e.type === 'advance_age'))) throw new Error('Invalid transition');
  for (const n of state.runtime!.notices) {
    if (n.type === 'tech' && !state.techs.some(t => t.id === n.techId && t.researched)) throw new Error('Unknown pending discovery');
    if (n.type === 'feat' && !getFeat(n.featId)) throw new Error('Unknown pending feat');
    if (n.type === 'age' && n.age !== state.age) throw new Error('Invalid age introduction');
  }
  if (!envelope && !state.runtime!.notices.length && ['eventResult', 'enemyResult'].includes(state.phase)) {
    state.runtime!.noticeSequence++;
    state.runtime!.notices.push({ id: `${state.runtime!.runId}-migrated-result`, type: 'result', title: 'A saved outcome', text: 'This older save already includes the outcome. Its original result screen was not saved; your chronicle records the decisions that were preserved.', effects: [] });
  }
  return enforceDefeat(state);
}

export function encodeRun(state: GameState): string {
  return JSON.stringify({ version: SAVE_VERSION, contentVersion: CONTENT_VERSION, state: GameStateSchema.parse({ ...state, runtime: normalizeRuntime(state) }) });
}
