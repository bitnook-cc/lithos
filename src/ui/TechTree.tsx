import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { canQueue, getTechCost } from '@/logic/techEngine';

const styles: Record<string, React.CSSProperties> = {
  panel: {
    position: 'absolute', top: 50, left: 0, right: 0, bottom: 0,
    background: 'rgba(10,10,20,0.95)', padding: '20px 24px',
    overflowY: 'auto', zIndex: 15,
  },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  tech: {
    padding: '10px 12px', marginBottom: 6, borderRadius: 6,
    border: '1px solid #444', fontSize: 13,
  },
  researched: { background: '#1a3a1a', borderColor: '#4caf50' },
  active: { background: '#2a2a4a', borderColor: '#6a6aff', border: '2px solid #6a6aff' },
  available: { background: '#252540', cursor: 'pointer', borderColor: '#555' },
  locked: { background: '#1a1a1a', opacity: 0.5 },
  progressBar: {
    height: 4, borderRadius: 2, background: '#333', marginTop: 6,
    overflow: 'hidden' as const,
  },
  progressFill: {
    height: '100%', borderRadius: 2, background: '#6a6aff',
    transition: 'width 0.3s',
  },
};

interface Props {
  onResearch: (techId: string) => void;
}

export function TechTree({ onResearch }: Props) {
  const { techs, activeResearch, researchProgress } = useGameStore();

  return (
    <div style={styles.panel}>
      <div style={styles.title}>Research</div>
      {techs.map(tech => {
        const available = canQueue(tech.id, techs);
        const isActive = activeResearch === tech.id;
        const cost = getTechCost(tech.id, techs);

        let style: React.CSSProperties;
        if (tech.researched) {
          style = { ...styles.tech, ...styles.researched };
        } else if (isActive) {
          style = { ...styles.tech, ...styles.active };
        } else if (available) {
          style = { ...styles.tech, ...styles.available };
        } else {
          style = { ...styles.tech, ...styles.locked };
        }

        return (
          <div
            key={tech.id}
            style={style}
            onClick={() => available && !tech.researched && onResearch(tech.id)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{tech.name}</span>
              {tech.researched && <span style={{ color: '#4caf50', fontSize: 12 }}>Researched</span>}
              {isActive && <span style={{ color: '#6a6aff', fontSize: 12 }}>Researching...</span>}
            </div>
            <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
              {tech.researched
                ? ''
                : isActive
                  ? `${researchProgress} / ${cost} knowledge`
                  : `Cost: ${cost} knowledge`
              }
            </div>
            {isActive && (
              <div style={styles.progressBar}>
                <div style={{ ...styles.progressFill, width: `${Math.min(100, (researchProgress / cost) * 100)}%` }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
