import React from 'react';
import { Dialog } from './Dialog';
export interface EffectSummaryData { choiceText: string; outcomeText?: string; effects: string[]; }
const color = (effect: string) => effect.startsWith('-') || effect.includes(' -') ? 'negative' : effect.startsWith('+') || effect.includes(' +') || effect.startsWith('Feat') || effect.startsWith('New') ? 'positive' : '';
export function EffectSummary({ data, onDismiss }: { data: EffectSummaryData; onDismiss: () => void }) {
  return <Dialog title="The consequence"><article className="result-card"><div className="result-rune">◇</div><span className="eyebrow">THE CONSEQUENCE</span><h2>{data.choiceText}</h2>{data.outcomeText && <p>{data.outcomeText}</p>}{data.effects.length > 0 && <div className="effect-pills">{data.effects.map((effect, index) => <span className={color(effect)} key={index}>{effect}</span>)}</div>}<button className="primary-cta" onClick={onDismiss}>Continue</button></article></Dialog>;
}
