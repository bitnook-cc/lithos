import Phaser from 'phaser';
import { Tile } from '@/types/map';
import { riverKey } from '@/logic/riverGeneration';
import { buildRiverCurves, sampleRiverCurve } from './riverGeometry';

export function drawRivers(graphics: Phaser.GameObjects.Graphics, tiles: Tile[], size: number, offsetX: number, offsetY: number) {
  const visible = new Set(tiles.filter(tile => tile.visible).map(riverKey));
  const curves = buildRiverCurves(tiles, size).filter(curve => visible.has(curve.tileKey));
  // Draw each complete layer before the next so tile seams cannot leave bank
  // rings across the water. Round sampled strokes form a tapered channel.
  for (const layer of [
    { extra: 2.2, scale: 1, color: 0x25454b, alpha: 0.8 },
    { extra: 0, scale: 1, color: 0x559ba8, alpha: 1 },
    { extra: 0, scale: 0.22, color: 0xb2d6d5, alpha: 0.55 },
  ]) {
    for (const curve of curves) {
      let last = sampleRiverCurve(curve, 0);
      for (let step = 1; step <= 20; step++) {
        const t = step / 20, point = sampleRiverCurve(curve, t);
        const width = (curve.startWidth + (curve.endWidth - curve.startWidth) * t) * layer.scale + layer.extra;
        const alpha = layer.alpha * (curve.mouth ? (1 - t) ** 0.65 : 1);
        graphics.lineStyle(width, layer.color, alpha);
        graphics.lineBetween(last.x + offsetX, last.y + offsetY, point.x + offsetX, point.y + offsetY);
        graphics.fillStyle(layer.color, alpha).fillCircle(point.x + offsetX, point.y + offsetY, width / 2);
        last = point;
      }
    }
  }
}
