import React, { useEffect, useState } from 'react';
import { Tile } from '@/types/map';
import { getBuildingDef } from '@/data/buildings';
import { getTileLayerYields, getTileYield } from '@/logic/resourceEngine';
import { getLandmark, getMapFeature, getResourceNode } from '@/data/mapFeatures';
import { useGameStore } from '@/store/gameStore';

interface HoverState { tile: Tile; screenX: number; screenY: number; }
const yieldText = (tile: Tile) => {
  const combined: Record<string, number> = {};
  for (const source of [getTileYield(tile.type), getTileLayerYields(tile)]) for (const [key, value] of Object.entries(source)) if (value) combined[key] = (combined[key] ?? 0) + value;
  return Object.entries(combined).map(([key, value]) => `+${value} ${key}`).join(' · ');
};

export function TileTooltip() {
  const [hover, setHover] = useState<HoverState | null>(null);
  const rivals = useGameStore(state => state.rivals);
  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      setHover(detail.tile ? { tile: detail.tile, screenX: detail.screenX, screenY: detail.screenY } : null);
    };
    window.addEventListener('tile-hovered', handler);
    return () => window.removeEventListener('tile-hovered', handler);
  }, []);
  if (!hover?.tile.visible) return null;
  const { tile } = hover;
  const surveyed = tile.surveyed || tile.controlled;
  const landmark = surveyed ? getLandmark(tile.landmark) : null;
  const feature = surveyed ? getMapFeature(tile.feature) : null;
  const resource = surveyed ? getResourceNode(tile.resource) : null;
  const building = tile.building ? getBuildingDef(tile.building) : null;
  const rival = tile.rivalId ? rivals.find(item => item.id === tile.rivalId) : null;
  return <aside className="map-tooltip" style={{ left: Math.min(hover.screenX + 16, window.innerWidth - 250), top: Math.max(90, hover.screenY - 16) }}>
    <span className="eyebrow">{tile.type} {tile.river ? '· river' : ''}</span>
    <strong>{surveyed ? landmark?.name ?? feature?.name ?? resource?.name ?? tile.type : `Unsurveyed ${tile.type}`}</strong>
    {!surveyed && <p>Send an expedition to learn what this country holds.</p>}
    {landmark && <p>{landmark.description}</p>}
    <div className="map-tooltip-tags">{feature && <span>{feature.glyph} {feature.name}</span>}{resource && <span>{resource.glyph} {resource.name}</span>}{tile.road && <span>⌁ Road</span>}</div>
    {surveyed && yieldText(tile) && <small>{tile.worked || !tile.controlled ? yieldText(tile) : `Dormant · potential ${yieldText(tile)}`}</small>}
    {building && <em>{building.name}</em>}
    <footer>{tile.controlled ? tile.worked ? 'Worked by your people' : 'Your dormant territory' : rival ? rival.name : 'Unclaimed frontier'}{landmark && !tile.landmarkInvestigated ? ' · Uninvestigated' : ''}</footer>
  </aside>;
}
