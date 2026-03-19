import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { BUILDINGS } from '@/data/buildings';
import { Tile } from '@/types/map';
import { Resources } from '@/types/game';

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.6)', display: 'flex',
    justifyContent: 'center', alignItems: 'center', zIndex: 20,
  },
  menu: {
    background: '#1a1a2e', borderRadius: 12, padding: 20,
    maxWidth: 400, width: '90%', border: '1px solid #333',
  },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  item: {
    padding: '10px 14px', marginBottom: 6, borderRadius: 6,
    border: '1px solid #444', cursor: 'pointer', background: '#252540',
  },
  disabled: { opacity: 0.4, cursor: 'not-allowed' },
};

interface Props {
  tile: Tile;
  onBuild: (buildingId: string) => void;
  onClose: () => void;
}

function canAfford(cost: Partial<Resources>, resources: Resources): boolean {
  return Object.entries(cost).every(([k, v]) =>
    !v || resources[k as keyof Resources] >= v
  );
}

export function BuildMenu({ tile, onBuild, onClose }: Props) {
  const { resources, age } = useGameStore();
  const available = BUILDINGS.filter(b => {
    if (b.id === 'hearthstone') return false; // starting building only
    if (!b.requiredTile || b.requiredTile.includes(tile.type)) return true;
    return false;
  });

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.menu} onClick={e => e.stopPropagation()}>
        <div style={styles.title}>Build on {tile.type}</div>
        {available.map(b => {
          const affordable = canAfford(b.cost, resources);
          return (
            <div
              key={b.id}
              style={{ ...styles.item, ...(affordable ? {} : styles.disabled) }}
              onClick={() => affordable && onBuild(b.id)}
            >
              <div>{b.name}</div>
              <div style={{ fontSize: 11, color: '#999' }}>
                Cost: {Object.entries(b.cost).map(([k, v]) => `${v} ${k}`).join(', ') || 'Free'}
                {' | '}
                Produces: {Object.entries(b.produces).map(([k, v]) => `+${v} ${k}`).join(', ') || 'None'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
