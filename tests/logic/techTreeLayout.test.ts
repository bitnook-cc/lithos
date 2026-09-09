import { describe, expect, it } from 'vitest';
import { getAgeContent } from '@/data/content';
import { layoutTechTree, nextTechInDirection, prerequisitePath, TECH_CARD } from '@/logic/techTreeLayout';
import { createNewRun } from '@/logic/runEngine';
import { TechNode } from '@/types/game';

describe('visual technology tree', () => {
  it.each(['stone', 'bronze', 'classical'] as const)('lays out every %s discovery and every prerequisite without overlapping cards', age => {
    const techs = getAgeContent(age).createTechs();
    const before = structuredClone(techs), layout = layoutTechTree(techs);
    expect(layout.nodes).toHaveLength(techs.length);
    expect(layout.edges).toHaveLength(techs.reduce((sum, tech) => sum + tech.requires.length, 0));
    for (const edge of layout.edges) {
      const from = layout.nodes.find(node => node.id === edge.from)!, to = layout.nodes.find(node => node.id === edge.to)!;
      expect(to.column).toBeGreaterThan(from.column);
      expect(techs.find(tech => tech.id === edge.to)!.requires).toContain(edge.from);
      expect(edge.path).not.toMatch(/NaN|Infinity/);
    }
    for (const a of layout.nodes) for (const b of layout.nodes) {
      if (a.id === b.id) continue;
      expect(a.x + TECH_CARD.width <= b.x || b.x + TECH_CARD.width <= a.x || a.y + TECH_CARD.height <= b.y || b.y + TECH_CARD.height <= a.y).toBe(true);
    }
    expect(techs).toEqual(before);
    expect(layoutTechTree(techs.map(tech => ({ ...tech, researched: true })))).toEqual(layout);
  });

  it('highlights all prerequisites for a converging branch, without unrelated discoveries', () => {
    const techs = getAgeContent('stone').createTechs();
    expect([...prerequisitePath(techs, 'advance_bronze')].sort()).toEqual(['advance_bronze', 'tool_crafting', 'fire_making', 'survival', 'tribal_lore', 'mysticism'].sort());
  });

  it('navigates prerequisites, successors and peers by keyboard', () => {
    const techs = getAgeContent('stone').createTechs(), layout = layoutTechTree(techs);
    expect(nextTechInDirection(layout, techs, 'fire_making', 'ArrowLeft')).toBe('survival');
    expect(nextTechInDirection(layout, techs, 'fire_making', 'ArrowRight')).toBe('tool_crafting');
    expect(nextTechInDirection(layout, techs, 'survival', 'ArrowLeft')).toBeUndefined();
    const first = layout.nodes.filter(node => node.column === 0).sort((a, b) => a.y - b.y)[0];
    expect(nextTechInDirection(layout, techs, first.id, 'ArrowDown')).toBeDefined();
  });

  it('rejects missing or cyclic prerequisites and handles an empty age', () => {
    const tech = createNewRun([], 42).techs[0];
    expect(() => layoutTechTree([{ ...tech, requires: ['missing'] }])).toThrow();
    expect(() => layoutTechTree([{ ...tech, requires: [tech.id] }])).toThrow();
    expect(layoutTechTree([]).nodes).toEqual([]);
  });

  it('reserves a clear corridor for long links through intermediate columns', () => {
    const make = (id: string, requires: string[]): TechNode => ({ id, name: id, requires, effects: [], researched: false, cost: 4, description: '' });
    const layout = layoutTechTree([make('a', []), make('b', ['a']), make('c', ['b']), make('d', ['a', 'c'])]);
    const link = layout.edges.find(edge => edge.from === 'a' && edge.to === 'd')!;
    expect((link.path.match(/ L /g) ?? [])).toHaveLength(2);
    // Horizontal passages through columns are in dummy rows, never real cards.
    for (const match of link.path.matchAll(/ L ([\d.]+) ([\d.]+)/g)) {
      const right = Number(match[1]), y = Number(match[2]);
      expect(layout.nodes.some(node => node.x < right && node.x + TECH_CARD.width > right - TECH_CARD.width && y > node.y && y < node.y + TECH_CARD.height)).toBe(false);
    }
  });
});
