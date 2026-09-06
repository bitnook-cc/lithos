import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { stoneConclusion } from '@/logic/stoneConclusion';
import { CULTURE_AXES } from '@/logic/cultureEngine';
import { Dialog } from './Dialog';
import { exportRecovery } from './exportRecovery';

export function StoneConclusion({ onContinue }: { onContinue: () => void }) {
  const state = useGameStore();
  const summary = stoneConclusion(state);
  const [confirmReplay, setConfirmReplay] = useState(false);
  return <Dialog title="Stone Age complete"><article className="stone-conclusion discovery-arrival">
    <header><span className="eyebrow">STONE AGE COMPLETE · TURN {state.turn}</span><h1>A hearth becomes a homeland</h1><p>You discovered Dawn of Bronze. Your people have a future—and a history worth remembering.</p></header>
    <div className="conclusion-body">
      <dl className="conclusion-metrics"><div><dt>People</dt><dd>{state.resources.population}</dd></div><div><dt>Districts</dt><dd>{summary.districts}</dd></div><div><dt>Buildings</dt><dd>{summary.buildings}</dd></div><div><dt>Discoveries</dt><dd>{summary.discoveries.length}</dd></div></dl>
      <section className="conclusion-culture"><h2>{summary.culture.symbol} {summary.culture.name}</h2><p>{summary.culture.description}</p><div className="effect-pills">{CULTURE_AXES.map(axis => <span key={axis.key}>{state.civ.identity[axis.key] === 0 ? `${axis.left} / ${axis.right}: balanced` : `${state.civ.identity[axis.key] > 0 ? axis.right : axis.left} ${Math.abs(state.civ.identity[axis.key])}`}</span>)}</div></section>
      <section><h2>Choices your people remember</h2>{summary.memories.length ? <ol className="conclusion-memories">{summary.memories.slice(-3).map(entry => <li key={entry.id}><strong>{entry.title} · Turn {entry.turn}</strong><p>{entry.text}</p></li>)}</ol> : <p>Your settled land and discoveries tell this chapter's story.</p>}{summary.memories.length > 3 && <details><summary>Earlier memories ({summary.memories.length - 3})</summary>{summary.memories.slice(0, -3).map(entry => <p key={entry.id}><strong>{entry.title} · Turn {entry.turn}</strong><br />{entry.text}</p>)}</details>}</section>
      <details><summary>Your homeland · {summary.districts} districts, {summary.netFood >= 0 ? '+' : ''}{summary.netFood} net food/turn</summary><ul>{summary.settlements.map(tile => <li key={tile.key}>{tile.name} · {tile.location}</li>)}</ul></details>
      <details><summary>Your discoveries · {summary.discoveries.length}</summary><p>{summary.discoveries.join(' · ')}</p></details>
      <p className="inheritance-note">Continue to keep your settled districts, outlying buildings, discoveries and cultural values. Your capital changes for the new age. This is the end of the Stone Age slice, not a full campaign victory.</p>
    </div>
    <footer className="conclusion-actions">{confirmReplay ? <><p role="alert">Start over? This replaces the current lineage. Earned ancestral perks remain; this does not count as a completed campaign.</p><button className="action-button" onClick={exportRecovery}>Export this lineage first</button><div><button className="action-button" onClick={() => setConfirmReplay(false)}>Keep this lineage</button><button className="primary-cta" onClick={state.resetRun}>Confirm play again</button></div></> : <><button className="primary-cta" onClick={onContinue}>Continue into Bronze →</button><button className="text-button" onClick={() => setConfirmReplay(true)}>Play again</button></>}</footer>
  </article></Dialog>;
}
