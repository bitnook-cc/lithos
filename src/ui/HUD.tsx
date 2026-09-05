import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { calculateCollection } from '@/logic/resourceEngine';
import { collectAllEffects } from '@/logic/effectsEngine';
import { getTechCost } from '@/logic/techEngine';
import { growthThreshold } from '@/logic/turnEngine';
import { getAgeDef } from '@/data/ages';
import { getAvailablePopulation, getExplorationLevel, getReservedPopulation } from '@/logic/populationEngine';
import { researchEstimate, reserveLimit } from '@/logic/developmentEngine';
import { economySummary } from '@/logic/economyView';

const RESOURCE_LABELS = { food: 'Food', materials: 'Material', wealth: 'Wealth', influence: 'Influence' } as const;
const RESOURCE_SIGILS = { food: '◒', materials: '◆', wealth: '●', influence: '✦' } as const;

export function HUD({ onOpenResearch, onOpenEconomy }: { onOpenResearch?: () => void; onOpenEconomy?: () => void }) {
  const state = useGameStore();
  const delta = calculateCollection({ map: state.map, resources: state.resources, effects: collectAllEffects(state) });
  const activeTech = state.activeResearch ? state.techs.find(tech => tech.id === state.activeResearch) : null;
  const cost = activeTech ? getTechCost(activeTech.id, state.techs) : 0;
  const researchRate = delta.knowledge ?? 0;
  const growthTarget = growthThreshold(state.resources.population);
  const age = getAgeDef(state.age);
  const capitalName = state.map.find(tile => tile.settlementName)?.settlementName;
  const assignedPopulation = getReservedPopulation(state.map);
  const availablePopulation = getAvailablePopulation(state);
  const explorationLevel = getExplorationLevel(state);
  const economy = economySummary(state);

  return <header className="game-hud" style={{ '--age-accent': age.accent } as React.CSSProperties}>
    <div className="hud-era"><span className="eyebrow">{age.name}</span><strong>{capitalName ?? age.subtitle}</strong><small>{age.subtitle} · Turn {state.turn}/{age.turnsPerAge} · <b>{state.phase}</b></small></div>
    <div className="resource-strip">
      {(Object.keys(RESOURCE_LABELS) as (keyof typeof RESOURCE_LABELS)[]).map(key => {
        const rawDelta = delta[key] ?? 0;
        const net = key === 'food' ? rawDelta - state.resources.population : rawDelta;
        return <button className="resource-chip" key={key} onClick={onOpenEconomy} aria-label={`${RESOURCE_LABELS[key]} ${state.resources[key]}, ${net >= 0 ? 'plus' : 'minus'} ${Math.abs(net)} per turn. Open production breakdown`}><i>{RESOURCE_SIGILS[key]}</i><span><small>{RESOURCE_LABELS[key]}</small><strong>{state.resources[key]}</strong></span><em className={net >= 0 ? 'positive' : 'negative'}>{net >= 0 ? '+' : ''}{net}/turn</em></button>;
      })}
      <button className="resource-chip population" onClick={onOpenEconomy} title={`${assignedPopulation} owned districts · ${availablePopulation} available · growth ${state.growthProgress}/${growthTarget}`}><i>♟</i><span><small>People</small><strong>{state.resources.population}</strong></span><em>{state.map.filter(t => t.worked).length} working</em></button>
    </div>
    <button className={`research-chip ${activeTech ? '' : 'attention'}`} onClick={onOpenResearch}>
      <span className="eyebrow">RESEARCH · +{researchRate}/turn</span>
      <strong>{activeTech?.name ?? 'Choose a discovery'}</strong>
      <small>{activeTech ? `~${researchEstimate(state, activeTech.id, researchRate)} turn${researchEstimate(state, activeTech.id, researchRate) === 1 ? '' : 's'} · ` : ''}Reserve {state.resources.knowledge}/{reserveLimit(state)}</small>
      {activeTech && <span className="mini-progress"><i style={{ width: `${Math.min(100, state.researchProgress / cost * 100)}%` }} /></span>}
    </button>
    <div className="ap-orbs" aria-label={`${state.actionPoints} action points`}>{Array.from({ length: state.maxActionPoints }, (_, index) => <i key={index} className={index < state.actionPoints ? 'filled' : ''} />)}<small>Actions · Survey {explorationLevel}</small></div>
    {economy.starvationIn && economy.starvationIn <= 3 && <button className="hunger-alert" onClick={onOpenEconomy}>Food shortfall · starvation {economy.starvationIn === 1 ? 'next collection' : `in ~${economy.starvationIn} collections`} →</button>}
  </header>;
}
