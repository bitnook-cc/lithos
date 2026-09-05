import React, { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { mapTransitions } from '@/logic/mapPresentation';
import { getBuildingDef } from '@/data/buildings';

/** Remains legible without animation; no game state or action is delayed. */
export function MapFeedback() {
  const [message, setMessage] = useState<{ id: number; text: string } | null>(null);
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const unsubscribe = useGameStore.subscribe((state, before) => {
      if (state.age !== before.age || state.runtime?.runId !== before.runtime?.runId) { clearTimeout(timeout); setMessage(null); return; }
      const changes = mapTransitions(before, state);
      const action = changes.find(t => t.kind === 'build') ?? changes.find(t => t.kind === 'claim') ?? changes.find(t => t.kind === 'survey');
      if (!action) return;
      const revealed = changes.filter(t => t.kind === 'reveal').length;
      const text = action.kind === 'build' ? `${getBuildingDef(action.buildingId!)?.name ?? 'Building'} completed · production active`
        : action.kind === 'claim' ? 'District claimed · border expanded · worker assigned'
        : `District surveyed · resources revealed${revealed ? ` · ${revealed} nearby districts now visible` : ''} · not yet owned`;
      clearTimeout(timeout);
      setMessage({ id: state.runtime!.commandSequence, text });
      timeout = setTimeout(() => setMessage(null), 3800);
    });
    return () => { unsubscribe(); clearTimeout(timeout); };
  }, []);
  return <div className="map-feedback" role="status" aria-live="polite" aria-atomic="true">{message && <span key={message.id}>{message.text}</span>}</div>;
}
