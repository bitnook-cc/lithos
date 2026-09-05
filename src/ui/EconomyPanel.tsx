import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { economySummary } from '@/logic/economyView';
import { reserveLimit } from '@/logic/developmentEngine';
import { Dialog } from './Dialog';

export function EconomyPanel({ onClose }: { onClose: () => void }) {
  const state = useGameStore();
  const economy = economySummary(state);
  const canAct = state.phase === 'actions' && state.actionPoints > 0 && !state.runtime?.notices.length;
  return <Dialog title="Food and workers" onClose={onClose}><article className="economy-card">
    <header className="panel-heading"><div><span className="eyebrow">THE HEARTH LEDGER</span><h1>Food & workers</h1></div><button className="icon-button" aria-label="Close food and workers" onClick={onClose}>×</button></header>
    <div className="ledger-equation"><span><b>{economy.produced.food}</b>produced</span><span>−</span><span><b>{state.resources.population}</b>eaten</span><span>=</span><span className={economy.netFood < 0 ? 'negative' : 'positive'}><b>{economy.netFood > 0 ? '+' : ''}{economy.netFood}</b>food / turn</span></div>
    <p className={economy.starvationIn ? 'food-warning' : 'food-safe'}>{state.resources.food} food stored. {economy.starvationIn ? `Starvation in ${economy.starvationIn} collection${economy.starvationIn === 1 ? '' : 's'} at this population and production.` : 'Current production feeds everyone.'}</p>
    <p>Every person eats 1 food per collection. A shortfall uses stored food; when it cannot cover the meal, one person dies. Surplus production fills the growth meter.</p>
    <h2>Where food comes from</h2>
    <div className="ledger-districts">{economy.districts.map(({ tile, name, yields }) => <div className={`ledger-district ${tile.worked ? '' : 'dormant'}`} key={`${tile.coord.q},${tile.coord.r}`}><span><strong>{name}</strong><small>{tile.worked ? '1 worker · producing' : 'No worker · dormant'} · {yields.food ?? 0} food potential</small></span><b>{tile.worked ? `+${yields.food ?? 0}` : '0'}</b>{(tile.coord.q !== 0 || tile.coord.r !== 0) && <button disabled={!canAct} onClick={() => state.dispatch({ type: 'prioritize', target: tile.coord })}>Prioritize · 1 AP</button>}</div>)}</div>
    <p>Traditions, discoveries and leader: <strong>+{economy.traditions.food ?? 0} food / turn</strong>. The capital is staffed first. Prioritizing a district moves it ahead of other outlying districts when workers are scarce.</p>
    <h2>Production per collection</h2><div className="production-totals">{Object.entries(economy.produced).map(([key, amount]) => <span key={key}><b>+{amount}</b> {key === 'knowledge' ? 'research' : key}</span>)}</div>
    <p>Research reserve: <strong>{state.resources.knowledge}/{reserveLimit(state)}</strong>. Income and event knowledge fund the active project on collection. Unspent knowledge is banked up to this limit. Each discovery needs at least two collections; switching never discards progress.</p>
    <button className="primary-cta" onClick={onClose}>Return to the hearth</button>
  </article></Dialog>;
}
