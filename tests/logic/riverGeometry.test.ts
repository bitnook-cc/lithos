import { describe, expect, it } from 'vitest';
import { buildRiverCurves, sampleRiverCurve } from '@/game/hex/riverGeometry';
import { generateMap } from '@/logic/mapGenerator';
import { hexToPixel } from '@/game/hex/hexUtils';
import { riverKey } from '@/logic/riverGeneration';

describe('continuous river splines', () => {
  it('keeps every control and sampled point inside its owning hex over many seeds', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const tiles = generateMap({ targetTiles: 91, seed });
      const centers = new Map(tiles.map(tile => [riverKey(tile), hexToPixel(tile.coord, 36)]));
      for (const curve of buildRiverCurves(tiles, 36)) {
        const center = centers.get(curve.tileKey)!;
        for (const point of [...curve.points, ...Array.from({ length: 41 }, (_, i) => sampleRiverCurve(curve, i / 40))]) {
          const x = Math.abs(point.x - center.x), y = Math.abs(point.y - center.y);
          expect(y).toBeLessThanOrEqual(Math.sqrt(3) * 18 + 1e-8);
          expect(Math.sqrt(3) * x + y).toBeLessThanOrEqual(Math.sqrt(3) * 36 + 1e-8);
        }
      }
    }
  });

  it('shares positions, tangent directions and widths at every join', () => {
    const curves = buildRiverCurves(generateMap({ targetTiles: 91, seed: 90210 }), 36);
    expect(curves.length).toBeGreaterThan(2);
    let joins = 0;
    for (const curve of curves) {
      const end = curve.points[3];
      const next = curves.find(other => other !== curve && other.points[0].x === end.x && other.points[0].y === end.y);
      if (!next) continue;
      joins++;
      const outgoing = { x: end.x - curve.points[2].x, y: end.y - curve.points[2].y };
      const incoming = { x: next.points[1].x - end.x, y: next.points[1].y - end.y };
      expect(outgoing.x).toBeCloseTo(incoming.x, 8);
      expect(outgoing.y).toBeCloseTo(incoming.y, 8);
      expect(curve.endWidth).toBe(next.startWidth);
    }
    expect(joins).toBeGreaterThan(1);
  });

  it('does not reshape curves on exploration, selection-related state or reload', () => {
    const tiles = generateMap({ targetTiles: 37, seed: 42 });
    const before = buildRiverCurves(tiles, 36);
    expect(before.length).toBeGreaterThan(0);
    tiles.forEach(tile => { tile.visible = true; tile.surveyed = true; tile.controlled = true; });
    expect(buildRiverCurves(tiles, 36)).toEqual(before);
    expect(buildRiverCurves(JSON.parse(JSON.stringify(tiles)), 36)).toEqual(before);
    expect(buildRiverCurves([...tiles].reverse(), 36)).toEqual(before);
  });
});
