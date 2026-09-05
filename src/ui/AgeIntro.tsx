import React from 'react';
import { AgeId } from '@/types/game';
import { getAgeDef } from '@/data/ages';
import { useGameStore } from '@/store/gameStore';
import { Dialog } from './Dialog';

export function AgeIntro({ age, onContinue }: { age: AgeId; onContinue: () => void }) {
  const definition = getAgeDef(age);
  const leader = useGameStore(state => state.civ.leaders[state.civ.leaders.length - 1]);
  const inheritance = useGameStore(state => state.development?.inheritance);
  return <Dialog title={`${definition.name}: a new age`} className="age-backdrop">
    <article className="age-card" style={{ '--age-accent': definition.accent } as React.CSSProperties}>
      <div className="age-ordinal">{age === 'stone' ? 'I' : age === 'bronze' ? 'II' : 'III'}</div>
      <div className="eyebrow">A NEW AGE BEGINS</div>
      <h1>{definition.name}</h1>
      <h2>{definition.subtitle}</h2>
      <p>{definition.description}</p>
      {inheritance && <section className="inheritance-summary"><h3>What your people carry forward</h3><p>{inheritance.text}</p><div className="production-totals"><span>{inheritance.districts} outlying {inheritance.districts === 1 ? 'district' : 'districts'}</span><span>{inheritance.buildings} {inheritance.buildings === 1 ? 'building' : 'buildings'}</span><span>{inheritance.discoveries} discoveries</span><span>{inheritance.foodPerTurn} food produced / turn</span></div></section>}
      <div className="age-leader"><span>Leader of this age</span><strong>{leader?.name ?? 'Unknown'}</strong><small>{leader?.traits.join(' · ')}</small></div>
      <button className="primary-cta" onClick={onContinue}>Enter the {definition.name} <span>→</span></button>
    </article>
  </Dialog>;
}
