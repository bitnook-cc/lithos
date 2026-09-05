import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { getAgeDef } from '@/data/ages';
import { Dialog } from './Dialog';

const signed = (value: number) => `${value > 0 ? '+' : ''}${value}`;

export function TurnRecap() {
  const report = useGameStore(state => state.runtime?.lastTurn);
  const [open, setOpen] = useState(false);
  if (!report?.after) return null;
  const food = report.after.food - report.before.food;
  const people = report.after.population - report.before.population;
  return <section className="turn-recap" aria-label="Last turn summary">
    <button className="turn-recap-trigger" onClick={() => setOpen(true)} aria-haspopup="dialog">
      <strong>Turn {report.turn} recap <span>↗</span></strong>
      <span>Food {signed(food)} · People {signed(people)} · {report.research ? report.research.completed ? `${report.research.name} discovered` : `Research +${report.research.invested}` : 'Research banked'}</span>
      {report.rivals && report.rivals !== 'No reported rival activity.' && <small>Frontier news — review the outcome</small>}
    </button>
    {open && <Dialog title="Turn recap" onClose={() => setOpen(false)}><article>
      <header className="panel-heading"><div><span className="eyebrow">{getAgeDef(report.age).name} · Turn {report.turn}</span><h1>Your turn, in review</h1></div><button className="icon-button" aria-label="Close turn recap" onClick={() => setOpen(false)}>×</button></header>
      <p>Changes since you pressed End turn: the event, rival activity, and the following collection. Earlier action costs and new-age starting bonuses are not included.</p>
      <div className="production-totals">{Object.entries(report.after).map(([key, value]) => <span key={key}>{key === 'knowledge' ? 'Research reserve' : key === 'population' ? 'People' : key} <b>{signed(value - report.before[key as keyof typeof report.before])}</b></span>)}</div>
      <h2>Food & people</h2>
      <p>{report.collection ? `${report.collection.foodProduced} food produced; ${report.collection.foodNeeded} needed to feed everyone. Population change during collection: ${signed(report.collection.populationChange)}.` : 'The lineage ended before the next collection.'} Food stored: {report.before.food} → {report.after.food}. People: {report.before.population} → {report.after.population}.</p>
      <h2>Research</h2><p>{report.research ? `${report.research.name}: +${report.research.invested} knowledge invested, ${report.research.progress}/${report.research.cost} funded, ${report.research.ticks} collection${report.research.ticks === 1 ? '' : 's'} completed. ${report.research.completed ? 'Discovery complete.' : 'Work continues next collection.'}` : report.collection && !report.ended ? 'No active project; unused research income was banked up to the reserve limit.' : 'No research collection completed.'}</p>
      <h2>Your decision</h2>{report.event ? <><strong>{report.event.title}</strong><p>{report.event.text}</p><div className="effect-pills">{report.event.effects.map((effect, i) => <span key={i}>{effect}</span>)}</div></> : <p>No event decision this turn.</p>}
      <h2>Beyond your borders</h2><p>{report.rivals ?? 'Rivals did not act before this lineage ended.'}</p>
      {report.ended && <p className="food-warning">{report.ended}</p>}
      <button className="primary-cta" onClick={() => setOpen(false)}>Return to the map</button>
    </article></Dialog>}
  </section>;
}
