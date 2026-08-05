import React from 'react';
import { RivalCiv } from '@/types/game';
import { DiplomacyApproach } from '@/logic/rivalEngine';

export function DiplomacyPanel({ rival, onChoose, onClose }: { rival: RivalCiv; onChoose: (approach: DiplomacyApproach) => void; onClose: () => void }) {
  const mood = rival.disposition >= 30 ? 'Warm' : rival.disposition >= 0 ? 'Wary' : rival.disposition >= -25 ? 'Hostile' : 'Bitter';
  return <div className="modal-backdrop" onClick={onClose}>
    <article className="diplomacy-card" onClick={event => event.stopPropagation()}>
      <div className="eyebrow">FOREIGN COURT · {rival.personality}</div><h2>{rival.name}</h2>
      <div className="disposition"><span>Disposition</span><strong>{mood}</strong><small>{rival.disposition > 0 ? '+' : ''}{rival.disposition}</small></div>
      <p>Choose how your people will be remembered at this frontier.</p>
      <button className="choice-button" onClick={() => onChoose('trade')}><strong>Send a caravan</strong><span>Costs 2 wealth · gain food and materials · improves relations</span></button>
      <button className="choice-button" onClick={() => onChoose('envoy')}><strong>Send an envoy</strong><span>Costs 2 influence · greatly improves relations</span></button>
      <button className="choice-button danger-choice" onClick={() => onChoose('threaten')}><strong>Demand tribute</strong><span>Tests army power · gain materials or lose population</span></button>
      <button className="text-button" onClick={onClose}>Leave the border</button>
    </article>
  </div>;
}
