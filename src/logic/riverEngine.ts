import { HexCoord, Tile } from '@/types/map';
import { hexNeighbors } from '@/game/hex/hexUtils';

const keyOf = (coord: HexCoord) => `${coord.q},${coord.r},${coord.s}`;

export function riverDirection(from: HexCoord, to: HexCoord): number {
  return hexNeighbors(from).findIndex(coord => coord.q === to.q && coord.r === to.r && coord.s === to.s);
}

/** Migrates legacy river booleans into a degree-two, acyclic path graph. */
export function ensureRiverConnections(source: Tile[]): Tile[] {
  if (!source.some(tile => tile.river && tile.riverEdges.length === 0)) return source;
  const map = source.map(tile => ({ ...tile, riverEdges: [...tile.riverEdges] }));
  const byKey = new Map(map.map(tile => [keyOf(tile.coord), tile]));
  const parent = new Map(map.map(tile => [keyOf(tile.coord), keyOf(tile.coord)]));
  const find = (key: string): string => {
    const current = parent.get(key) ?? key;
    if (current === key) return key;
    const root = find(current);
    parent.set(key, root);
    return root;
  };
  const edges: Array<{ a: Tile; b: Tile; direction: number; score: number }> = [];
  for (const tile of map.filter(item => item.river)) {
    hexNeighbors(tile.coord).forEach((coord, direction) => {
      const neighbor = byKey.get(keyOf(coord));
      if (!neighbor?.river || keyOf(tile.coord) >= keyOf(neighbor.coord)) return;
      edges.push({ a: tile, b: neighbor, direction, score: Math.abs(tile.elevation - neighbor.elevation) });
    });
  }
  edges.sort((left, right) => left.score - right.score || keyOf(left.a.coord).localeCompare(keyOf(right.a.coord)));
  for (const edge of edges) {
    const aKey = keyOf(edge.a.coord), bKey = keyOf(edge.b.coord);
    if (edge.a.riverEdges.length >= 2 || edge.b.riverEdges.length >= 2 || find(aKey) === find(bKey)) continue;
    edge.a.riverEdges.push(edge.direction);
    edge.b.riverEdges.push((edge.direction + 3) % 6);
    parent.set(find(bKey), find(aKey));
  }
  for (const tile of map) tile.river = tile.riverEdges.length > 0;
  return map;
}
