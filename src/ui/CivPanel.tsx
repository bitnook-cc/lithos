import React, { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { ArmyStats } from '@/types/game';
import { getCivTag, getLeaderTrait } from '@/data/tags';
import { formatEffects, getEffectiveArmy } from '@/logic/effectsEngine';
import { getPerk } from '@/data/legacy';

const styles: Record<string, React.CSSProperties> = {
  panel: {
    position: 'absolute', top: 78, left: 0, right: 0, bottom: 0,
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
};

const AXIS_CONFIG = [
  { key: 'military' as const, left: 'Pacifist', right: 'Warlike', color: '#ff4444' },
  { key: 'economy' as const, left: 'Isolationist', right: 'Mercantile', color: '#ffa500' },
  { key: 'knowledge' as const, left: 'Traditional', right: 'Scholarly', color: '#9b59b6' },
];

export function CivPanel() {
  const state = useGameStore();
  const { civ, age } = state;
  const army = getEffectiveArmy(state);
  const currentLeader = civ.leaders[civ.leaders.length - 1];
  const pastLeaders = civ.leaders.slice(0, -1);

  return (
    <div className="full-panel civ-panel" style={styles.panel}>
      {/* Current Leader */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Current Leader</div>
        {currentLeader ? (
          <>
            <div style={styles.leaderName}>{currentLeader.name}</div>
            <div style={styles.leaderAge}>{age.charAt(0).toUpperCase() + age.slice(1)} Age</div>
            <div>
              {currentLeader.traits.map(t => {
                const traitDef = getLeaderTrait(t);
                return (
                  <div key={t} style={{ marginBottom: 6 }}>
                    <span style={styles.trait}>{traitDef?.name ?? t}</span>
                    {traitDef && (
                      <div style={{ fontSize: 11, color: '#888', marginTop: 2, marginLeft: 4 }}>
                        {traitDef.description}
                        {traitDef.effects && traitDef.effects.length > 0 && (
                          <div style={{ color: '#8d8', marginTop: 2 }}>
                            {formatEffects(traitDef.effects).join(', ')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
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
          <div>
            {civ.tags.map(t => {
              const tagDef = getCivTag(t);
              return (
                <div key={t} style={{ marginBottom: 8 }}>
                  <span style={styles.tag}>{tagDef?.name ?? t}</span>
                  {tagDef && (
                    <div style={{ fontSize: 11, color: '#888', marginTop: 2, marginLeft: 4 }}>
                      {tagDef.description}
                      {tagDef.effects && tagDef.effects.length > 0 && (
                        <div style={{ color: '#8d8', marginTop: 2 }}>
                          {formatEffects(tagDef.effects).join(', ')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ fontSize: 12, color: '#666' }}>No tags earned yet</div>
        )}
      </div>

      {/* Army — Radar Chart */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Army</div>
        <ArmyRadar army={army} />
      </div>

      {state.activePerks.length > 0 && <div style={styles.section}>
        <div style={styles.sectionTitle}>Ancestral Memories</div>
        {state.activePerks.map(id => { const perk = getPerk(id); return <div className="civ-memory" key={id}><strong>{perk?.name ?? id}</strong><span>{perk?.description}</span></div>; })}
      </div>}

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Chronicle</div>
        <div className="chronicle-list">{[...state.chronicle].reverse().map(entry => <article className={`chronicle-entry ${entry.tone}`} key={entry.id}><time>{entry.age} · turn {entry.turn}</time><strong>{entry.title}</strong><p>{entry.text}</p></article>)}</div>
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

const STAT_LABELS: { key: keyof ArmyStats; label: string }[] = [
  { key: 'strength', label: 'Strength' },
  { key: 'toughness', label: 'Toughness' },
  { key: 'speed', label: 'Speed' },
  { key: 'stealth', label: 'Stealth' },
  { key: 'morale', label: 'Morale' },
  { key: 'numbers', label: 'Numbers' },
];

const RADAR_SIZE = 280;
const RADAR_CX = RADAR_SIZE / 2;
const RADAR_CY = RADAR_SIZE / 2;
const RADAR_R = 95;
const RADAR_RINGS = 4;
const MAX_STAT = 20; // visual max for scaling

function polarToXY(angle: number, radius: number): { x: number; y: number } {
  // Start from top (-90 deg)
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: RADAR_CX + radius * Math.cos(rad), y: RADAR_CY + radius * Math.sin(rad) };
}

function ArmyRadar({ army }: { army: ArmyStats }) {
  const n = STAT_LABELS.length;
  const angleStep = 360 / n;

  // Outer polygon points (max ring)
  const outerPoints = useMemo(() =>
    STAT_LABELS.map((_, i) => polarToXY(i * angleStep, RADAR_R)),
    [n]
  );

  // Inner polygon points (stat values)
  const statPoints = useMemo(() =>
    STAT_LABELS.map((s, i) => {
      const val = Math.min(army[s.key], MAX_STAT);
      const r = (val / MAX_STAT) * RADAR_R;
      return polarToXY(i * angleStep, r);
    }),
    [army]
  );

  const outerPath = outerPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  const statPath = statPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={RADAR_SIZE} height={RADAR_SIZE} viewBox={`0 0 ${RADAR_SIZE} ${RADAR_SIZE}`}>
        {/* Concentric ring polygons */}
        {Array.from({ length: RADAR_RINGS }, (_, ring) => {
          const r = ((ring + 1) / RADAR_RINGS) * RADAR_R;
          const pts = STAT_LABELS.map((_, i) => polarToXY(i * angleStep, r));
          const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
          return <path key={ring} d={d} fill="none" stroke="#333" strokeWidth={1} />;
        })}

        {/* Axis lines from center to each corner */}
        {outerPoints.map((p, i) => (
          <line key={i} x1={RADAR_CX} y1={RADAR_CY} x2={p.x} y2={p.y} stroke="#333" strokeWidth={1} />
        ))}

        {/* Outer polygon */}
        <path d={outerPath} fill="none" stroke="#555" strokeWidth={1.5} />

        {/* Stat polygon */}
        <path d={statPath} fill="rgba(106, 106, 255, 0.25)" stroke="#6a6aff" strokeWidth={2} />

        {/* Stat dots */}
        {statPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={4.5} fill="#6a6aff" stroke="#fff" strokeWidth={1.5} />
        ))}

        {/* Labels */}
        {STAT_LABELS.map((s, i) => {
          const labelR = RADAR_R + 24;
          const pos = polarToXY(i * angleStep, labelR);
          return (
            <text
              key={s.key}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#aaa"
              fontSize={12}
            >
              {s.label}
            </text>
          );
        })}

        {/* Value labels on dots */}
        {STAT_LABELS.map((s, i) => {
          const val = army[s.key];
          const valR = Math.min(val, MAX_STAT) / MAX_STAT * RADAR_R;
          // Offset label slightly outward from the dot
          const labelPos = polarToXY(i * angleStep, valR + 14);
          return (
            <text
              key={`val_${s.key}`}
              x={labelPos.x}
              y={labelPos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#eee"
              fontSize={10}
              fontWeight="bold"
            >
              {val}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
