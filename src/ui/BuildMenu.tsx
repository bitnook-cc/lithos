import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { BUILDINGS, getBuildingDef } from '@/data/buildings';
import { Tile } from '@/types/map';
import { Resources } from '@/types/game';
import { getUnlockedBuildings } from '@/logic/buildingEngine';
import { Dialog } from './Dialog';
import { constructionPreview } from '@/logic/decisionPreview';

export function BuildMenu({ tile, onBuild, onClose }: { tile: Tile; onBuild: (id: string) => void; onClose: () => void }) {
  const state = useGameStore();
  const unlocked = getUnlockedBuildings(state);
  const current = getBuildingDef(tile.building ?? '');
  const options = BUILDINGS.filter(b => unlocked.has(b.id) && (!b.requiredTile || b.requiredTile.includes(tile.type)) && (current ? b.upgradesFrom === current.id : !b.upgradesFrom));
  return <Dialog title={current ? `Improve ${current.name}` : 'Build a district'} onClose={onClose}><article className="build-card">
    <header className="panel-heading"><div><span className="eyebrow">MAKE A PLACE FOR THE FUTURE</span><h1>{current ? `Improve ${current.name}` : 'Build a district'}</h1></div><button className="icon-button" onClick={onClose} aria-label="Close construction">×</button></header>
    <p>{tile.type} district · {state.actionPoints} actions available. Buildings produce every collection while staffed.</p>
    <div className="build-options">{options.map(building => {
      const affordable = Object.entries(building.cost).every(([key, value]) => state.resources[key as keyof Resources] >= value);
      const preview = constructionPreview(state, tile, building);
      return <button key={building.id} disabled={!affordable || state.actionPoints < 1 || !tile.worked} className="build-option" onClick={() => onBuild(building.id)}><strong>{building.name}</strong><span>Cost: 1 AP{Object.entries(building.cost).filter(([, n]) => n > 0).map(([key, value]) => ` · ${value} ${key}`).join('')}</span><small className="build-change">{current ? `Replaces ${current.name}. ` : ''}Staffed district change: {preview.join(' · ') || 'No production change'}</small>{!affordable && <small>Missing: {Object.entries(building.cost).filter(([key, value]) => state.resources[key as keyof Resources] < value).map(([key, value]) => `${value - state.resources[key as keyof Resources]} ${key}`).join(' · ')}</small>}{!tile.worked && <small>Assign a worker first</small>}{state.actionPoints < 1 && <small>No actions left this turn</small>}</button>;
    })}</div>
    {!options.length && <p>No compatible construction methods are unlocked here. Research a matching discovery or choose another district.</p>}
    <button className="text-button" onClick={onClose}>Return to the district</button>
  </article></Dialog>;
}
