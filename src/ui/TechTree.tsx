import React, { useMemo, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { canQueue, getTechCost } from '@/logic/techEngine';
import { TechNode } from '@/types/game';
import { formatEffects, getAgeResearchMomentum } from '@/logic/effectsEngine';
import { getAgeDef } from '@/data/ages';

const NODE_W = 140;
const NODE_H = 70;
const GAP_X = 40;
const GAP_Y = 24;

interface LayoutNode {
  tech: TechNode;
  col: number;
  row: number;
  x: number;
  y: number;
}

function layoutTechs(techs: TechNode[]): LayoutNode[] {
  const techMap = new Map(techs.map(t => [t.id, t]));
  const depths = new Map<string, number>();

  function getDepth(id: string): number {
    if (depths.has(id)) return depths.get(id)!;
    const tech = techMap.get(id);
    if (!tech || tech.requires.length === 0) {
      depths.set(id, 0);
      return 0;
    }
    const maxParent = Math.max(...tech.requires.map(r => getDepth(r)));
    const d = maxParent + 1;
    depths.set(id, d);
    return d;
  }

  techs.forEach(t => getDepth(t.id));

  const columns = new Map<number, TechNode[]>();
  for (const tech of techs) {
    const col = depths.get(tech.id) ?? 0;
    if (!columns.has(col)) columns.set(col, []);
    columns.get(col)!.push(tech);
  }

  const nodes: LayoutNode[] = [];
  for (const [col, colTechs] of columns) {
    colTechs.forEach((tech, row) => {
      nodes.push({ tech, col, row, x: col * (NODE_W + GAP_X), y: row * (NODE_H + GAP_Y) });
    });
  }

  const maxRows = Math.max(...Array.from(columns.values()).map(c => c.length));
  for (const node of nodes) {
    const colSize = columns.get(node.col)!.length;
    const offset = ((maxRows - colSize) * (NODE_H + GAP_Y)) / 2;
    node.y += offset;
  }

  return nodes;
}

interface Props {
  onResearch: (techId: string) => void;
}

export function TechTree({ onResearch }: Props) {
  const { age, turn, techs, activeResearch, researchProgress } = useGameStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const ageDefinition = getAgeDef(age);

  const layout = useMemo(() => layoutTechs(techs), [techs]);
  const nodeMap = useMemo(() => new Map(layout.map(n => [n.tech.id, n])), [layout]);

  const lines = useMemo(() => {
    const result: { x1: number; y1: number; x2: number; y2: number; researched: boolean }[] = [];
    for (const node of layout) {
      for (const reqId of node.tech.requires) {
        const parent = nodeMap.get(reqId);
        if (parent) {
          result.push({
            x1: parent.x + NODE_W,
            y1: parent.y + NODE_H / 2,
            x2: node.x,
            y2: node.y + NODE_H / 2,
            researched: parent.tech.researched && node.tech.researched,
          });
        }
      }
    }
    return result;
  }, [layout, nodeMap]);

  const totalW = Math.max(...layout.map(n => n.x + NODE_W)) + 40;
  const totalH = Math.max(...layout.map(n => n.y + NODE_H)) + 40;

  const expandedTech = expandedId ? techs.find(t => t.id === expandedId) : null;

  return (
    <div className="full-panel tech-tree-panel" style={{
      position: 'absolute', top: 78, left: 0, right: 0, bottom: 0,
      background: 'rgba(10,10,20,0.95)', zIndex: 15,
      overflow: 'auto', padding: 20,
    }}>
      <header style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 'bold', color: '#eee' }}>Research</div>
        <div style={{ marginTop: 4, fontSize: 11, color: '#aaa' }}>
          Turn {turn} of an expected {ageDefinition.turnsPerAge} · Era momentum contributes +{getAgeResearchMomentum(age)} knowledge each turn
        </div>
      </header>
      <div style={{ position: 'relative', width: totalW, height: totalH, margin: '0 auto' }}>
        {/* Dependency lines */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: totalW, height: totalH, pointerEvents: 'none' }}>
          {lines.map((line, i) => {
            const midX = (line.x1 + line.x2) / 2;
            return (
              <path
                key={i}
                d={`M ${line.x1} ${line.y1} C ${midX} ${line.y1}, ${midX} ${line.y2}, ${line.x2} ${line.y2}`}
                stroke={line.researched ? '#4caf50' : '#444'}
                strokeWidth={2}
                fill="none"
              />
            );
          })}
        </svg>

        {/* Tech nodes */}
        {layout.map(node => {
          const { tech } = node;
          const available = canQueue(tech.id, techs);
          const isActive = activeResearch === tech.id;
          const isExpanded = expandedId === tech.id;
          const cost = getTechCost(tech.id, techs);

          let bg = '#1a1a1a';
          let border = '1px solid #333';
          let opacity = 0.5;
          let cursor = 'pointer';

          if (tech.researched) {
            bg = '#1a3a1a'; border = '1px solid #4caf50'; opacity = 1;
          } else if (isActive) {
            bg = '#2a2a4a'; border = '2px solid #6a6aff'; opacity = 1;
          } else if (available) {
            bg = '#252540'; border = '1px solid #555'; opacity = 1;
          } else {
            cursor = 'pointer'; // still clickable to see info
          }

          return (
            <button
              type="button"
              key={tech.id}
              onClick={() => setExpandedId(isExpanded ? null : tech.id)}
              aria-pressed={isExpanded}
              aria-label={`${tech.name}, ${tech.researched ? 'researched' : isActive ? `${researchProgress} of ${cost} knowledge` : `${cost} knowledge`}`}
              style={{
                position: 'absolute', left: node.x, top: node.y,
                width: NODE_W, height: NODE_H,
                background: bg, border, borderRadius: 8,
                padding: '6px 10px', opacity, cursor,
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                color: '#eee', fontSize: 12, boxSizing: 'border-box',
                outline: isExpanded ? '2px solid #fff' : 'none',
                outlineOffset: 1, textAlign: 'left',
              }}
            >
              <div style={{ fontWeight: 'bold', fontSize: 12, marginBottom: 2 }}>{tech.name}</div>
              <div style={{ fontSize: 10, color: '#999' }}>
                {tech.researched ? 'Researched'
                  : isActive ? `${researchProgress} / ${cost}`
                  : `${cost} knowledge`}
              </div>
              {isActive && (
                <div style={{ height: 3, borderRadius: 1.5, background: '#333', marginTop: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 1.5, background: '#6a6aff',
                    width: `${Math.min(100, (researchProgress / cost) * 100)}%`,
                    transition: 'width 0.3s',
                  }} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Expanded detail panel */}
      {expandedTech && (() => {
        const available = canQueue(expandedTech.id, techs);
        const isActive = activeResearch === expandedTech.id;
        const cost = getTechCost(expandedTech.id, techs);
        const effects = formatEffects(expandedTech.effects);
        const prereqs = expandedTech.requires.map(rid => techs.find(t => t.id === rid)).filter(Boolean);

        return (
          <div style={{
            marginTop: 24, background: '#1a1a2e', borderRadius: 10,
            border: '1px solid #444', padding: 20, maxWidth: 400, margin: '24px auto 0',
          }}>
            <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 4, color: '#eee' }}>
              {expandedTech.name}
            </div>
            <div style={{ fontSize: 13, color: '#aaa', lineHeight: 1.5, marginBottom: 12 }}>
              {expandedTech.description}
            </div>

            {/* Effects */}
            {effects.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', marginBottom: 4 }}>Effects</div>
                {effects.map((e, i) => (
                  <div key={i} style={{ fontSize: 12, color: '#8d8', marginBottom: 2 }}>{e}</div>
                ))}
              </div>
            )}

            {/* Prerequisites */}
            {prereqs.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', marginBottom: 4 }}>Requires</div>
                {prereqs.map(p => (
                  <div key={p!.id} style={{
                    fontSize: 12,
                    color: p!.researched ? '#4caf50' : '#f66',
                    marginBottom: 2,
                  }}>
                    {p!.name} {p!.researched ? '(done)' : '(not yet)'}
                  </div>
                ))}
              </div>
            )}

            {/* Cost */}
            {!expandedTech.researched && (
              <div style={{ fontSize: 12, color: '#aaa', marginBottom: 12 }}>
                Cost: {cost} knowledge
                {isActive && ` (${researchProgress}/${cost} progress)`}
              </div>
            )}

            {/* Action button */}
            {!expandedTech.researched && available && !isActive && (
              <button
                onClick={(e) => { e.stopPropagation(); onResearch(expandedTech.id); }}
                style={{
                  padding: '8px 20px', borderRadius: 6, border: 'none',
                  background: '#6a6aff', color: '#fff', fontSize: 13,
                  cursor: 'pointer', width: '100%',
                }}
              >
                Research This
              </button>
            )}
            {isActive && (
              <div style={{ fontSize: 12, color: '#6a6aff', textAlign: 'center' }}>
                Currently researching...
              </div>
            )}
            {expandedTech.researched && (
              <div style={{ fontSize: 12, color: '#4caf50', textAlign: 'center' }}>
                Already researched
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
