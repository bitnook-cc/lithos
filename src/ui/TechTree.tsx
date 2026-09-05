import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { canQueue } from '@/logic/techEngine';
import { formatEffects } from '@/logic/effectsEngine';
import { economySummary } from '@/logic/economyView';
import { researchEstimate, reserveLimit } from '@/logic/developmentEngine';

export function TechTree({ onResearch }: { onResearch: (id: string) => void }) {
  const state = useGameStore();
  const [selected, setSelected] = useState(state.activeResearch ?? state.techs.find(t => !t.researched)?.id ?? '');
  const [filter, setFilter] = useState<'all' | 'available'>('all');
  const tech = state.techs.find(t => t.id === selected) ?? state.techs[0];
  const rate = economySummary(state).produced.knowledge ?? 0;
  const ready = state.phase === 'actions' && !state.runtime?.notices.length;
  if (!tech) return null;
  const isActive = tech.id === state.activeResearch;
  const project = state.development?.projects[tech.id];
  const progress = isActive ? state.researchProgress : project?.progress ?? 0;
  const available = canQueue(tech.id, state.techs);
  return <section className="research-workspace full-panel" aria-label="Research">
    <header className="research-heading"><div><span className="eyebrow">KNOWLEDGE BECOMES POSSIBILITY</span><h1>Research</h1></div><p>+{rate} / turn · {state.resources.knowledge}/{reserveLimit(state)} reserve</p></header>
    <div className="research-layout">
      <section className="research-detail" aria-label="Selected discovery">
        <div className="research-detail-copy">
        <span className="eyebrow">{tech.researched ? 'DISCOVERED' : isActive ? 'IN PROGRESS' : available ? 'AVAILABLE NOW' : 'FOLLOW THE PREREQUISITES'}</span>
        <h2>{tech.name}</h2><p>{tech.description}</p>
        <div className="effect-pills">{formatEffects(tech.effects).map((effect, index) => <span key={index}>{effect}</span>)}</div>
        {tech.requires.length > 0 && <div className="prerequisite-links"><span>Requires </span>{tech.requires.map(id => { const req = state.techs.find(t => t.id === id)!; return <button key={id} onClick={() => setSelected(id)}>{req.researched ? '✓ ' : ''}{req.name}</button>; })}</div>}
        {!tech.researched && <p className="research-estimate"><strong>{progress}/{tech.cost} knowledge · ~{researchEstimate(state, tech.id, rate)} collections</strong><small>{project?.ticks ?? 0}/2 minimum collections completed. Time estimates assume current income and no interruptions.</small></p>}
        </div>
        {!tech.researched && <button className="primary-cta" disabled={!available || !ready || isActive} onClick={() => onResearch(tech.id)}>{isActive ? 'Researching — end turns to progress' : available ? `${progress > 0 ? 'Resume' : 'Research'} ${tech.name}` : 'Complete prerequisites first'}</button>}
        {!tech.researched && state.activeResearch && !isActive && <small className="switch-note">Switch freely: your current project's progress and collection time are retained.</small>}
      </section>
      <section className="research-library" aria-label="Discovery branches">
        <div className="research-filters"><button aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>All branches</button><button aria-pressed={filter === 'available'} onClick={() => setFilter('available')}>Available now</button><span>{state.techs.filter(t => t.researched).length}/{state.techs.length} discovered</span></div>
        <div className="research-grid">{state.techs.filter(t => filter === 'all' || canQueue(t.id, state.techs)).map(item => {
          const canStart = canQueue(item.id, state.techs);
          return <button key={item.id} className={`discovery-option ${item.id === tech.id ? 'selected' : ''} ${item.researched ? 'complete' : ''}`} aria-pressed={item.id === tech.id} onClick={() => setSelected(item.id)}>
            <span className="discovery-state">{item.researched ? '✓ Discovered' : item.id === state.activeResearch ? '◌ Researching' : canStart ? '◇ Available' : 'Prerequisites needed'}</span><strong>{item.name}</strong>
            <small>{item.researched ? 'Knowledge carried forward' : `${item.cost} knowledge · ~${researchEstimate(state, item.id, rate)} collections after starting`}</small>
            {item.requires.length > 0 && <small>From {item.requires.map(id => state.techs.find(t => t.id === id)?.name).join(' + ')}</small>}
          </button>;
        })}</div>
      </section>
    </div>
  </section>;
}
