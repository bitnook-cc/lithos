import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { CULTURE_AXES, cultureAxisPosition, getCultureProfile } from '@/logic/cultureEngine';

export function CultureBanner({ onOpen }: { onOpen: () => void }) {
  const identity = useGameStore(state => state.civ.identity);
  const profile = getCultureProfile(identity);

  return <button className="culture-banner" onClick={onOpen} aria-label={`${profile.name} culture. Open civilization details.`}>
    <div className="culture-profile-copy" key={profile.tone}>
      <header>
        <span className="culture-symbol" aria-hidden="true">{profile.symbol}</span>
        <span><small>Cultural ethos</small><strong>{profile.name}</strong><em>{profile.ideal}</em></span>
      </header>
      <p>{profile.description}</p>
    </div>
    <div className="culture-axes" aria-label="Cultural values">
      {CULTURE_AXES.map(axis => <div className="culture-axis" key={axis.key} title={`${axis.left} ${identity[axis.key] < 0 ? Math.abs(identity[axis.key]) : 0} · ${axis.right} ${identity[axis.key] > 0 ? identity[axis.key] : 0}`}>
        <span>{axis.left}</span>
        <i><b style={{ left: `${cultureAxisPosition(identity[axis.key])}%`, background: axis.color }} /></i>
        <span>{axis.right}</span>
      </div>)}
    </div>
    <footer>View civilization <span>→</span></footer>
  </button>;
}
