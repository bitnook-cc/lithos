import React from 'react';
import { Tile } from '@/types/map';
import { useGameStore } from '@/store/gameStore';
import { processExpandAction, processSurveyAction } from '@/logic/turnEngine';
import { getLandmark } from '@/data/mapFeatures';
import { getAvailablePopulation } from '@/logic/populationEngine';
import { getUnlockedBuildings } from '@/logic/buildingEngine';
import { BUILDINGS } from '@/data/buildings';

export function DistrictActions({ tile, onBuild, onDiplomacy }: { tile: Tile; onBuild: () => void; onDiplomacy: () => void }) {
  const state = useGameStore();
  const ready = state.phase === 'actions' && state.actionPoints > 0 && !state.runtime?.notices.length;
  const methods = getUnlockedBuildings(state);
  const canBuild = BUILDINGS.some(b => methods.has(b.id) && (!b.requiredTile || b.requiredTile.includes(tile.type)) && (tile.building ? b.upgradesFrom === tile.building : !b.upgradesFrom));
  return <>
    {!tile.surveyed && !tile.rivalId && <button className="action-button explore" disabled={!ready || !processSurveyAction(state, tile.coord).map} onClick={() => state.dispatch({ type: 'survey', target: tile.coord })}>Survey district · 1 AP</button>}
    {tile.surveyed && !tile.controlled && !tile.rivalId && <button className="action-button expand" disabled={!ready || !processExpandAction(state, tile.coord).map} onClick={() => state.dispatch({ type: 'expand', target: tile.coord })}>{getAvailablePopulation(state) < 1 ? 'No unassigned people to claim land' : 'Claim district · 1 AP · 1 worker'}</button>}
    {tile.surveyed && tile.landmark && !tile.landmarkInvestigated && !tile.rivalId && <button className="action-button investigate" disabled={!ready} onClick={() => state.dispatch({ type: 'investigate', target: tile.coord })}>Investigate {getLandmark(tile.landmark)?.name} · 1 AP</button>}
    {tile.controlled && <button className="action-button build" disabled={!ready || !tile.worked || !canBuild} onClick={onBuild}>{!canBuild ? tile.building ? 'No further improvements unlocked' : 'Research a building method first' : `${tile.building ? 'Improve district' : 'Build here'} · 1 AP`}</button>}
    {tile.controlled && !tile.worked && (tile.coord.q !== 0 || tile.coord.r !== 0) && <button className="action-button" disabled={!ready} onClick={() => state.dispatch({ type: 'prioritize', target: tile.coord })}>Prioritize workers · 1 AP</button>}
    {tile.rivalId && <button className="action-button diplomacy" disabled={!ready} onClick={onDiplomacy}>Approach neighbors · 1 AP</button>}
    {!ready && <small>Acknowledge outcomes, or end the turn to regain actions.</small>}
  </>;
}
