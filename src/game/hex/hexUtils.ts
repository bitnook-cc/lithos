import { HexCoord } from '@/types/map';

export function createHex(q: number, r: number): HexCoord {
  return { q, r, s: -q - r };
}

const DIRECTIONS: HexCoord[] = [
  { q: 1, r: -1, s: 0 }, { q: 1, r: 0, s: -1 }, { q: 0, r: 1, s: -1 },
  { q: -1, r: 1, s: 0 }, { q: -1, r: 0, s: 1 }, { q: 0, r: -1, s: 1 },
];

export function hexNeighbors(hex: HexCoord): HexCoord[] {
  return DIRECTIONS.map(d => ({ q: hex.q + d.q, r: hex.r + d.r, s: hex.s + d.s }));
}

export function hexDistance(a: HexCoord, b: HexCoord): number {
  return Math.max(Math.abs(a.q - b.q), Math.abs(a.r - b.r), Math.abs(a.s - b.s));
}

export function hexToPixel(hex: HexCoord, size: number): { x: number; y: number } {
  const x = size * (3 / 2 * hex.q);
  const y = size * (Math.sqrt(3) / 2 * hex.q + Math.sqrt(3) * hex.r);
  return { x, y };
}

export function pixelToHex(x: number, y: number, size: number): HexCoord {
  const q = (2 / 3 * x) / size;
  const r = (-1 / 3 * x + Math.sqrt(3) / 3 * y) / size;
  return hexRound(q, r);
}

function hexRound(qf: number, rf: number): HexCoord {
  const sf = -qf - rf;
  let q = Math.round(qf); let r = Math.round(rf); let s = Math.round(sf);
  const qDiff = Math.abs(q - qf); const rDiff = Math.abs(r - rf); const sDiff = Math.abs(s - sf);
  if (qDiff > rDiff && qDiff > sDiff) { q = -r - s; }
  else if (rDiff > sDiff) { r = -q - s; }
  else { s = -q - r; }
  return { q, r, s };
}
