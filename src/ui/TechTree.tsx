import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { canQueue } from '@/logic/techEngine';
import { formatEffects } from '@/logic/effectsEngine';
import { economySummary } from '@/logic/economyView';
import { researchEstimate, reserveLimit } from '@/logic/developmentEngine';
import { ResearchPlanner } from './ResearchPlanner';
import { TechGraph } from './TechGraph';

const duration = (count: number) => Number.isFinite(count) ? `~${count} collection${count === 1 ? '' : 's'}` : 'Needs research income';

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
        {!tech.researched && <p className="research-estimate"><strong>{progress}/{tech.cost} knowledge · {duration(researchEstimate(state, tech.id, rate))}</strong><small>{project?.ticks ?? 0}/2 minimum collections completed. Time estimates assume current income and no interruptions.</small></p>}
        </div>
        {!tech.researched && <button className="primary-cta" disabled={!available || !ready || isActive} onClick={() => onResearch(tech.id)}>{isActive ? 'Researching — end turns to progress' : available ? `${progress > 0 ? 'Resume' : 'Research'} ${tech.name}` : 'Complete prerequisites first'}</button>}
        {!tech.researched && state.activeResearch && !isActive && <small className="switch-note">Switch freely: your current project's progress and collection time are retained.</small>}
      </section>
      <section className="research-library" aria-label="Discovery branches">
        <div className="research-filters"><label className="tech-available-filter"><input type="checkbox" checked={filter === 'available'} onChange={event => setFilter(event.target.checked ? 'available' : 'all')} />Highlight available</label><ResearchPlanner onInspect={id => { setSelected(id); setFilter('all'); }} /><span>{state.techs.filter(t => t.researched).length}/{state.techs.length} discovered</span></div>
        <TechGraph state={state} selected={tech.id} onSelect={setSelected} highlightAvailable={filter === 'available'} rate={rate} />
      </section>
    </div>
  </section>;
}
