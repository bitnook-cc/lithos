import React from 'react';
import { useGameStore } from '@/store/gameStore';

const styles: Record<string, React.CSSProperties> = {
  panel: {
    position: 'absolute', left: 0, bottom: 0,
    background: 'rgba(0,0,0,0.85)', padding: 12,
    borderRadius: '0 8px 0 0', zIndex: 10, fontSize: 12,
    border: '1px solid #333', borderLeft: 'none', borderBottom: 'none',
  },
  title: { fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  stat: { display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 2 },
};

export function ArmyPanel() {
  const { army } = useGameStore();

  return (
    <div style={styles.panel}>
      <div style={styles.title}>Army</div>
      {Object.entries(army).map(([key, val]) => (
        <div key={key} style={styles.stat}>
          <span style={{ color: '#999' }}>{key}</span>
          <span>{val}</span>
        </div>
      ))}
    </div>
  );
}
