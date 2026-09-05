import React from 'react';
import { Dialog } from './Dialog';
import { useGameStore } from '@/store/gameStore';
import { useMetaStore } from '@/store/metaStore';
import { getFeat } from '@/data/legacy';
export function GameOver() {
  const state = useGameStore();
  const meta = useMetaStore();
  if (!state.gameOver) return null;
  return <Dialog title={state.gameOver.victory ? 'The lineage endures' : 'The lineage ends'}><article className={`ending-card ${state.gameOver.victory ? 'victory' : 'defeat'}`}><span className="eyebrow">{state.gameOver.victory ? 'THE LINEAGE ENDURES' : 'THE LINEAGE ENDS'}</span><h1>{state.gameOver.victory ? 'A Civilization Remembered' : 'Ashes Become Memory'}</h1><p className="ending-reason">{state.gameOver.reason}</p><div className="run-metrics"><div><strong>{state.age}</strong><span>final age</span></div><div><strong>{state.turn}</strong><span>final turn</span></div><div><strong>{state.stats.choicesMade}</strong><span>choices</span></div><div><strong>{state.stats.landmarksDiscovered}</strong><span>landmarks</span></div><div><strong>{state.featsEarned.length}</strong><span>feats</span></div></div>{state.featsEarned.length > 0 && <section><span className="eyebrow">DEEDS CARVED IN STONE</span><div className="ending-feats">{state.featsEarned.map(id => <span key={id}>{getFeat(id)?.name ?? id}</span>)}</div></section>}<p className="legacy-note">These memories now belong to every future lineage. {meta.unlockedPerks.length} ancestral perks are available.</p><button className="primary-cta" onClick={state.resetRun}>Begin another lineage <span>→</span></button></article></Dialog>;
}
