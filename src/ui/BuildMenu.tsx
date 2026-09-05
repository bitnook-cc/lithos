import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { BUILDINGS, getBuildingDef } from '@/data/buildings';
import { Tile } from '@/types/map';
import { Resources } from '@/types/game';
import { getUnlockedBuildings } from '@/logic/buildingEngine';

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.6)', display: 'flex',
    justifyContent: 'center', alignItems: 'center', zIndex: 20,
  },
  menu: {
    background: '#1a1a2e', borderRadius: 12, padding: 20,
    maxWidth: 400, width: '90%', border: '1px solid #333',
    maxHeight: '80vh', overflowY: 'auto' as const,
  },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  subtitle: { fontSize: 12, color: '#999', marginBottom: 8 },
  item: {
    padding: '10px 14px', marginBottom: 6, borderRadius: 6,
    border: '1px solid #444', cursor: 'pointer', background: '#252540',
  },
  upgradeItem: {
    padding: '10px 14px', marginBottom: 6, borderRadius: 6,
    border: '1px solid #6a6a44', cursor: 'pointer', background: '#2a2a30',
  },
  disabled: { opacity: 0.4, cursor: 'not-allowed' },
  divider: { borderTop: '1px solid #333', margin: '12px 0' },
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
  const store = useGameStore();
  const { resources } = store;

  const unlockedIds = getUnlockedBuildings(store);

  const currentBuilding = tile.building ? getBuildingDef(tile.building) : null;

  // New buildings (no upgradesFrom, not hearthstone, tile compatible, unlocked)
  const newBuildings = BUILDINGS.filter(b => {
    if (b.id === 'hearthstone') return false;
    if (b.upgradesFrom) return false;
    if (b.requiredTile && !b.requiredTile.includes(tile.type)) return false;
    // Must be unlocked by a tech
    if (!unlockedIds.has(b.id)) return false;
    return true;
  });

  // Upgrade buildings (upgradesFrom matches current building, unlocked)
  const upgrades = currentBuilding ? BUILDINGS.filter(b => {
    if (!b.upgradesFrom) return false;
    if (b.upgradesFrom !== currentBuilding.id) return false;
    if (b.requiredTile && !b.requiredTile.includes(tile.type)) return false;
    if (!unlockedIds.has(b.id)) return false;
    return true;
  }) : [];

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.menu} onClick={e => e.stopPropagation()}>
        <div style={styles.title}>
          {currentBuilding ? `${currentBuilding.name} on ${tile.type}` : `Build on ${tile.type}`}
        </div>

        {/* Upgrades */}
        {upgrades.length > 0 && (
          <>
            <div style={styles.subtitle}>Upgrades available</div>
            {upgrades.map(b => {
              const affordable = canAfford(b.cost, resources);
              return (
                <div
                  key={b.id}
                  style={{ ...styles.upgradeItem, ...(affordable ? {} : styles.disabled) }}
                  onClick={() => affordable && onBuild(b.id)}
                >
                  <div style={{ color: '#dda' }}>
                    {currentBuilding?.name} → <strong>{b.name}</strong>
                  </div>
                  <div style={{ fontSize: 11, color: '#999' }}>
                    Cost: {Object.entries(b.cost).map(([k, v]) => `${v} ${k}`).join(', ') || 'Free'}
                    {' | '}
                    Produces: {Object.entries(b.produces).map(([k, v]) => `+${v} ${k}`).join(', ') || 'None'}
                    {b.armyBonuses ? ' | Army: ' + Object.entries(b.armyBonuses).map(([k, v]) => `+${v} ${k}`).join(', ') : ''}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* New buildings (only if tile is empty) */}
        {!currentBuilding && (
          <>
            {newBuildings.length > 0 ? newBuildings.map(b => {
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
                    {b.armyBonuses ? ' | Army: ' + Object.entries(b.armyBonuses).map(([k, v]) => `+${v} ${k}`).join(', ') : ''}
                  </div>
                </div>
              );
            }) : (
              <div style={{ fontSize: 12, color: '#666', padding: 8 }}>No buildings available. Research more technologies.</div>
            )}
          </>
        )}

        {/* Show upgrade hint if building exists but no upgrades available */}
        {currentBuilding && upgrades.length === 0 && (
          <div style={{ fontSize: 12, color: '#666', padding: 8 }}>No upgrades available yet. Research more technologies.</div>
        )}
      </div>
    </div>
  );
}
