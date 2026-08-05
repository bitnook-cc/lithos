import React from 'react';
import { Tile } from '@/types/map';
import { getBuildingDef } from '@/data/buildings';
import { getLandmark, getMapFeature, getResourceNode } from '@/data/mapFeatures';
import { getTileLayerYields, getTileYield } from '@/logic/resourceEngine';
import { useGameStore } from '@/store/gameStore';

const labels: Record<string, string> = { food: 'Food', materials: 'Materials', wealth: 'Wealth', knowledge: 'Knowledge', influence: 'Influence' };
export function TileInspector({ tile, onClose }: { tile: Tile; onClose: () => void }) {
  const rivals = useGameStore(state => state.rivals);
  const surveyed = tile.surveyed || tile.controlled;
  const landmark = surveyed ? getLandmark(tile.landmark) : null;
  const feature = surveyed ? getMapFeature(tile.feature) : null;
  const resource = surveyed ? getResourceNode(tile.resource) : null;
  const building = tile.building ? getBuildingDef(tile.building) : null;
  const rival = tile.rivalId ? rivals.find(item => item.id === tile.rivalId) : null;
  const yields: Record<string, number> = {};
  for (const source of [getTileYield(tile.type), getTileLayerYields(tile), building?.produces ?? {}]) for (const [key, value] of Object.entries(source)) if (value) yields[key] = (yields[key] ?? 0) + value;
  return <aside className="tile-inspector">
    <button className="inspector-close" onClick={onClose} aria-label="Close tile details">×</button>
    <span className="eyebrow">{tile.type} terrain · {tile.controlled ? 'your territory' : rival ? rival.name : 'frontier'}</span>
    <h2>{surveyed ? landmark?.name ?? feature?.name ?? tile.type : `Unsurveyed ${tile.type}`}</h2>
    <p>{surveyed ? landmark?.description ?? feature?.description ?? resource?.description ?? 'Surveyed country awaiting the mark of history.' : 'Its terrain can be seen from afar, but its resources and secrets remain unknown.'}</p>
    {surveyed && <div className="tile-traits">
      {feature && <span>{feature.glyph} {feature.name}</span>}
      {resource && <span>{resource.glyph} {resource.name}</span>}
      {tile.river && <span>≈ River</span>}
      {tile.road && <span>⌁ Road</span>}
      {building && <span>◆ {building.name}</span>}
    </div>}
    {surveyed && <div className={`tile-yields ${tile.controlled && !tile.worked ? 'dormant' : ''}`}>{Object.entries(yields).map(([key, value]) => <span key={key}><b>+{value}</b> {labels[key] ?? key}</span>)}</div>}
    {tile.controlled && <div className={`worker-status ${tile.worked ? 'active' : 'dormant'}`}>{tile.worked ? '1 population assigned · yields active' : 'Dormant district · yields suspended until population recovers'}</div>}
    {landmark && <div className={`landmark-status ${tile.landmarkInvestigated ? 'known' : ''}`}>{tile.landmarkInvestigated ? 'Legacy understood · landmark yield active' : tile.controlled ? 'Mystery within your borders · investigate for 1 action' : 'Surveyed site · investigate for 1 action'}</div>}
  </aside>;
}
