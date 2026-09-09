import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { openingObjective } from '@/logic/tutorialEngine';
import { needsResearchSelection } from '@/logic/researchView';

export function ObjectivePanel({ onFood, onDistrict, onResearch }: { onFood: () => void; onDistrict: () => void; onResearch: () => void }) {
  const state = useGameStore();
  const objective = openingObjective(state);
  const advance = state.techs.find(t => t.effects.some(e => e.type === 'advance_age'));
  const ready = state.phase === 'actions' && !state.runtime?.notices.length;
  const chooseResearch = needsResearchSelection(state);
  return <section className={`objective-card objective-${objective?.action ?? 'research'}`} aria-label="Current objective">
    <span className="eyebrow">{objective && objective.step < 7 ? `FIRST HEARTH · ${objective.step} / 6` : 'YOUR NEXT HORIZON'}</span>
    <h2>{objective?.title ?? `Work toward ${advance?.name ?? 'a lasting legacy'}`}</h2>
    <p>{objective?.text ?? 'Keep your people fed. Explore optional discoveries, or use the research planner to chart a path to the next age.'}</p>
    <div className="objective-actions">
      {objective?.action === 'food' && <button disabled={!ready} onClick={onFood}>Inspect food</button>}
      {objective?.action === 'district' && <button disabled={!ready} onClick={onDistrict}>Show food district</button>}
      {(!objective || ['research', 'complete'].includes(objective.action)) && <button disabled={!ready} onClick={onResearch}>Open research</button>}
      {objective?.action === 'turn' && <button disabled={!ready} onClick={() => chooseResearch ? onResearch() : state.dispatch({ type: 'endTurn' })}>{chooseResearch ? 'Choose research →' : 'End turn →'}</button>}
      {objective && <button className="quiet-button" disabled={!ready} onClick={() => state.dispatch({ type: 'skipGuide' })}>{objective.step < 7 ? 'Skip guide' : 'Finish guide'}</button>}
    </div>
  </section>;
}
