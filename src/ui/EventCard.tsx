import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { EventChoice, GameEvent } from '@/types/events';
import { isChoiceAvailable, interpolateText } from '@/logic/eventEngine';
import { Dialog } from './Dialog';

function requirements(choice: EventChoice): string[] {
  const result: string[] = [];
  for (const [resource, amount] of Object.entries(choice.cost ?? {})) result.push(`${amount} ${resource}`);
  for (const [axis, value] of Object.entries(choice.requires.identity ?? {})) result.push(`${axis} ${value}+`);
  for (const [stat, value] of Object.entries(choice.requires.armyStats ?? {})) result.push(`${stat} ${value}+`);
  for (const trait of choice.requires.leaderTraits ?? []) result.push(`${trait} leader`);
  for (const tag of choice.requires.civTags ?? []) result.push(tag);
  for (const perk of choice.requires.activePerks ?? []) result.push(`legacy: ${perk}`);
  return result;
}

export function EventCard({ event, onChoice }: { event: GameEvent; onChoice: (choice: EventChoice) => void }) {
  const state = useGameStore();
  return <Dialog title={event.title ?? 'A turning point'}>
    <article className={`event-card category-${event.category ?? 'legacy'}`}>
      <header><span className="event-mark">{event.category === 'war' ? '⚔' : event.category === 'discovery' ? '✦' : event.category === 'politics' ? '♜' : '◆'}</span><div><span className="eyebrow">{event.category ?? 'turning point'} · {state.age} age</span><h1>{event.title ?? 'A Turning Point'}</h1></div></header>
      <p className="event-narrative">{interpolateText(event.text, state)}</p>
      <div className="choice-list">
        {event.choices.map((choice, index) => {
          const available = isChoiceAvailable(choice, state);
          const needs = requirements(choice);
          return <button key={choice.id} className={`choice-button ${available ? '' : 'locked'}`} disabled={!available} onClick={() => onChoice(choice)}>
            <span className="choice-index">{index + 1}</span><span><strong>{choice.text}</strong>{choice.cost && available && <small>Costs {Object.entries(choice.cost).map(([key, amount]) => `${amount} ${key}`).join(' · ')}</small>}{!available && <small>Requires {needs.join(' · ')}</small>}</span>
          </button>;
        })}
      </div>
      <footer>Locked paths stay visible. Another lineage may be able to choose them.</footer>
    </article>
  </Dialog>;
}
