import { GameState } from '@/types/game';
import { HexCoord, Tile } from '@/types/map';
import { hexNeighbors } from '@/game/hex/hexUtils';
import { getAvailablePopulation } from './populationEngine';
import { districtKey } from './mapSignals';

export function territoryEdges(tile: Tile, byKey: Map<string, Tile>): number[] {
  const owner = tile.controlled ? 'player' : tile.rivalId;
  if (!tile.visible || !owner) return [];
  return hexNeighbors(tile.coord).flatMap((coord, index) => {
    const neighbor = byKey.get(districtKey(coord));
    const neighborOwner = neighbor?.visible ? neighbor.controlled ? 'player' : neighbor.rivalId : null;
    return neighborOwner === owner ? [] : [index];
  });
}

/** Mirrors claim eligibility without applying the action or exposing unsurveyed yields. */
export function claimPreview(state: GameState, tile: Tile) {
  if (!tile.visible || tile.controlled || tile.rivalId) return { available: false, reason: tile.controlled ? 'Already part of your territory.' : tile.rivalId ? 'Rival territory cannot be claimed.' : 'Explore to reveal this district.' };
  if (!tile.surveyed) return { available: false, reason: 'Survey reveals resources; it does not claim land.' };
  if (!hexNeighbors(tile.coord).some(coord => state.map.some(t => t.controlled && districtKey(t.coord) === districtKey(coord)))) return { available: false, reason: 'Claim a neighboring district first to connect this land.' };
  if (getAvailablePopulation(state) < 1) return { available: false, reason: 'No unassigned people. Grow your population before claiming more land.' };
  if (state.phase !== 'actions' || state.runtime?.notices.length || state.gameOver) return { available: false, reason: 'Resolve the current outcome before claiming.' };
  if (state.actionPoints < 1) return { available: false, reason: 'End the turn to regain an action point.' };
  return { available: true, reason: '1 AP · assign 1 existing person. Expands your border without reducing population.' };
}

export type MapTransition = { kind: 'reveal' | 'survey' | 'claim' | 'build'; coord: HexCoord; buildingId?: string };
/** Presentation only. Hydration, restoration, rejection and age changes must not replay celebrations. */
export function mapTransitions(before: GameState, after: GameState): MapTransition[] {
  if (before.age !== after.age || !before.runtime || !after.runtime || before.runtime.runId !== after.runtime.runId || after.runtime.commandSequence !== before.runtime.commandSequence + 1) return [];
  const old = new Map(before.map.map(t => [districtKey(t.coord), t]));
  return after.map.flatMap(tile => {
    const previous = old.get(districtKey(tile.coord));
    if (!previous || !tile.visible) return [];
    const transitions: MapTransition[] = [];
    if (!previous.visible) transitions.push({ kind: 'reveal', coord: tile.coord });
    if (!previous.surveyed && tile.surveyed && !tile.controlled) transitions.push({ kind: 'survey', coord: tile.coord });
    if (!previous.controlled && tile.controlled) transitions.push({ kind: 'claim', coord: tile.coord });
    if (tile.controlled && tile.building && tile.building !== previous.building) transitions.push({ kind: 'build', coord: tile.coord, buildingId: tile.building });
    return transitions;
  });
}

export const TRANSITION_MS = { reveal: 520, survey: 700, claim: 800, build: 900 };
export function transitionProgress(kind: MapTransition['kind'], elapsed: number, reducedMotion: boolean) {
  return reducedMotion ? 1 : Math.max(0, Math.min(1, elapsed / TRANSITION_MS[kind]));
}
