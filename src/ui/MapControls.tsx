import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { Tile } from '@/types/map';
import { MapLegend } from './MapLegend';

export function MapControls({ onSelect }: { onSelect: (tile: Tile) => void }) {
  const map = useGameStore(state => state.map);
  const control = (action: string) => window.dispatchEvent(new CustomEvent('map-control', { detail: { action } }));
  return <div className="map-controls" aria-label="Map controls">
    <button aria-label="Zoom in" onClick={() => control('in')}>+</button>
    <button aria-label="Zoom out" onClick={() => control('out')}>−</button>
    <button aria-label="Recenter map" onClick={() => control('center')}>⌾</button>
    <MapLegend onSelect={onSelect} />
    <select aria-label="Choose a visible district" value="" onChange={event => { const tile = map.find(t => `${t.coord.q},${t.coord.r}` === event.target.value); if (tile) onSelect(tile); }}><option value="">Districts…</option>{map.filter(t => t.visible).map(t => <option key={`${t.coord.q},${t.coord.r}`} value={`${t.coord.q},${t.coord.r}`}>{t.coord.q}, {t.coord.r} · {t.type} · {t.controlled ? 'owned' : t.rivalId ? 'neighbors' : t.surveyed ? 'surveyed' : 'frontier'}</option>)}</select>
  </div>;
}
