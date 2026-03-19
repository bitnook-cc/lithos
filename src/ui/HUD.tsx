import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { calculateCollection } from '@/logic/resourceEngine';
import { collectAllEffects } from '@/logic/effectsEngine';
import { getTechCost } from '@/logic/techEngine';

const styles: Record<string, React.CSSProperties> = {
  hud: {
    position: 'absolute', top: 0, left: 0, right: 0,
    padding: '6px 12px 6px 44px', background: 'rgba(0,0,0,0.85)',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    fontSize: 14, zIndex: 10, color: '#eee',
  },
  resources: { display: 'flex', gap: 12 },
  res: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center' },
  label: { fontSize: 9, color: '#999', textTransform: 'uppercase' as const },
  val: { fontSize: 14, fontWeight: 'bold' },
  delta: { fontSize: 10, marginLeft: 2 },
  right: { display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-end', gap: 2 },
  info: { display: 'flex', gap: 12, alignItems: 'center', fontSize: 12 },
  researchBar: {
    display: 'flex', alignItems: 'center', gap: 6, fontSize: 11,
  },
  progressOuter: {
    width: 80, height: 6, background: '#333', borderRadius: 3,
    overflow: 'hidden' as const,
  },
  progressInner: {
    height: '100%', background: '#6a6aff', borderRadius: 3,
    transition: 'width 0.3s',
  },
  alert: {
    fontSize: 11, color: '#ff6b6b', cursor: 'pointer',
  },
};

// Resources to show in the top bar (knowledge is hidden — it's the research rate)
const VISIBLE_RESOURCES = ['food', 'materials', 'wealth', 'influence', 'population'] as const;

interface HUDProps {
  onOpenResearch?: () => void;
}

export function HUD({ onOpenResearch }: HUDProps) {
  const store = useGameStore();
  const { age, turn, actionPoints, resources, phase, map, techs, activeResearch, researchProgress } = store;

  const effects = collectAllEffects(store);
  const delta = calculateCollection({ map, resources, effects });

  const activeTech = activeResearch ? techs.find(t => t.id === activeResearch) : null;
  const techCost = activeResearch ? getTechCost(activeResearch, techs) : 0;
  const progressPct = techCost > 0 ? Math.min(100, (researchProgress / techCost) * 100) : 0;
  const researchRate = (delta as Record<string, number>).knowledge ?? 0;

  return (
    <div style={styles.hud}>
      <div style={styles.resources}>
        {VISIBLE_RESOURCES.map(key => {
          const val = resources[key];
          const d = (delta as Record<string, number>)[key] ?? 0;
          return (
            <div key={key} style={styles.res}>
              <span style={styles.label}>{key}</span>
              <span>
                <span style={styles.val}>{val}</span>
                {d !== 0 && (
                  <span style={{
                    ...styles.delta,
                    color: d > 0 ? '#6f6' : '#f66',
                  }}>
                    {d > 0 ? `+${d}` : d}
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
      <div style={styles.right}>
        <div style={styles.info}>
          <span>{age.toUpperCase()} AGE</span>
          <span>Turn {turn}</span>
          <span>AP: {actionPoints}</span>
        </div>
        {activeTech ? (
          <div style={{ ...styles.researchBar, cursor: 'pointer' }} onClick={onOpenResearch}>
            <span style={{ color: '#aaa' }}>{activeTech.name}</span>
            <div style={styles.progressOuter}>
              <div style={{ ...styles.progressInner, width: `${progressPct}%` }} />
            </div>
            <span style={{ color: '#888' }}>{researchProgress}/{techCost}</span>
            <span style={{ color: '#9b9bff', fontSize: 10 }}>+{researchRate}/t</span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10, color: '#9b9bff' }}>Research: +{researchRate}/t</span>
            <div style={{ ...styles.alert, cursor: 'pointer' }} onClick={onOpenResearch}>
              No research selected!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
