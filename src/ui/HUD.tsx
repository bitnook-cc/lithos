import React from 'react';
import { useGameStore } from '@/store/gameStore';

const styles: Record<string, React.CSSProperties> = {
  hud: {
    position: 'absolute', top: 0, left: 0, right: 0,
    padding: '8px 16px', background: 'rgba(0,0,0,0.8)',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    fontSize: 14, zIndex: 10, color: '#eee',
  },
  resources: { display: 'flex', gap: 16 },
  res: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center' },
  label: { fontSize: 10, color: '#999', textTransform: 'uppercase' as const },
  val: { fontSize: 16, fontWeight: 'bold' },
  info: { display: 'flex', gap: 16, alignItems: 'center' },
};

export function HUD() {
  const { age, turn, actionPoints, resources, phase } = useGameStore();

  return (
    <div style={styles.hud}>
      <div style={styles.resources}>
        {Object.entries(resources).map(([key, val]) => (
          <div key={key} style={styles.res}>
            <span style={styles.label}>{key}</span>
            <span style={styles.val}>{val}</span>
          </div>
        ))}
      </div>
      <div style={styles.info}>
        <span>{age.toUpperCase()} AGE</span>
        <span>Turn {turn}</span>
        <span>AP: {actionPoints}</span>
        <span style={{ color: '#999' }}>{phase}</span>
      </div>
    </div>
  );
}
