import React, { useState } from 'react';
import { FEATS, PERKS, MAX_ACTIVE_PERKS } from '@/data/legacy';
import { useMetaStore } from '@/store/metaStore';

export function RunSetup({ onBegin }: { onBegin: (perks: string[]) => void }) {
  const meta = useMetaStore();
  const [selected, setSelected] = useState<string[]>([]);
  const available = PERKS.filter(perk => meta.unlockedPerks.includes(perk.id));
  const toggle = (id: string) => setSelected(current => current.includes(id) ? current.filter(item => item !== id) : current.length < MAX_ACTIVE_PERKS ? [...current, id] : current);

  return <div className="setup-screen">
    <div className="setup-mist" />
    <main className="setup-card">
      <div className="eyebrow">A ROGUELIKE CIVILIZATION</div>
      <h1 className="brand-title">LITHOS</h1>
      <p className="setup-lede">Build a people, not a perfect empire. Every hard choice leaves a story. Every ending leaves something behind.</p>

      <section className="legacy-section">
        <div className="section-heading">
          <div><span className="eyebrow">ANCESTRAL MEMORY</span><h2>Choose up to {MAX_ACTIVE_PERKS} legacies</h2></div>
          <span className="selection-count">{selected.length}/{MAX_ACTIVE_PERKS}</span>
        </div>
        {available.length ? <div className="perk-grid">
          {available.map(perk => <button key={perk.id} className={`perk-card ${selected.includes(perk.id) ? 'selected' : ''}`} onClick={() => toggle(perk.id)}>
            <span className="perk-rune">{perk.name.slice(0, 1)}</span>
            <span><strong>{perk.name}</strong><small>{perk.description}</small><em>{perk.flavor}</em></span>
          </button>)}
        </div> : <div className="first-run-note"><strong>No ancestral memories—yet.</strong><span>Your first civilization begins with only instinct. Accomplish feats during the run to unlock perks for the next.</span></div>}
        {FEATS.some(feat => !meta.unlockedFeats.includes(feat.id)) && <details className="locked-feats"><summary>Unremembered feats</summary><div>{FEATS.filter(feat => !meta.unlockedFeats.includes(feat.id)).map(feat => <span key={feat.id}><strong>{feat.name}</strong><small>{feat.description}</small></span>)}</div></details>}
      </section>

      <div className="setup-stats">
        <span><strong>{meta.completedRuns}</strong> runs remembered</span>
        <span><strong>{meta.unlockedFeats.length}</strong> feats</span>
        <span><strong>{meta.bestAge}</strong> furthest age</span>
      </div>
      <button className="primary-cta" onClick={() => onBegin(selected)}>Begin a new lineage <span>→</span></button>
      <p className="setup-hint">Three ages. One lineage. Death is part of the history.</p>
    </main>
  </div>;
}
