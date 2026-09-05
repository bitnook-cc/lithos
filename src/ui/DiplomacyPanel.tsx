import React from 'react';
import { RivalCiv } from '@/types/game';
import { DiplomacyApproach } from '@/logic/rivalEngine';
import { Dialog } from './Dialog';
import { useGameStore } from '@/store/gameStore';

export function DiplomacyPanel({ rival, onChoose, onClose }: { rival: RivalCiv; onChoose: (approach: DiplomacyApproach) => void; onClose: () => void }) {
  const mood = rival.disposition >= 30 ? 'Warm' : rival.disposition >= 0 ? 'Wary' : rival.disposition >= -25 ? 'Hostile' : 'Bitter';
  const resources = useGameStore(state => state.resources);
  return <Dialog title={`Approach ${rival.name}`} onClose={onClose}>
    <article className="diplomacy-card" onClick={event => event.stopPropagation()}>
      <div className="eyebrow">FOREIGN COURT · {rival.personality}</div><h2>{rival.name}</h2>
      <div className="disposition"><span>Disposition</span><strong>{mood}</strong><small>{rival.disposition > 0 ? '+' : ''}{rival.disposition}</small></div>
      <p>Choose how your people will be remembered at this frontier.</p>
      <button className="choice-button" disabled={resources.wealth < 2} onClick={() => onChoose('trade')}><strong>Send a caravan</strong><span>1 AP + 2 wealth · gain food and materials · improves relations</span></button>
      <button className="choice-button" disabled={resources.influence < 2} onClick={() => onChoose('envoy')}><strong>Send an envoy</strong><span>1 AP + 2 influence · greatly improves relations</span></button>
      <button className="choice-button danger-choice" onClick={() => onChoose('threaten')}><strong>Demand tribute</strong><span>Tests army power · gain materials or lose population</span></button>
      <button className="text-button" onClick={onClose}>Leave the border</button>
    </article>
  </Dialog>;
}
