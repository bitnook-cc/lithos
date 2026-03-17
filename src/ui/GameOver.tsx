import React from 'react';
import { useGameStore } from '@/store/gameStore';

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.85)', display: 'flex',
    justifyContent: 'center', alignItems: 'center', zIndex: 30,
  },
  card: {
    background: '#1a1a2e', borderRadius: 12, padding: 32,
    maxWidth: 400, width: '90%', textAlign: 'center',
    border: '1px solid #333',
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  reason: { fontSize: 16, color: '#999', marginBottom: 24 },
  btn: {
    padding: '12px 24px', borderRadius: 8, border: 'none',
    background: '#4a4a8a', color: '#eee', fontSize: 16, cursor: 'pointer',
  },
};

export function GameOver() {
  const { gameOver, resetRun, civ, age, turn } = useGameStore();
  if (!gameOver) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={{ ...styles.title, color: gameOver.victory ? '#4caf50' : '#ff4444' }}>
          {gameOver.victory ? 'Victory!' : 'Civilization Collapsed'}
        </div>
        <div style={styles.reason}>{gameOver.reason}</div>
        <div style={{ marginBottom: 16, fontSize: 13, color: '#888' }}>
          <div>Age: {age} | Turn: {turn}</div>
          <div>Leaders: {civ.leaders.map(l => l.name).join(' → ')}</div>
          <div>Tags: {civ.tags.join(', ') || 'None'}</div>
        </div>
        <button style={styles.btn} onClick={resetRun}>New Run</button>
      </div>
    </div>
  );
}
