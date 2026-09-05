import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useMetaStore } from '@/store/metaStore';
import { exportRecovery } from './exportRecovery';

export function SaveStatus() {
  const store = useGameStore();
  const meta = useMetaStore();
  const [confirmRestore, setConfirmRestore] = useState(false);
  if (!store.saveIssue && !meta.saveIssue) return null;
  return <aside className="save-status" role="alert">
    <strong>Save needs attention</strong>
    {store.saveIssue && <p>{store.saveIssue}</p>}
    {meta.saveIssue && <p>Legacy: {meta.saveIssue}</p>}
    <div>
      <button onClick={exportRecovery}>Export progress and recovery copies</button>
      <button onClick={() => { store.retrySave(); meta.retrySave(); }}>Retry saving</button>
      <button onClick={() => { if (confirmRestore) { store.restorePrevious(); setConfirmRestore(false); } else setConfirmRestore(true); }}>{confirmRestore ? 'Confirm: restore the previous turn/action' : 'Restore previous save'}</button>
      {confirmRestore && <button onClick={() => setConfirmRestore(false)}>Cancel restore</button>}
    </div>
  </aside>;
}
