import { TechNode } from '@/types/game';

export const TECH_CARD = { width: 188, height: 112, columnGap: 76, rowGap: 30, padding: 28, heading: 32 };
export interface TechPosition { id: string; x: number; y: number; column: number; }
export interface TechConnection { from: string; to: string; path: string; }
export interface TechLayout { nodes: TechPosition[]; edges: TechConnection[]; width: number; height: number; columns: number; }

/** Layered DAG layout. Invisible routing nodes occupy intermediate columns so
 * long prerequisite links never pass underneath unrelated technology cards. */
export function layoutTechTree(techs: TechNode[]): TechLayout {
  const byId = new Map(techs.map(tech => [tech.id, tech]));
  const depths = new Map<string, number>(), visiting = new Set<string>();
  const depth = (id: string): number => {
    if (depths.has(id)) return depths.get(id)!;
    const tech = byId.get(id);
    if (!tech || visiting.has(id)) throw new Error('Invalid research prerequisites');
    visiting.add(id);
    const result = tech.requires.length ? Math.max(...tech.requires.map(depth)) + 1 : 0;
    visiting.delete(id); depths.set(id, result); return result;
  };
  techs.forEach(tech => depth(tech.id));
  const columns = techs.length ? Math.max(...depths.values()) + 1 : 0;
  const layers: string[][] = Array.from({ length: columns }, () => []);
  techs.forEach(tech => layers[depths.get(tech.id)!].push(tech.id));
  const links: Array<{ from: string; to: string; route: string[] }> = [];
  const incoming = new Map<string, string[]>(), outgoing = new Map<string, string[]>();
  for (const tech of techs) for (const from of tech.requires) {
    const route = [from];
    for (let column = depths.get(from)! + 1; column < depths.get(tech.id)!; column++) {
      const dummy = `route:${from}:${tech.id}:${column}`;
      layers[column].push(dummy); route.push(dummy);
    }
    route.push(tech.id); links.push({ from, to: tech.id, route });
    route.slice(1).forEach((id, i) => {
      incoming.set(id, [...(incoming.get(id) ?? []), route[i]]);
      outgoing.set(route[i], [...(outgoing.get(route[i]) ?? []), id]);
    });
  }
  // Alternating barycentre sweeps group branches and reduce connector crossings.
  const order = () => new Map(layers.flatMap(layer => layer.map((id, i) => [id, i] as const)));
  for (let pass = 0; pass < 4; pass++) {
    for (const forward of [true, false]) {
      const indices = Array.from({ length: columns }, (_, i) => forward ? i : columns - i - 1);
      for (const column of indices) {
        const ranks = order(), adjacent = forward ? incoming : outgoing;
        const score = (id: string) => {
          const neighbors = adjacent.get(id) ?? [];
          return neighbors.length ? neighbors.reduce((sum, key) => sum + ranks.get(key)!, 0) / neighbors.length : ranks.get(id)!;
        };
        layers[column].sort((a, b) => score(a) - score(b) || ranks.get(a)! - ranks.get(b)!);
      }
    }
  }
  const { width, height, columnGap, rowGap, padding, heading } = TECH_CARD;
  const rows = Math.max(1, ...layers.map(layer => layer.length));
  const points = new Map<string, TechPosition>();
  layers.forEach((layer, column) => layer.forEach((id, row) => points.set(id, {
    id, column, x: padding + column * (width + columnGap),
    y: padding + heading + (row + (rows - layer.length) / 2) * (height + rowGap),
  })));
  const edges = links.map(({ from, to, route }) => {
    let path = '';
    route.slice(1).forEach((id, i) => {
      const a = points.get(route[i])!, b = points.get(id)!;
      const startX = a.x + width, startY = a.y + height / 2;
      const endX = b.x, endY = b.y + height / 2;
      const handle = (endX - startX) / 2;
      if (i === 0) path = `M ${startX} ${startY}`;
      path += ` C ${startX + handle} ${startY}, ${endX - handle} ${endY}, ${endX} ${endY}`;
      if (i < route.length - 2) path += ` L ${b.x + width} ${endY}`;
    });
    return { from, to, path };
  });
  return { nodes: techs.map(tech => points.get(tech.id)!).sort((a, b) => a.column - b.column || a.y - b.y), edges,
    width: padding * 2 + columns * (width + columnGap) - (columns ? columnGap : 0),
    height: padding * 2 + heading + rows * (height + rowGap) - rowGap, columns };
}

/** All ancestors, including completed ones: this is context, not a queue. */
export function prerequisitePath(techs: TechNode[], selected: string): Set<string> {
  const byId = new Map(techs.map(tech => [tech.id, tech])), result = new Set<string>();
  const visit = (id: string) => {
    if (result.has(id) || !byId.has(id)) return;
    result.add(id); byId.get(id)!.requires.forEach(visit);
  };
  visit(selected); return result;
}

export function nextTechInDirection(layout: TechLayout, techs: TechNode[], id: string, key: string): string | undefined {
  const current = layout.nodes.find(node => node.id === id);
  if (!current) return;
  const tech = techs.find(item => item.id === id)!;
  let candidates = layout.nodes.filter(node => node.id !== id);
  if (key === 'ArrowLeft') candidates = candidates.filter(node => tech.requires.includes(node.id));
  else if (key === 'ArrowRight') candidates = candidates.filter(node => techs.find(item => item.id === node.id)!.requires.includes(id));
  else if (key === 'ArrowUp' || key === 'ArrowDown') candidates = candidates.filter(node => node.column === current.column && (key === 'ArrowUp' ? node.y < current.y : node.y > current.y));
  else return;
  return candidates.sort((a, b) => Math.abs(a.y - current.y) - Math.abs(b.y - current.y))[0]?.id;
}
