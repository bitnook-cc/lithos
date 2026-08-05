import React from 'react';
import { AgeId } from '@/types/game';
import { getAgeDef } from '@/data/ages';
import { useGameStore } from '@/store/gameStore';

export function AgeIntro({ age, onContinue }: { age: AgeId; onContinue: () => void }) {
  const definition = getAgeDef(age);
  const leader = useGameStore(state => state.civ.leaders[state.civ.leaders.length - 1]);
  return <div className="modal-backdrop age-backdrop">
    <article className="age-card" style={{ '--age-accent': definition.accent } as React.CSSProperties}>
      <div className="age-ordinal">{age === 'stone' ? 'I' : age === 'bronze' ? 'II' : 'III'}</div>
      <div className="eyebrow">A NEW AGE BEGINS</div>
      <h1>{definition.name}</h1>
      <h2>{definition.subtitle}</h2>
      <p>{definition.description}</p>
      <div className="age-leader"><span>Leader of this age</span><strong>{leader?.name ?? 'Unknown'}</strong><small>{leader?.traits.join(' · ')}</small></div>
      <button className="primary-cta" onClick={onContinue}>Enter the {definition.name} <span>→</span></button>
    </article>
  </div>;
}
