import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { canResearch } from '@/logic/techEngine';
import { TechNode } from '@/types/game';

const styles: Record<string, React.CSSProperties> = {
  panel: {
    position: 'absolute', right: 0, top: 60, bottom: 60,
    width: 250, background: 'rgba(0,0,0,0.85)', padding: 16,
    overflowY: 'auto', zIndex: 10, borderLeft: '1px solid #333',
  },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  tech: {
    padding: '8px 12px', marginBottom: 6, borderRadius: 6,
    border: '1px solid #444', fontSize: 13,
  },
  researched: { background: '#1a3a1a', borderColor: '#4caf50' },
  available: { background: '#2a2a4a', cursor: 'pointer', borderColor: '#6a6aff' },
  locked: { background: '#1a1a1a', opacity: 0.5 },
};

interface Props {
  onResearch: (techId: string) => void;
}

export function TechTree({ onResearch }: Props) {
  const { techs, resources } = useGameStore();

  return (
    <div style={styles.panel}>
      <div style={styles.title}>Research</div>
      {techs.map(tech => {
        const available = canResearch(tech.id, techs, resources);
        const style = tech.researched
          ? { ...styles.tech, ...styles.researched }
          : available
            ? { ...styles.tech, ...styles.available }
            : { ...styles.tech, ...styles.locked };

        return (
          <div
            key={tech.id}
            style={style}
            onClick={() => available && onResearch(tech.id)}
          >
            <div>{tech.name}</div>
            <div style={{ fontSize: 11, color: '#999' }}>
              {tech.researched ? '✓ Researched' : `Cost: ${tech.cost} knowledge`}
            </div>
          </div>
        );
      })}
    </div>
  );
}
