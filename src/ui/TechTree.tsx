import React, { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { canQueue, getTechCost } from '@/logic/techEngine';
import { TechNode } from '@/types/game';

const NODE_W = 140;
const NODE_H = 60;
const GAP_X = 40;
const GAP_Y = 24;

interface LayoutNode {
  tech: TechNode;
  col: number;
  row: number;
  x: number;
  y: number;
}

/** Assign each tech a column (depth from roots) and row (order within column) */
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

  // Group by column
  const columns = new Map<number, TechNode[]>();
  for (const tech of techs) {
    const col = depths.get(tech.id) ?? 0;
    if (!columns.has(col)) columns.set(col, []);
    columns.get(col)!.push(tech);
  }

  const nodes: LayoutNode[] = [];
  for (const [col, colTechs] of columns) {
    colTechs.forEach((tech, row) => {
      nodes.push({
        tech,
        col,
        row,
        x: col * (NODE_W + GAP_X),
        y: row * (NODE_H + GAP_Y),
      });
    });
  }

  // Center columns vertically relative to the tallest column
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
  const { techs, activeResearch, researchProgress } = useGameStore();

  const layout = useMemo(() => layoutTechs(techs), [techs]);
  const nodeMap = useMemo(() => new Map(layout.map(n => [n.tech.id, n])), [layout]);

  // Compute SVG lines for dependencies
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

  return (
    <div style={{
      position: 'absolute', top: 50, left: 0, right: 0, bottom: 0,
      background: 'rgba(10,10,20,0.95)', zIndex: 15,
      overflow: 'auto', padding: 20,
    }}>
      <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 16, color: '#eee' }}>Research</div>
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
          const cost = getTechCost(tech.id, techs);

          let bg = '#1a1a1a';
          let border = '1px solid #333';
          let opacity = 0.5;
          let cursor = 'default';

          if (tech.researched) {
            bg = '#1a3a1a';
            border = '1px solid #4caf50';
            opacity = 1;
          } else if (isActive) {
            bg = '#2a2a4a';
            border = '2px solid #6a6aff';
            opacity = 1;
          } else if (available) {
            bg = '#252540';
            border = '1px solid #555';
            opacity = 1;
            cursor = 'pointer';
          }

          return (
            <div
              key={tech.id}
              onClick={() => available && !tech.researched && onResearch(tech.id)}
              style={{
                position: 'absolute',
                left: node.x,
                top: node.y,
                width: NODE_W,
                height: NODE_H,
                background: bg,
                border,
                borderRadius: 8,
                padding: '6px 10px',
                opacity,
                cursor,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                color: '#eee',
                fontSize: 12,
                boxSizing: 'border-box',
              }}
            >
              <div style={{ fontWeight: 'bold', fontSize: 13, marginBottom: 2 }}>{tech.name}</div>
              <div style={{ fontSize: 10, color: '#999' }}>
                {tech.researched
                  ? 'Researched'
                  : isActive
                    ? `${researchProgress} / ${cost}`
                    : `${cost} knowledge`
                }
              </div>
              {isActive && (
                <div style={{
                  height: 3, borderRadius: 1.5, background: '#333',
                  marginTop: 4, overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%', borderRadius: 1.5, background: '#6a6aff',
                    width: `${Math.min(100, (researchProgress / cost) * 100)}%`,
                    transition: 'width 0.3s',
                  }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
