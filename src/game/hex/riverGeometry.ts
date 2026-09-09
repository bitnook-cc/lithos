import { Tile } from '@/types/map';
import { hexNeighbors, hexToPixel } from './hexUtils';
import { isRiverWater, riverKey } from '@/logic/riverGeneration';

export interface RiverPoint { x: number; y: number; }
export interface RiverCurve {
  tileKey: string;
  points: [RiverPoint, RiverPoint, RiverPoint, RiverPoint];
  startWidth: number;
  endWidth: number;
  mouth: boolean;
}
const add = (a: RiverPoint, b: RiverPoint, scale = 1) => ({ x: a.x + b.x * scale, y: a.y + b.y * scale });
const subtract = (a: RiverPoint, b: RiverPoint) => ({ x: a.x - b.x, y: a.y - b.y });
const unit = (p: RiverPoint) => { const length = Math.hypot(p.x, p.y) || 1; return { x: p.x / length, y: p.y / length }; };
function noise(key: string) {
  let hash = 2166136261;
  for (const char of key) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return (hash >>> 0) / 0xffffffff - 0.5;
}

/** Trace the complete saved graph, not just the revealed portion. This keeps
 * source/mouth orientation, bends and widths stable as fog is lifted. */
export function riverPaths(tiles: Tile[]): Tile[][] {
  const byKey = new Map(tiles.map(tile => [riverKey(tile), tile]));
  const neighbors = (tile: Tile) => tile.riverEdges.flatMap(direction => {
    const coord = hexNeighbors(tile.coord)[direction];
    const next = byKey.get(`${coord.q},${coord.r}`);
    return next?.riverEdges.includes((direction + 3) % 6) ? [next] : [];
  });
  const visited = new Set<string>(), paths: Tile[][] = [];
  const endpoints = tiles.filter(tile => neighbors(tile).length === 1).sort((a, b) => {
    const source = (tile: Tile) => tile.riverDownstream != null ? 2 : !isRiverWater(tile) && tile.riverDownstream === undefined ? 1 : 0;
    return source(b) - source(a) || b.elevation - a.elevation || riverKey(a).localeCompare(riverKey(b));
  });
  for (const start of endpoints) {
    if (visited.has(riverKey(start))) continue;
    const path: Tile[] = [];
    let current: Tile | undefined = start;
    while (current && !visited.has(riverKey(current))) {
      path.push(current); visited.add(riverKey(current));
      current = neighbors(current).find(tile => !visited.has(riverKey(tile)));
    }
    if (path.length > 1) paths.push(path);
  }
  return paths;
}

/** Each cubic's four controls lie inside one convex hex. Shared edge portals
 * and perpendicular edge tangents give continuous joins without overshoot. */
export function buildRiverCurves(tiles: Tile[], size: number): RiverCurve[] {
  const curves: RiverCurve[] = [];
  for (const path of riverPaths(tiles)) {
    const centers = path.map(tile => hexToPixel(tile.coord, size));
    const portals = centers.slice(1).map((center, i) => {
      const direction = unit(subtract(center, centers[i]));
      const midpoint = add(centers[i], subtract(center, centers[i]), 0.5);
      const pair = [riverKey(path[i]), riverKey(path[i + 1])].sort().join('|');
      return add(midpoint, { x: -direction.y, y: direction.x }, noise(pair) * size * 0.24);
    });
    const width = (progress: number) => 1.25 + 3.4 * Math.max(0, Math.min(1, progress));
    path.forEach((tile, i) => {
      const center = centers[i], entry = portals[i - 1], exit = portals[i];
      const flow = unit(subtract(exit ?? center, entry ?? center));
      const mountain = tile.type === 'mountain' || tile.type === 'hills';
      const bend = noise(riverKey(tile)) * size * (mountain ? 0.12 : 0.36);
      const anchor = add(center, { x: -flow.y, y: flow.x }, bend);
      const handle = size * 0.24;
      const middleWidth = width(i / (path.length - 1));
      const mouth = i === path.length - 1 && isRiverWater(tile);
      if (entry) {
        const incoming = unit(subtract(center, centers[i - 1]));
        curves.push({ tileKey: riverKey(tile),
          points: [entry, add(entry, incoming, handle), add(anchor, flow, -handle), anchor],
          startWidth: width((i - 0.5) / (path.length - 1)), endWidth: mouth ? middleWidth + 2 : middleWidth, mouth,
        });
      }
      if (exit) {
        const outgoing = unit(subtract(centers[i + 1], center));
        curves.push({ tileKey: riverKey(tile),
          points: [anchor, add(anchor, flow, handle), add(exit, outgoing, -handle), exit],
          startWidth: i === 0 ? 0.65 : middleWidth, endWidth: width((i + 0.5) / (path.length - 1)), mouth: false,
        });
      }
    });
  }
  return curves;
}

export function sampleRiverCurve(curve: RiverCurve, t: number): RiverPoint {
  const [a, b, c, d] = curve.points, u = 1 - t;
  return { x: u ** 3 * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t ** 3 * d.x,
    y: u ** 3 * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c.y + t ** 3 * d.y };
}
