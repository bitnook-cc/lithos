import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { BUILDINGS, getBuildingDef } from '@/data/buildings';
import { Tile } from '@/types/map';
import { Resources } from '@/types/game';
import { getUnlockedBuildings } from '@/logic/buildingEngine';
import { Dialog } from './Dialog';

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
      return <button key={building.id} disabled={!affordable || state.actionPoints < 1 || !tile.worked} className="build-option" onClick={() => onBuild(building.id)}><strong>{building.name}</strong><span>Cost: 1 AP{Object.entries(building.cost).filter(([, n]) => n > 0).map(([key, value]) => ` · ${value} ${key}`).join('')}</span><small>{Object.entries(building.produces).map(([key, value]) => `+${value} ${key === 'knowledge' ? 'research' : key}/turn`).join(' · ') || 'Military institution'}{building.armyBonuses && ` · ${Object.entries(building.armyBonuses).map(([key, value]) => `+${value} ${key}`).join(' · ')}`}</small>{!affordable && <small>Not enough resources yet</small>}</button>;
    })}</div>
    {!options.length && <p>No compatible construction methods are unlocked here. Research a matching discovery or choose another district.</p>}
    <button className="text-button" onClick={onClose}>Return to the district</button>
  </article></Dialog>;
}
