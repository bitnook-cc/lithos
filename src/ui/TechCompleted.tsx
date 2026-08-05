import React from 'react';
import { TechNode } from '@/types/game';
import { formatEffects } from '@/logic/effectsEngine';
export function TechCompleted({ tech, onDismiss }: { tech: TechNode; onDismiss: () => void }) {
  return <div className="modal-backdrop discovery-backdrop"><article className="discovery-card"><div className="discovery-icon">⌁</div><span className="eyebrow">DISCOVERY COMPLETED</span><h1>{tech.name}</h1><p>{tech.description}</p><div className="effect-pills">{formatEffects(tech.effects).map((effect, index) => <span className="positive" key={index}>{effect}</span>)}</div><button className="primary-cta" onClick={onDismiss}>Change the world</button></article></div>;
}
