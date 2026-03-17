import React from 'react';

export interface EffectSummaryData {
  choiceText: string;
  outcomeText?: string;
  effects: string[];
}

interface Props {
  data: EffectSummaryData;
  onDismiss: () => void;
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
  },
  card: {
    background: '#1a1a2e',
    border: '1px solid #444',
    borderRadius: 10,
    padding: '24px 32px',
    maxWidth: 400,
    minWidth: 280,
    color: '#eee',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#fff',
  },
  outcome: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#ccc',
    marginBottom: 12,
    lineHeight: '1.4',
  },
  effectsList: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 16px 0',
  },
  effect: {
    fontSize: 13,
    padding: '3px 0',
  },
  button: {
    padding: '8px 24px',
    borderRadius: 6,
    border: 'none',
    background: '#4a8a4a',
    color: '#fff',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 'bold',
    width: '100%',
  },
};

function effectColor(effect: string): string {
  if (effect.startsWith('+') || effect.startsWith('New tag') || effect.startsWith('Military +') || effect.startsWith('Economy +') || effect.startsWith('Knowledge +')) {
    return '#6f6';
  }
  if (effect.startsWith('-') || effect.startsWith('Military -') || effect.startsWith('Economy -') || effect.startsWith('Knowledge -')) {
    return '#f66';
  }
  return '#ccc';
}

export function EffectSummary({ data, onDismiss }: Props) {
  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.title}>{data.choiceText}</div>
        {data.outcomeText && <div style={styles.outcome}>{data.outcomeText}</div>}
        {data.effects.length > 0 && (
          <ul style={styles.effectsList}>
            {data.effects.map((eff, i) => (
              <li key={i} style={{ ...styles.effect, color: effectColor(eff) }}>{eff}</li>
            ))}
          </ul>
        )}
        <button style={styles.button} onClick={onDismiss}>Continue</button>
      </div>
    </div>
  );
}
