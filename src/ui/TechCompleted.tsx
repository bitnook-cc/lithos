import React from 'react';
import { Dialog } from './Dialog';
import { TechNode } from '@/types/game';
import { formatEffects } from '@/logic/effectsEngine';
export function TechCompleted({ tech, onDismiss }: { tech: TechNode; onDismiss: () => void }) {
  return <Dialog title={`Discovery completed: ${tech.name}`}><article className="discovery-card discovery-arrival"><div className="discovery-icon" aria-hidden="true">⌁</div><span className="eyebrow">DISCOVERY COMPLETED</span><h1>{tech.name}</h1><p>{tech.description}</p><div className="effect-pills">{formatEffects(tech.effects).map((effect, index) => <span className="positive" style={{ '--arrival-delay': `${Math.min(index, 6) * 55 + 100}ms` } as React.CSSProperties} key={index}>{effect}</span>)}</div><button className="primary-cta" onClick={onDismiss}>Change the world</button></article></Dialog>;
}
