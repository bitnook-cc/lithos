import { Tile } from '@/types/map';
import { hexDistance, hexNeighbors } from '@/game/hex/hexUtils';

export const riverKey = (tile: Tile) => `${tile.coord.q},${tile.coord.r}`;
export const isRiverWater = (tile: Tile) => tile.type === 'water' || tile.type === 'ice';

/** Inland water is a lake; water touching the original world edge is ocean.
 * Existing identities take precedence as the playable map expands. */
export function classifyWaterBodies(tiles: Tile[]) {
  const byKey = new Map(tiles.map(tile => [riverKey(tile), tile]));
  const seen = new Set<string>();
  for (const start of tiles.filter(isRiverWater)) {
    if (seen.has(riverKey(start))) continue;
    const body: Tile[] = [], stack = [start];
    let boundary = false;
    while (stack.length) {
      const tile = stack.pop()!;
      if (seen.has(riverKey(tile))) continue;
      seen.add(riverKey(tile)); body.push(tile);
      for (const coord of hexNeighbors(tile.coord)) {
        const next = byKey.get(`${coord.q},${coord.r}`);
        if (!next) boundary = true;
        else if (isRiverWater(next) && !seen.has(riverKey(next))) stack.push(next);
      }
    }
    const inherited = body.find(tile => tile.waterBody)?.waterBody;
    for (const tile of body) tile.waterBody ??= inherited ?? (boundary ? 'ocean' : 'lake');
  }
}

/** Complete source-to-water channels only. Prefer existing downhill valleys;
 * a second pass permits shallow channel incision, never changes a biome or
 * inherited tile, and validates the entire descending bed before committing. */
export function generateRivers(tiles: Tile[], count: number, rand: () => number, locked = new Set<string>()) {
  const byKey = new Map(tiles.map(tile => [riverKey(tile), tile]));
  const occupied = new Set(tiles.filter(tile => tile.river).map(riverKey));
  const neighbors = (tile: Tile) => hexNeighbors(tile.coord)
    .map(coord => byKey.get(`${coord.q},${coord.r}`)).filter((next): next is Tile => !!next);
  const sources = tiles.filter(tile => (tile.type === 'hills' || tile.type === 'mountain')
    && hexDistance(tile.coord, { q: 0, r: 0, s: 0 }) > 1 && !locked.has(riverKey(tile)))
    .map(tile => ({ tile, priority: tile.elevation + rand() * 0.08 }))
    .sort((a, b) => b.priority - a.priority).map(item => item.tile);
  // Stable tie-breaking noise affects route choice, never the spline on redraw.
  const variation = new Map(tiles.map(tile => [riverKey(tile), rand() * 0.15]));
  let placed = 0;
  for (const allowIncision of [false, true]) {
    for (const source of sources) {
      if (placed >= count) return;
      if (occupied.has(riverKey(source))) continue;
      const costs = new Map<string, number>([[riverKey(source), 0]]);
      const previous = new Map<string, Tile>();
      const open = [source], closed = new Set<string>();
      let mouth: Tile | undefined;
      while (open.length) {
        open.sort((a, b) => costs.get(riverKey(a))! - costs.get(riverKey(b))!);
        const current = open.shift()!, key = riverKey(current);
        if (closed.has(key)) continue;
        closed.add(key);
        if (isRiverWater(current)) { mouth = current; break; }
        for (const next of neighbors(current)) {
          const nextKey = riverKey(next);
          if (closed.has(nextKey) || locked.has(nextKey) || occupied.has(nextKey)) continue;
          const rise = next.elevation - current.elevation;
          if (!allowIncision && rise >= -0.001) continue;
          const cost = costs.get(key)! + 1 + Math.max(0, rise) * 100 + variation.get(nextKey)!;
          if (cost >= (costs.get(nextKey) ?? Infinity)) continue;
          costs.set(nextKey, cost); previous.set(nextKey, current); open.push(next);
        }
      }
      if (!mouth) continue;
      const path = [mouth];
      while (path[0] !== source) path.unshift(previous.get(riverKey(path[0]))!);
      if (path.length < 3) continue;
      const bed = [source.elevation];
      for (let i = 1; i < path.length; i++) bed.push(Math.min(path[i].elevation, bed[i - 1] - 0.001));
      // No deep trenches, flooded capitals, or lowered lake/ocean surfaces.
      if (bed[bed.length - 1] < mouth.elevation || path.some((tile, i) => tile.elevation - bed[i] > 0.12)) continue;
      path.forEach((tile, i) => {
        tile.elevation = bed[i]; tile.river = true; occupied.add(riverKey(tile));
        if (i === path.length - 1) { tile.riverDownstream = null; return; }
        const next = path[i + 1];
        const direction = hexNeighbors(tile.coord).findIndex(coord => coord.q === next.coord.q && coord.r === next.coord.r);
        tile.riverDownstream = direction;
        tile.riverEdges.push(direction); next.riverEdges.push((direction + 3) % 6);
      });
      placed++;
    }
  }
}
