import React, { useEffect, useState } from 'react';
import { Tile } from '@/types/map';
import { getBuildingDef } from '@/data/buildings';
import { useGameStore } from '@/store/gameStore';

interface HoverState {
  tile: Tile;
  screenX: number;
  screenY: number;
}

const styles: Record<string, React.CSSProperties> = {
  tooltip: {
    position: 'absolute',
    zIndex: 20,
    background: 'rgba(0, 0, 0, 0.9)',
    border: '1px solid #555',
    borderRadius: 6,
    padding: '8px 12px',
    color: '#eee',
    fontSize: 13,
    pointerEvents: 'none',
    minWidth: 120,
    maxWidth: 200,
  },
  type: {
    fontWeight: 'bold',
    textTransform: 'capitalize' as const,
    marginBottom: 4,
  },
  building: {
    color: '#ffd700',
    fontSize: 12,
    marginBottom: 2,
  },
  control: {
    fontSize: 11,
    color: '#aaa',
    marginTop: 4,
  },
};

export function TileTooltip() {
  const [hover, setHover] = useState<HoverState | null>(null);
  const rivals = useGameStore(s => s.rivals);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail.tile) {
        setHover({ tile: detail.tile, screenX: detail.screenX, screenY: detail.screenY });
      } else {
        setHover(null);
      }
    };
    window.addEventListener('tile-hovered', handler);
    return () => window.removeEventListener('tile-hovered', handler);
  }, []);

  if (!hover) return null;

  const { tile, screenX, screenY } = hover;

  if (!tile.visible) return null;

  const buildingDef = tile.building ? getBuildingDef(tile.building) : null;

  let controlText = 'Unclaimed';
  if (tile.controlled) {
    controlText = 'Controlled by you';
  } else if (tile.rivalId) {
    const rival = rivals.find(r => r.id === tile.rivalId);
    controlText = `Controlled by ${rival?.name ?? 'rival'}`;
  }

  return (
    <div style={{
      ...styles.tooltip,
      left: screenX + 16,
      top: screenY - 8,
    }}>
      <div style={styles.type}>{tile.type}</div>
      {buildingDef && <div style={styles.building}>{buildingDef.name}</div>}
      <div style={styles.control}>{controlText}</div>
    </div>
  );
}
