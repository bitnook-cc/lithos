import { describe, expect, it } from 'vitest';
import { claimPreview, mapTransitions, territoryEdges, transitionProgress, TRANSITION_MS } from '@/logic/mapPresentation';
import { createNewRun } from '@/logic/runEngine';
import { dispatchCommand } from '@/logic/commandEngine';
import { processExpandAction } from '@/logic/turnEngine';
import { districtKey } from '@/logic/mapSignals';
import { hexNeighbors, hexToPixel } from '@/game/hex/hexUtils';
import { decodeRun, encodeRun } from '@/store/runSave';

function ready() { return dispatchCommand(createNewRun([], 42, true), { type: 'resume' }).state; }

describe('map inspection versus ownership', () => {
  it('draws only the outside perimeter of two adjacent owned districts', () => {
    const state = ready(); const origin = state.map.find(t => t.controlled)!;
    const neighbor = state.map.find(t => t.coord.q === 1 && t.coord.r === 0)!;
    neighbor.controlled = true;
    const lookup = new Map(state.map.map(t => [districtKey(t.coord), t]));
    expect(territoryEdges(origin, lookup)).not.toContain(1);
    expect(territoryEdges(neighbor, lookup)).not.toContain(4);
    expect(territoryEdges(origin, lookup).length + territoryEdges(neighbor, lookup).length).toBe(10);
    expect(territoryEdges({ ...neighbor, visible: false }, lookup)).toEqual([]);
  });
  it('matches perimeter edge directions to the actual neighboring hex geometry', () => {
    const origin = { q: 0, r: 0, s: 0 };
    hexNeighbors(origin).forEach((coord, i) => {
      const neighbor = hexToPixel(coord, 36);
      const a = (i + 5) % 6 * Math.PI / 3, b = i * Math.PI / 3;
      const midpoint = { x: 18 * (Math.cos(a) + Math.cos(b)), y: 18 * (Math.sin(a) + Math.sin(b)) };
      expect(midpoint.x).toBeCloseTo(neighbor.x / 2);
      expect(midpoint.y).toBeCloseTo(neighbor.y / 2);
    });
  });
  it('does not merge rival boundaries through fog', () => {
    const state = ready(); const tile = state.map.find(t => t.coord.q === 1 && t.coord.r === 0)!;
    tile.rivalId = 'test'; tile.controlled = false;
    const other = state.map.find(t => t.coord.q === 2 && t.coord.r === 0)!;
    other.rivalId = 'test'; other.visible = false;
    const lookup = new Map(state.map.map(t => [districtKey(t.coord), t]));
    expect(territoryEdges(tile, lookup)).toContain(1);
  });
  it.each([7, 19, 42, 77, 101])('matches legal claim previews to the command rules for seed %i', seed => {
    const state = dispatchCommand(createNewRun([], seed), { type: 'resume' }).state;
    state.map = state.map.map(t => ({ ...t, surveyed: t.visible }));
    for (const tile of state.map) expect(claimPreview(state, tile).available).toBe(Boolean(processExpandAction(state, tile.coord).map));
  });
  it('explains survey, adjacency, worker, AP and outcome gates without changing resources', () => {
    const state = ready(); const target = state.map.find(t => t.coord.q === 1 && t.coord.r === 0)!;
    const resources = { ...state.resources };
    expect(claimPreview(state, target).reason).toContain('does not claim');
    target.surveyed = true;
    expect(claimPreview(state, target).available).toBe(true);
    state.actionPoints = 0; expect(claimPreview(state, target).reason).toContain('action point');
    state.actionPoints = 3; state.phase = 'event'; expect(claimPreview(state, target).available).toBe(false);
    state.phase = 'actions'; state.resources.population = 1; expect(claimPreview(state, target).reason).toContain('No unassigned');
    state.resources.population = resources.population;
    const remote = state.map.find(t => t.coord.q === 3 && t.coord.r === 0)!;
    remote.visible = true; remote.surveyed = true;
    expect(claimPreview(state, remote).reason).toContain('neighboring');
    expect(state.resources).toEqual(resources);
  });
});

describe('ephemeral map animation events', () => {
  it('distinguishes revealing and surveying from claiming and construction', () => {
    const start = ready(); const target = start.tutorial!.target!;
    const surveyed = dispatchCommand(start, { type: 'survey', target }).state;
    const changes = mapTransitions(start, surveyed);
    expect(changes.filter(t => t.kind === 'survey')).toHaveLength(1);
    expect(changes.some(t => t.kind === 'reveal')).toBe(true);
    expect(changes.some(t => t.kind === 'claim')).toBe(false);
    const claimed = dispatchCommand(surveyed, { type: 'expand', target }).state;
    expect(mapTransitions(surveyed, claimed)).toEqual([{ kind: 'claim', coord: target }]);
    claimed.techs.find(t => t.id === 'survival')!.researched = true;
    const built = dispatchCommand(claimed, { type: 'build', target, buildingId: 'gathering_site' }).state;
    expect(mapTransitions(claimed, built)).toEqual([{ kind: 'build', coord: target, buildingId: 'gathering_site' }]);
    expect(decodeRun(encodeRun(built))).toEqual(built);
  });
  it('never celebrates rejected actions, reload, restoration, new runs or age transitions', () => {
    const start = ready(); const target = start.tutorial!.target!;
    const rejected = dispatchCommand(start, { type: 'expand', target }).state;
    expect(mapTransitions(start, rejected)).toEqual([]);
    const next = dispatchCommand(start, { type: 'survey', target }).state;
    expect(mapTransitions(next, decodeRun(encodeRun(next)))).toEqual([]);
    expect(mapTransitions(next, start)).toEqual([]);
    expect(mapTransitions(start, { ...next, age: 'bronze' })).toEqual([]);
    expect(mapTransitions(start, createNewRun([], 18))).toEqual([]);
  });
  it('never produces decoration events for still-hidden tiles', () => {
    const start = ready(); const next = structuredClone(start);
    next.runtime!.commandSequence++;
    const hidden = next.map.find(t => !t.visible)!;
    hidden.building = 'gathering_site'; hidden.controlled = true;
    expect(mapTransitions(start, next)).toEqual([]);
  });
  it.each(['reveal', 'survey', 'claim', 'build'] as const)('%s finishes on time and is skipped in reduced motion', kind => {
    expect(transitionProgress(kind, 0, false)).toBe(0);
    expect(transitionProgress(kind, TRANSITION_MS[kind] / 2, false)).toBe(.5);
    expect(transitionProgress(kind, TRANSITION_MS[kind] + 10000, false)).toBe(1);
    expect(transitionProgress(kind, 0, true)).toBe(1);
  });
});
