import React, { useEffect, useState } from 'react';
import { HexCoord } from '@/types/map';
import { getBuildingDef } from '@/data/buildings';
import { districtYield } from '@/logic/economyView';
import { getLandmark, getMapFeature, getResourceNode } from '@/data/mapFeatures';
import { useGameStore } from '@/store/gameStore';

interface HoverState { coord: HexCoord; screenX: number; screenY: number; }

export function TileTooltip() {
  const [hover, setHover] = useState<HoverState | null>(null);
  const state = useGameStore();
  const { map, rivals } = state;
  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      setHover(detail.tile ? { coord: detail.tile.coord, screenX: detail.screenX, screenY: detail.screenY } : null);
    };
    window.addEventListener('tile-hovered', handler);
    return () => window.removeEventListener('tile-hovered', handler);
  }, []);
  const tile = hover ? map.find(item => item.coord.q === hover.coord.q && item.coord.r === hover.coord.r && item.coord.s === hover.coord.s) : null;
  if (!hover || !tile?.visible) return null;
  const surveyed = tile.surveyed || tile.controlled;
  const landmark = surveyed ? getLandmark(tile.landmark) : null;
  const feature = surveyed ? getMapFeature(tile.feature) : null;
  const resource = surveyed ? getResourceNode(tile.resource) : null;
  const building = tile.building ? getBuildingDef(tile.building) : null;
  const rival = tile.rivalId ? rivals.find(item => item.id === tile.rivalId) : null;
  const production = Object.entries(districtYield(state, tile)).filter(([, value]) => value).map(([key, value]) => `+${value} ${key}`).join(' · ');
  return <aside className="map-tooltip" style={{ left: Math.min(hover.screenX + 16, window.innerWidth - 250), top: Math.max(90, hover.screenY - 16) }}>
    <span className="eyebrow">{tile.type} {tile.river ? '· river' : ''}</span>
    <strong>{surveyed ? landmark?.name ?? feature?.name ?? resource?.name ?? tile.type : `Unsurveyed ${tile.type}`}</strong>
    {!surveyed && <p>Send an expedition to learn what this country holds.</p>}
    {landmark && <p>{landmark.description}</p>}
    <div className="map-tooltip-tags">{feature && <span>{feature.glyph} {feature.name}</span>}{resource && <span>{resource.glyph} {resource.name}</span>}{tile.road && <span>⌁ Road</span>}</div>
    {surveyed && production && <small>{tile.worked || !tile.controlled ? production : `Dormant · potential ${production}`}</small>}
    {building && <em>{tile.settlementName ? `${tile.settlementName} · ${building.name}` : building.name}</em>}
    <footer>{tile.controlled ? tile.worked ? 'Worked by your people' : 'Your dormant territory' : rival ? rival.name : 'Unclaimed frontier'}{landmark && !tile.landmarkInvestigated ? ' · Uninvestigated' : ''}</footer>
  </aside>;
}
