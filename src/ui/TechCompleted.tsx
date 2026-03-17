import React from 'react';
import { TechNode } from '@/types/game';
import { getBuildingDef } from '@/data/buildings';

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.75)', display: 'flex',
    justifyContent: 'center', alignItems: 'center', zIndex: 25,
  },
  card: {
    background: '#1a1a2e', borderRadius: 12, padding: 28,
    maxWidth: 380, width: '90%', border: '1px solid #6a6aff',
    textAlign: 'center' as const,
  },
  badge: {
    fontSize: 11, textTransform: 'uppercase' as const,
    letterSpacing: 2, color: '#6a6aff', marginBottom: 8,
  },
  name: {
    fontSize: 22, fontWeight: 'bold', color: '#eee', marginBottom: 8,
  },
  desc: {
    fontSize: 13, color: '#aaa', lineHeight: 1.5, marginBottom: 16,
  },
  effectsTitle: {
    fontSize: 11, color: '#888', textTransform: 'uppercase' as const,
    letterSpacing: 1, marginBottom: 6, textAlign: 'left' as const,
  },
  effect: {
    fontSize: 13, color: '#8d8', marginBottom: 3, textAlign: 'left' as const,
  },
  btn: {
    marginTop: 16, padding: '10px 24px', borderRadius: 8, border: 'none',
    background: '#6a6aff', color: '#fff', fontSize: 14, cursor: 'pointer',
  },
};

interface Props {
  tech: TechNode;
  onDismiss: () => void;
}

export function TechCompleted({ tech, onDismiss }: Props) {
  const effects: string[] = [];
  const eff = tech.effects;

  if (eff.resourceBonuses) {
    for (const [key, val] of Object.entries(eff.resourceBonuses)) {
      if (val) {
        const label = key === 'knowledge' ? 'research rate' : key;
        effects.push(`+${val} ${label} per turn`);
      }
    }
  }
  if (eff.armyBonuses) {
    for (const [key, val] of Object.entries(eff.armyBonuses)) {
      if (val) effects.push(`+${val} army ${key}`);
    }
  }
  if (eff.unlocksBuilding) {
    const b = getBuildingDef(eff.unlocksBuilding);
    effects.push(`New building: ${b?.name ?? eff.unlocksBuilding}`);
  }
  if (eff.addsCivTag) effects.push(`New trait: ${eff.addsCivTag}`);
  if (eff.addsLeaderTrait) effects.push(`Leader gains: ${eff.addsLeaderTrait}`);
  if (eff.isAdvance) effects.push('Advancing to next age!');

  return (
    <div style={styles.overlay} onClick={onDismiss}>
      <div style={styles.card} onClick={e => e.stopPropagation()}>
        <div style={styles.badge}>Discovery</div>
        <div style={styles.name}>{tech.name}</div>
        <div style={styles.desc}>{tech.description}</div>

        {effects.length > 0 && (
          <div>
            <div style={styles.effectsTitle}>Effects</div>
            {effects.map((e, i) => (
              <div key={i} style={styles.effect}>{e}</div>
            ))}
          </div>
        )}

        <button style={styles.btn} onClick={onDismiss}>Continue</button>
      </div>
    </div>
  );
}
