import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { GameEvent, EventChoice } from '@/types/events';
import { isChoiceAvailable, interpolateText } from '@/logic/eventEngine';

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.7)', display: 'flex',
    justifyContent: 'center', alignItems: 'center', zIndex: 20,
  },
  card: {
    background: '#1a1a2e', borderRadius: 12, padding: 24, maxWidth: 500,
    width: '90%', border: '1px solid #333',
  },
  text: { fontSize: 16, lineHeight: 1.6, marginBottom: 20, color: '#ddd' },
  choice: {
    padding: '12px 16px', marginBottom: 8, borderRadius: 8,
    border: '1px solid #444', cursor: 'pointer', color: '#eee',
    background: '#252540', transition: 'background 0.2s',
  },
  disabled: { opacity: 0.4, cursor: 'not-allowed', background: '#1a1a2e' },
  req: { fontSize: 11, color: '#ff6b6b', marginTop: 4 },
};

interface Props {
  event: GameEvent;
  onChoice: (choice: EventChoice) => void;
}

export function EventCard({ event, onChoice }: Props) {
  const state = useGameStore();
  const text = interpolateText(event.text, state);

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.text}>{text}</div>
        {event.choices.map(choice => {
          const available = isChoiceAvailable(choice, state);
          return (
            <div
              key={choice.id}
              style={{ ...styles.choice, ...(available ? {} : styles.disabled) }}
              onClick={() => available && onChoice(choice)}
            >
              {choice.text}
              {!available && (
                <div style={styles.req}>
                  {choice.requires.identity && Object.entries(choice.requires.identity).map(([k, v]) =>
                    `Requires ${k} >= ${v}`
                  ).join(', ')}
                  {choice.requires.armyStats && Object.entries(choice.requires.armyStats).map(([k, v]) =>
                    `Requires ${k} >= ${v}`
                  ).join(', ')}
                  {choice.requires.leaderTraits?.map(t => `Requires trait: ${t}`).join(', ')}
                  {choice.requires.civTags?.map(t => `Requires: ${t}`).join(', ')}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
