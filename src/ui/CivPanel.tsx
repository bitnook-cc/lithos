import React from 'react';
import { useGameStore } from '@/store/gameStore';

const styles: Record<string, React.CSSProperties> = {
  panel: {
    position: 'absolute', top: 50, left: 0, right: 0, bottom: 48,
    background: 'rgba(10,10,20,0.95)', zIndex: 15,
    overflowY: 'auto', padding: '20px 24px',
    color: '#eee',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13, color: '#888', textTransform: 'uppercase' as const,
    letterSpacing: 1, marginBottom: 8, borderBottom: '1px solid #333',
    paddingBottom: 4,
  },
  leaderName: {
    fontSize: 20, fontWeight: 'bold', marginBottom: 4,
  },
  leaderAge: {
    fontSize: 12, color: '#999', marginBottom: 8,
  },
  trait: {
    display: 'inline-block', padding: '3px 10px', borderRadius: 12,
    background: '#2a2a4a', border: '1px solid #444', fontSize: 12,
    marginRight: 6, marginBottom: 4,
  },
  tag: {
    display: 'inline-block', padding: '3px 10px', borderRadius: 12,
    background: '#1a3a2a', border: '1px solid #3a6a4a', fontSize: 12,
    marginRight: 6, marginBottom: 4,
  },
  axis: {
    display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
    fontSize: 13,
  },
  axisLabel: {
    width: 80, fontSize: 11, color: '#999', textAlign: 'right' as const,
  },
  axisBar: {
    flex: 1, height: 8, background: '#222', borderRadius: 4,
    position: 'relative' as const, overflow: 'hidden' as const,
  },
  axisLabelRight: {
    width: 80, fontSize: 11, color: '#999',
  },
  pastLeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '6px 0', borderBottom: '1px solid #222', fontSize: 13,
  },
  armyStat: {
    display: 'flex', justifyContent: 'space-between', padding: '4px 0',
    fontSize: 13,
  },
};

const AXIS_CONFIG = [
  { key: 'military' as const, left: 'Pacifist', right: 'Warlike', color: '#ff4444' },
  { key: 'economy' as const, left: 'Isolationist', right: 'Mercantile', color: '#ffa500' },
  { key: 'knowledge' as const, left: 'Traditional', right: 'Scholarly', color: '#9b59b6' },
];

export function CivPanel() {
  const { civ, army, age } = useGameStore();
  const currentLeader = civ.leaders[civ.leaders.length - 1];
  const pastLeaders = civ.leaders.slice(0, -1);

  return (
    <div style={styles.panel}>
      {/* Current Leader */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Current Leader</div>
        {currentLeader ? (
          <>
            <div style={styles.leaderName}>{currentLeader.name}</div>
            <div style={styles.leaderAge}>{age.charAt(0).toUpperCase() + age.slice(1)} Age</div>
            <div>
              {currentLeader.traits.map(t => (
                <span key={t} style={styles.trait}>{t}</span>
              ))}
              {currentLeader.traits.length === 0 && (
                <span style={{ fontSize: 12, color: '#666' }}>No traits</span>
              )}
            </div>
          </>
        ) : (
          <div style={{ color: '#666' }}>No leader</div>
        )}
      </div>

      {/* Cultural Identity */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Cultural Identity</div>
        {AXIS_CONFIG.map(({ key, left, right, color }) => {
          const val = civ.identity[key];
          const pct = (val + 100) / 200 * 100; // -100..100 → 0..100%
          return (
            <div key={key} style={styles.axis}>
              <div style={styles.axisLabel}>{left}</div>
              <div style={styles.axisBar}>
                {/* Center line */}
                <div style={{
                  position: 'absolute', left: '50%', top: 0, bottom: 0,
                  width: 1, background: '#555',
                }} />
                {/* Indicator dot */}
                <div style={{
                  position: 'absolute', left: `${pct}%`, top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 10, height: 10, borderRadius: '50%',
                  background: color, border: '1px solid #fff',
                }} />
              </div>
              <div style={styles.axisLabelRight}>{right}</div>
              <div style={{ width: 30, textAlign: 'right' as const, fontSize: 11, color: '#aaa' }}>
                {val > 0 ? '+' : ''}{val}
              </div>
            </div>
          );
        })}
      </div>

      {/* Civilization Tags */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Civilization Tags</div>
        {civ.tags.length > 0 ? (
          <div>{civ.tags.map(t => <span key={t} style={styles.tag}>{t}</span>)}</div>
        ) : (
          <div style={{ fontSize: 12, color: '#666' }}>No tags earned yet</div>
        )}
      </div>

      {/* Army */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Army</div>
        {Object.entries(army).map(([key, val]) => (
          <div key={key} style={styles.armyStat}>
            <span style={{ color: '#999' }}>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
            <span>{val}</span>
          </div>
        ))}
      </div>

      {/* Leader Lineage */}
      {pastLeaders.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Past Leaders</div>
          {pastLeaders.map((leader, i) => (
            <div key={i} style={styles.pastLeader}>
              <span>{leader.name}</span>
              <span style={{ color: '#888', fontSize: 12 }}>
                {leader.traits.join(', ')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
