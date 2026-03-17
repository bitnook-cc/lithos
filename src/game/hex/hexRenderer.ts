import Phaser from 'phaser';
import { Tile, TileType } from '@/types/map';
import { hexToPixel } from './hexUtils';

const HEX_SIZE = 32;

const TILE_COLORS: Record<TileType, number> = {
  plains: 0x7ec850,
  forest: 0x2d6a2d,
  mountain: 0x8b8b8b,
  water: 0x4a90d9,
  desert: 0xd4a853,
  ruins: 0x8b6914,
  fertile: 0x4caf50,
  special: 0xab47bc,
};

const FOG_COLOR = 0x333344;

export function drawHex(graphics: Phaser.GameObjects.Graphics, x: number, y: number, size: number): void {
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i);
    points.push({
      x: x + size * Math.cos(angle),
      y: y + size * Math.sin(angle),
    });
  }
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < 6; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
}

export function renderMap(
  graphics: Phaser.GameObjects.Graphics,
  tiles: Tile[],
  offsetX: number,
  offsetY: number
): void {
  graphics.clear();

  for (const tile of tiles) {
    if (!tile.visible) {
      // Draw fog
      const { x, y } = hexToPixel(tile.coord, HEX_SIZE);
      graphics.fillStyle(FOG_COLOR, 0.5);
      graphics.lineStyle(1, 0x222233);
      drawHex(graphics, x + offsetX, y + offsetY, HEX_SIZE);
      continue;
    }

    const { x, y } = hexToPixel(tile.coord, HEX_SIZE);
    const color = TILE_COLORS[tile.type] ?? 0x666666;

    graphics.fillStyle(color);
    graphics.lineStyle(1, 0x111111);
    drawHex(graphics, x + offsetX, y + offsetY, HEX_SIZE);

    // Controlled indicator
    if (tile.controlled) {
      graphics.lineStyle(2, 0xffd700);
      drawHex(graphics, x + offsetX, y + offsetY, HEX_SIZE - 2);
    }

    // Rival indicator
    if (tile.rivalId) {
      graphics.lineStyle(2, 0xff4444);
      drawHex(graphics, x + offsetX, y + offsetY, HEX_SIZE - 2);
    }
  }
}

export { HEX_SIZE };
