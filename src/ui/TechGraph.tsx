import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { GameState } from '@/types/game';
import { canQueue } from '@/logic/techEngine';
import { layoutTechTree, nextTechInDirection, prerequisitePath, TECH_CARD } from '@/logic/techTreeLayout';
import { researchEstimate } from '@/logic/developmentEngine';
import { useReducedMotion } from './motionPreference';
import './tech-tree.css';

export function TechGraph({ state, selected, onSelect, highlightAvailable, rate }: {
  state: GameState; selected: string; onSelect: (id: string) => void; highlightAvailable: boolean; rate: number;
}) {
  const layout = useMemo(() => layoutTechTree(state.techs), [state.techs]);
  const route = useMemo(() => prerequisitePath(state.techs, selected), [state.techs, selected]);
  const [zoom, setZoom] = useState(1);
  const viewport = useRef<HTMLDivElement>(null);
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const drag = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const reduceMotion = useReducedMotion();
  const hintId = useId();
  const centerSelected = (smooth = true) => {
    const node = layout.nodes.find(item => item.id === selected), element = viewport.current;
    if (!node || !element) return;
    element.scrollTo({ left: (node.x + TECH_CARD.width / 2) * zoom - element.clientWidth / 2,
      top: (node.y + TECH_CARD.height / 2) * zoom - element.clientHeight / 2,
      behavior: smooth && !reduceMotion ? 'smooth' : 'instant' });
  };
  useEffect(() => { centerSelected(false); }, [selected, zoom, layout]);
  const fit = () => {
    const element = viewport.current;
    if (element) setZoom(Math.max(0.1, Math.min(1, (element.clientWidth - 12) / layout.width, (element.clientHeight - 12) / layout.height)));
  };
  return <div className="tech-graph">
    <div className="tech-graph-tools" aria-label="Technology tree controls">
      <button aria-label="Zoom out technology tree" disabled={zoom <= 0.45} onClick={() => setZoom(value => Math.max(0.45, value - 0.15))}>−</button>
      <span aria-label="Tree zoom">{Math.round(zoom * 100)}%</span>
      <button aria-label="Zoom in technology tree" disabled={zoom >= 1.45} onClick={() => setZoom(value => Math.min(1.45, value + 0.15))}>+</button>
      <button onClick={fit}>Fit tree</button><button onClick={() => centerSelected()}>Find selected</button>
    </div>
    <p id={hintId} className="tech-graph-hint">Left → right · All incoming links are required. Scroll or drag to explore.</p>
    <div className="tech-graph-viewport" ref={viewport} role="region" aria-label="Technology tree" aria-describedby={hintId} tabIndex={0}
      onPointerDown={event => {
        if (event.pointerType !== 'mouse' || event.button !== 0 || (event.target as Element).closest('button')) return;
        drag.current = { x: event.clientX, y: event.clientY, left: event.currentTarget.scrollLeft, top: event.currentTarget.scrollTop };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={event => {
        if (!drag.current) return;
        event.currentTarget.scrollLeft = drag.current.left + drag.current.x - event.clientX;
        event.currentTarget.scrollTop = drag.current.top + drag.current.y - event.clientY;
      }}
      onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} onLostPointerCapture={() => { drag.current = null; }}>
      <div className="tech-graph-space" style={{ width: layout.width * zoom, height: layout.height * zoom }}>
        <div className="tech-graph-canvas" style={{ width: layout.width, height: layout.height, zoom }}>
          {Array.from({ length: layout.columns }, (_, column) => <span key={column} className="tech-tier" style={{ left: TECH_CARD.padding + column * (TECH_CARD.width + TECH_CARD.columnGap) }}>{column === 0 ? 'Foundations' : `Discoveries · ${column + 1}`}</span>)}
          <svg className="tech-connections" width={layout.width} height={layout.height} aria-hidden="true">
            {layout.edges.map(edge => {
              const met = state.techs.find(tech => tech.id === edge.from)!.researched;
              return <path key={`${edge.from}-${edge.to}`} d={edge.path} className={`tech-link ${met ? 'met' : ''} ${route.has(edge.from) && route.has(edge.to) ? 'on-route' : ''}`} />;
            })}
            {layout.edges.map(edge => {
              const target = layout.nodes.find(node => node.id === edge.to)!;
              return <path key={`${edge.from}-${edge.to}`} d={`M ${target.x - 7} ${target.y + TECH_CARD.height / 2 - 4} l 6 4 l -6 4`} className={`tech-arrow ${route.has(edge.from) && route.has(edge.to) ? 'on-route' : ''}`} />;
            })}
          </svg>
          {layout.nodes.map(node => {
            const tech = state.techs.find(item => item.id === node.id)!;
            const active = state.activeResearch === tech.id, available = canQueue(tech.id, state.techs);
            const status = tech.researched ? '✓ Discovered' : active ? '◌ Researching' : available ? '◇ Available' : '· Needs prerequisites';
            const progress = active ? state.researchProgress : state.development?.projects[tech.id]?.progress ?? 0;
            const estimate = researchEstimate(state, tech.id, rate);
            const advance = tech.effects.some(effect => effect.type === 'advance_age');
            const prerequisites = tech.requires.map(id => state.techs.find(item => item.id === id)?.name).join(' + ');
            return <button key={tech.id} ref={element => { if (element) buttons.current.set(tech.id, element); else buttons.current.delete(tech.id); }}
              className={`tech-node ${tech.researched ? 'complete' : active ? 'active' : available ? 'available' : 'locked'} ${selected === tech.id ? 'selected' : ''} ${route.has(tech.id) ? 'on-route' : ''} ${advance ? 'age-gate' : ''} ${highlightAvailable && !available && selected !== tech.id ? 'deemphasized' : ''}`}
              style={{ left: node.x, top: node.y, width: TECH_CARD.width, height: TECH_CARD.height }} aria-pressed={selected === tech.id}
              aria-label={`${tech.name}. ${status}. ${tech.researched ? 'Discovery complete.' : `${progress}/${tech.cost} knowledge. ${Number.isFinite(estimate) ? `About ${estimate} collections.` : 'Needs research income.'}`} ${prerequisites ? `Requires ${prerequisites}.` : 'Foundation discovery.'}`}
              onClick={() => { onSelect(tech.id); if (zoom < 0.7) setZoom(1); }} onKeyDown={event => {
                if (!event.key.startsWith('Arrow')) return;
                event.preventDefault();
                const next = nextTechInDirection(layout, state.techs, tech.id, event.key);
                if (next) { onSelect(next); if (zoom < 0.7) setZoom(1); buttons.current.get(next)?.focus({ preventScroll: true }); }
              }}>
              <span className="tech-node-state">{status}</span>
              <strong>{tech.name}</strong>
              <small>{tech.researched ? 'Knowledge carried forward' : `${progress}/${tech.cost} knowledge · ${Number.isFinite(estimate) ? `~${estimate} collections` : 'No income'}`}</small>
              {advance && <span className="tech-age-label">Next age →</span>}
              {!tech.researched && progress > 0 && <span className="tech-progress" aria-hidden="true"><i style={{ width: `${Math.min(100, progress / tech.cost * 100)}%` }} /></span>}
            </button>;
          })}
        </div>
      </div>
    </div>
    <div className="tech-graph-key"><span>Solid link: requirement met</span><span>Dashed: still needed</span><span>Gold: selected path</span></div>
  </div>;
}
