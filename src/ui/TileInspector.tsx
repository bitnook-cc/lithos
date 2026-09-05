import React from 'react';
import { Tile } from '@/types/map';
import { getBuildingDef } from '@/data/buildings';
import { getLandmark, getMapFeature, getResourceNode } from '@/data/mapFeatures';
import { useGameStore } from '@/store/gameStore';
import { districtYield } from '@/logic/economyView';
import { frontierWarnings, districtKey } from '@/logic/mapSignals';
import { claimPreview } from '@/logic/mapPresentation';

const labels: Record<string, string> = { food: 'Food', materials: 'Materials', wealth: 'Wealth', knowledge: 'Knowledge', influence: 'Influence' };
export function TileInspector({ tile, onClose, children }: { tile: Tile; onClose: () => void; children?: React.ReactNode }) {
  const state = useGameStore();
  const rivals = state.rivals;
  const surveyed = tile.surveyed || tile.controlled;
  const landmark = surveyed ? getLandmark(tile.landmark) : null;
  const feature = surveyed ? getMapFeature(tile.feature) : null;
  const resource = surveyed ? getResourceNode(tile.resource) : null;
  const building = tile.building ? getBuildingDef(tile.building) : null;
  const rival = tile.rivalId ? rivals.find(item => item.id === tile.rivalId) : null;
  const yields = districtYield(state, tile);
  const claim = claimPreview(state, tile);
  const threats = frontierWarnings(state).filter(warning => warning.districts.some(t => districtKey(t.coord) === districtKey(tile.coord)));
  return <aside className="tile-inspector">
    <button className="inspector-close" onClick={onClose} aria-label="Close tile details">×</button>
    <div className="district-overview">
    <span className="selection-tag">⌖ Selected · {tile.coord.q}, {tile.coord.r}</span>
    <span className="eyebrow">{tile.type} terrain · {tile.controlled ? 'your territory' : rival ? rival.name : 'frontier'}</span>
    <h2>{surveyed ? landmark?.name ?? building?.name ?? feature?.name ?? tile.type : `Unsurveyed ${tile.type}`}</h2>
    {!tile.controlled && !tile.rivalId && <div className={`claim-preview ${claim.available ? 'ready' : ''}`}><strong>{claim.available ? '▱ Claim preview · not yet yours' : 'Unclaimed land'}</strong><span>{claim.reason}</span>{claim.available && <small>When worked: {Object.entries(yields).filter(([, value]) => value).map(([key, value]) => `+${value} ${key}`).join(' · ') || 'no resource production'} per collection. Selecting this tile spends nothing.</small>}</div>}
    {threats.map(({ rival: threat }) => <div className="frontier-warning" key={threat.id}><strong>⚠ Raid risk · {threat.name}</strong><span>Visible aggressive neighbor. Send an envoy from their district or prepare your army; an attack is possible, not certain.</span></div>)}
    <p>{surveyed ? landmark?.description ?? feature?.description ?? resource?.description ?? 'Surveyed country awaiting the mark of history.' : 'Its terrain can be seen from afar, but its resources and secrets remain unknown.'}</p>
    {surveyed && <div className="tile-traits">
      {feature && <span>{feature.glyph} {feature.name}</span>}
      {resource && <span>{resource.glyph} {resource.name}</span>}
      {tile.river && <span>≈ River</span>}
      {tile.road && <span>⌁ Road</span>}
      {building && <span>◆ {tile.settlementName ? `${tile.settlementName} · ${building.name}` : building.name}</span>}
    </div>}
    {surveyed && <div className={`tile-yields ${tile.controlled && !tile.worked ? 'dormant' : ''}`}>{Object.entries(yields).filter(([, value]) => value !== 0).map(([key, value]) => <span key={key}><b>+{value}</b> {labels[key] ?? key}/turn</span>)}</div>}
    {tile.controlled && <div className={`worker-status ${tile.worked ? 'active' : 'dormant'}`}>{tile.worked ? '1 worker · production active' : 'Dormant · prioritize this district to move a worker here'}</div>}
    {landmark && <div className={`landmark-status ${tile.landmarkInvestigated ? 'known' : ''}`}>{tile.landmarkInvestigated ? 'Legacy understood · landmark yield active' : tile.controlled ? 'Mystery within your borders · investigate for 1 action' : 'Surveyed site · investigate for 1 action'}</div>}
    </div>
    <div className="district-actions">{children}</div>
  </aside>;
}
