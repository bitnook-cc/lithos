import React, { useState } from 'react';
import { Dialog } from './Dialog';
import { useGameStore } from '@/store/gameStore';
import { frontierWarnings } from '@/logic/mapSignals';
import { Tile } from '@/types/map';
import { getResourceNode, getLandmark, getMapFeature } from '@/data/mapFeatures';

export function MapLegend({ onSelect }: { onSelect: (tile: Tile) => void }) {
  const [open, setOpen] = useState(false);
  const state = useGameStore();
  const warnings = frontierWarnings(state);
  const known = state.map.filter(t => t.visible && (t.surveyed || t.controlled));
  const symbols = [...new Map(known.flatMap(t => [getResourceNode(t.resource), getLandmark(t.landmark), getMapFeature(t.feature)]).filter(item => item != null).map(item => [item.id, item])).values()];
  return <>
    <button className="legend-toggle" aria-label={`Map legend${warnings.length ? `, ${warnings.length} rival border warnings` : ''}`} aria-haspopup="dialog" onClick={() => setOpen(true)}>{warnings.length ? '⚠ Key' : 'Key'}</button>
    {open && <Dialog title="Map legend and frontier" onClose={() => setOpen(false)}><article>
      <header className="panel-heading"><div><span className="eyebrow">READ THE LAND</span><h1>Map & frontier</h1></div><button className="icon-button" aria-label="Close map legend" onClick={() => setOpen(false)}>×</button></header>
      <dl className="map-key">
        <div><dt>⌖ Cyan corner brackets · Selected</dt><dd>You are inspecting this tile. Selection costs nothing and does not indicate ownership. Close its details to clear the brackets; recentering keeps your selection.</dd></div>
        <div><dt>▱ Green dashed inset · Claim preview</dt><dd>The selected district can be claimed right now. It is still unowned until you press Claim. One existing person is assigned, not consumed; the gold perimeter expands on success.</dd></div>
        <div><dt>⊙ Small cream target · Guide</dt><dd>The opening guide suggests this district. It is not your selection or your territory.</dd></div>
        <div><dt>? · Unsurveyed</dt><dd>Visible terrain, unknown resources. Survey for 1 action to reveal its contents. The question mark disappears after surveying.</dd></div>
        <div><dt>Gold border · Your territory</dt><dd>Claim a connected surveyed district for 1 action and an available worker. The district selector also labels ownership in words.</dd></div>
        <div><dt>Red border · Rival territory</dt><dd>Select it to identify the neighbor and approach them. Rival land cannot be claimed by the normal claim action.</dd></div>
        <div><dt>Dimmed, slashed district · Dormant</dt><dd>Still yours, but unstaffed and producing nothing. Use Food & workers or the district's Prioritize action to reassign a worker.</dd></div>
        <div><dt>! triangle · Border at risk</dt><dd>A visible aggressive neighbor can raid this district. This is a risk warning, not a promised attack. An envoy improves relations; preparing your army helps defend against raids.</dd></div>
        <div><dt>≈ River · ⌁ Road</dt><dd>Water and road networks connect districts. Inspect a surveyed district for its actual production.</dd></div>
        <div><dt>Deposits & landmarks</dt><dd>Small symbols identify surveyed resources and natural features. Larger landmark symbols mark a story site; investigate for 1 action. Its special production requires investigation and a worker on owned land.</dd></div>
      </dl>
      <h2>Known symbols</h2>{symbols.length ? <div className="legend-symbols">{symbols.map(item => <span key={item.id}><b>{item.glyph}</b> {item.name}</span>)}</div> : <p>Survey a district to discover its symbols. Hidden resources are not listed here.</p>}
      <h2>Frontier watch</h2>{warnings.length ? warnings.map(({ rival, districts }) => <section className="frontier-warning" key={rival.id}><strong>⚠ {rival.name} · raid risk</strong><p>Aggressive, with relations below the safe-border threshold. These observed districts share the border:</p><div className="frontier-links">{districts.map(tile => <button key={`${tile.coord.q},${tile.coord.r}`} onClick={() => { onSelect(tile); setOpen(false); }}>Inspect {tile.settlementName ?? `${tile.type} (${tile.coord.q}, ${tile.coord.r})`}</button>)}</div></section>) : <p>No raid-capable rival border is currently visible. Unexplored territory may conceal other threats, and events can change relations.</p>}
    </article></Dialog>}
  </>;
}
