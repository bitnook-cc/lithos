import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { exportRecovery } from './exportRecovery';

const styles: Record<string, React.CSSProperties> = {
  hamburger: {
    position: 'absolute', top: 8, left: 8, zIndex: 25,
    width: 32, height: 32, background: 'rgba(0,0,0,0.6)',
    border: '1px solid #444', borderRadius: 6, cursor: 'pointer',
    display: 'flex', flexDirection: 'column', justifyContent: 'center',
    alignItems: 'center', gap: 3, padding: 6,
  },
  bar: {
    width: 18, height: 2, background: '#ccc', borderRadius: 1,
  },
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.7)', zIndex: 30,
    display: 'flex', justifyContent: 'center', alignItems: 'center',
  },
  menu: {
    background: '#1a1a2e', borderRadius: 12, padding: 24,
    minWidth: 250, border: '1px solid #333',
  },
  title: {
    fontSize: 18, fontWeight: 'bold', marginBottom: 20, color: '#eee',
    textAlign: 'center' as const,
  },
  item: {
    padding: '12px 16px', marginBottom: 8, borderRadius: 8,
    border: '1px solid #444', cursor: 'pointer', color: '#eee',
    background: '#252540', fontSize: 14, textAlign: 'center' as const,
  },
  danger: {
    background: '#4a2020', borderColor: '#8a4444',
  },
};

export function GameMenu() {
  const [open, setOpen] = useState(false);
  const [confirmRestart, setConfirmRestart] = useState(false);
  const resetRun = useGameStore(s => s.resetRun);

  const handleRestart = () => {
    if (!confirmRestart) {
      setConfirmRestart(true);
      return;
    }
    resetRun();
    setOpen(false);
    setConfirmRestart(false);
  };

  return (
    <>
      <div style={styles.hamburger} onClick={() => setOpen(true)}>
        <div style={styles.bar} />
        <div style={styles.bar} />
        <div style={styles.bar} />
      </div>

      {open && (
        <div style={styles.overlay} onClick={() => { setOpen(false); setConfirmRestart(false); }}>
          <div style={styles.menu} onClick={e => e.stopPropagation()}>
            <div style={styles.title}>Lithos</div>
            <button style={styles.item} onClick={exportRecovery}>Export progress and recovery copies</button>
            <div style={styles.item} onClick={() => setOpen(false)}>
              Resume Game
            </div>
            <div
              style={{ ...styles.item, ...styles.danger }}
              onClick={handleRestart}
            >
              {confirmRestart ? 'Are you sure? Click again to confirm' : 'Restart Game'}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
