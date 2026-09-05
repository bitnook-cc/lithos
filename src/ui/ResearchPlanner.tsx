import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { researchRoute } from '@/logic/researchView';
import { canQueue } from '@/logic/techEngine';
import { formatEffects } from '@/logic/effectsEngine';
import { Dialog } from './Dialog';

export function ResearchPlanner({ onInspect }: { onInspect: (id: string) => void }) {
  const state = useGameStore();
  const [open, setOpen] = useState(false);
  const [destination, setDestination] = useState(state.techs.find(t => t.effects.some(e => e.type === 'advance_age'))?.id ?? state.techs[0]?.id ?? '');
  const route = researchRoute(state.techs, destination);
  const remaining = route.filter(t => !t.researched);
  const optional = state.techs.filter(t => !route.some(step => step.id === t.id) && !t.researched);
  const inspect = (id: string) => { onInspect(id); setOpen(false); };
  const status = (id: string, researched: boolean) => researched ? '✓ Discovered' : state.activeResearch === id ? 'In progress' : canQueue(id, state.techs) ? 'Available now' : 'Needs prerequisites';
  return <>
    <button className="planner-toggle" onClick={() => setOpen(true)} aria-haspopup="dialog">Plan a discovery</button>
    {open && <Dialog title="Research path planner" onClose={() => setOpen(false)}><article>
      <header className="panel-heading"><div><span className="eyebrow">CHOOSE YOUR HORIZON</span><h1>Paths of discovery</h1></div><button className="icon-button" aria-label="Close research planner" onClick={() => setOpen(false)}>×</button></header>
      <label className="destination-select">Destination<select value={destination} onChange={event => setDestination(event.target.value)}>{state.techs.map(tech => <option value={tech.id} key={tech.id}>{tech.name}{tech.researched ? ' · discovered' : ''}</option>)}</select></label>
      <p>{remaining.length} discoveries remain on this route. This shows prerequisites, not a queue: you choose what to research and when. Independent branches can be studied in a different order.</p>
      <ol className="research-route">{route.map(tech => <li key={tech.id}><button onClick={() => inspect(tech.id)}><strong>{tech.name}</strong><small>{status(tech.id, tech.researched)}{tech.requires.length ? ` · Requires ${tech.requires.map(id => state.techs.find(t => t.id === id)?.name).join(' + ')}` : ' · Foundation'}</small></button></li>)}</ol>
      <h2>{remaining.length ? 'Next two discoveries on this route' : 'This destination is discovered'}</h2>
      <div className="unlock-previews">{remaining.slice(0, 2).map(tech => <button key={tech.id} onClick={() => inspect(tech.id)}><strong>{tech.name}</strong><small>{status(tech.id, false)} · {tech.cost} knowledge total</small><span>{formatEffects(tech.effects).join(' · ')}</span></button>)}</div>
      <h2>Other paths are still open</h2><p>These discoveries are not prerequisites for this destination. They can change how your people gather, defend and develop; advancing an age is not the only useful goal.</p>
      <div className="unlock-previews">{optional.length ? optional.map(tech => <button key={tech.id} onClick={() => inspect(tech.id)}><strong>{tech.name}</strong><small>{status(tech.id, false)}</small><span>{formatEffects(tech.effects).slice(0, 2).join(' · ')}</span></button>) : <p>No undiscovered branches outside this route.</p>}</div>
    </article></Dialog>}
  </>;
}
