import React from 'react';
import { getFeat, getPerk } from '@/data/legacy';

function rewardText(featId: string): string {
  const reward = getFeat(featId)?.reward;
  const parts: string[] = [];
  for (const [resource, amount] of Object.entries(reward?.resources ?? {})) if (amount) parts.push(`+${amount} ${resource}`);
  for (const [stat, amount] of Object.entries(reward?.army ?? {})) if (amount) parts.push(`+${amount} army ${stat}`);
  if (reward?.addCivTag) parts.push(`new legacy: ${reward.addCivTag}`);
  return parts.join(' · ') || 'The deed strengthens this lineage.';
}

export function FeatUnlocked({ featId, onDismiss }: { featId: string; onDismiss: () => void }) {
  const feat = getFeat(featId);
  const perk = feat ? getPerk(feat.perkId) : undefined;
  if (!feat) return null;
  return <div className="modal-backdrop feat-backdrop"><article className="feat-card">
    <div className="feat-sigil">✦</div><div className="eyebrow">FEAT ACCOMPLISHED</div><h1>{feat.name}</h1><p className="feat-flavor">“{feat.flavor}”</p>
    <div className="current-reward"><span>Immediate reward</span><strong>{rewardText(featId)}</strong></div>
    {perk && <div className="perk-unlock"><span>Unlocked for future runs</span><strong>{perk.name}</strong><small>{perk.description}</small></div>}
    <button className="primary-cta" onClick={onDismiss}>Carve it into memory</button>
  </article></div>;
}
