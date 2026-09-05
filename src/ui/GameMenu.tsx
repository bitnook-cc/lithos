import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { exportRecovery } from './exportRecovery';
import { Dialog } from './Dialog';
import { useReducedMotion, setReducedMotion } from './motionPreference';

export function GameMenu() {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const reset = useGameStore(state => state.resetRun);
  const reduced = useReducedMotion();
  const close = () => { setOpen(false); setConfirm(false); };
  return <><button className="game-menu-button" aria-label="Open game menu" onClick={() => setOpen(true)}>☰</button>{open && <Dialog title="Lithos menu" onClose={close}><article className="menu-card"><span className="eyebrow">LITHOS</span><h1>The council rests</h1><button className="primary-cta" onClick={close}>Resume game</button><label className="motion-toggle"><input type="checkbox" checked={reduced} onChange={event => setReducedMotion(event.target.checked)} /><span>Reduce motion<small>Keep confirmations, skip movement. Your device's reduced-motion preference is always respected.</small></span></label><button className="action-button" onClick={exportRecovery}>Export progress and recovery copies</button><button className="action-button" onClick={() => { if (!confirm) setConfirm(true); else { reset(); close(); } }}>{confirm ? 'Confirm restart — leave this lineage' : 'Restart lineage'}</button>{confirm && <button className="text-button" onClick={() => setConfirm(false)}>Keep this lineage</button>}</article></Dialog>}</>;
}
