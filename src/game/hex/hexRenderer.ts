import Phaser from 'phaser';
import { Tile, TileType } from '@/types/map';
import { HexCoord } from '@/types/map';
import { hexToPixel } from './hexUtils';
import { getBuildingDef } from '@/data/buildings';

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

const TILE_ICONS: Record<TileType, string> = {
  plains: '🌾',
  forest: '🌲',
  mountain: '⛰️',
  water: '🌊',
  desert: '🏜️',
  ruins: '🏛️',
  fertile: '🌿',
  special: '✨',
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
  offsetY: number,
  selectedCoord?: HexCoord | null
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

    // Selected hex highlight
    if (selectedCoord &&
        tile.coord.q === selectedCoord.q &&
        tile.coord.r === selectedCoord.r &&
        tile.coord.s === selectedCoord.s) {
      graphics.lineStyle(3, 0x00ffff);
      drawHex(graphics, x + offsetX, y + offsetY, HEX_SIZE - 1);
    }
  }
}

function hexKey(coord: HexCoord): string {
  return `${coord.q},${coord.r},${coord.s}`;
}

/**
 * Create/update Phaser Text objects showing tile-type emoji and building name on each hex.
 * Uses a Map to track existing objects so they aren't recreated every frame.
 */
export function renderLabels(
  scene: Phaser.Scene,
  tiles: Tile[],
  offsetX: number,
  offsetY: number,
  labelCache: Map<string, Phaser.GameObjects.Text>,
  buildingLabelCache: Map<string, Phaser.GameObjects.Text>
): void {
  const seenKeys = new Set<string>();

  for (const tile of tiles) {
    if (!tile.visible) continue;

    const key = hexKey(tile.coord);
    seenKeys.add(key);

    const { x, y } = hexToPixel(tile.coord, HEX_SIZE);
    const screenX = x + offsetX;
    const screenY = y + offsetY;

    // Tile icon
    const icon = TILE_ICONS[tile.type] ?? '';
    if (labelCache.has(key)) {
      const txt = labelCache.get(key)!;
      txt.setPosition(screenX, screenY - 8);
      txt.setText(icon);
      txt.setVisible(true);
    } else {
      const txt = scene.add.text(screenX, screenY - 8, icon, {
        fontSize: '14px',
        align: 'center',
      }).setOrigin(0.5);
      txt.setDepth(10);
      labelCache.set(key, txt);
    }

    // Building label
    const bKey = `b_${key}`;
    if (tile.building) {
      const bDef = getBuildingDef(tile.building);
      const bName = bDef?.name ?? tile.building;
      if (buildingLabelCache.has(bKey)) {
        const txt = buildingLabelCache.get(bKey)!;
        txt.setPosition(screenX, screenY + 10);
        txt.setText(bName);
        txt.setVisible(true);
      } else {
        const txt = scene.add.text(screenX, screenY + 10, bName, {
          fontSize: '9px',
          color: '#fff',
          fontStyle: 'bold',
          stroke: '#000',
          strokeThickness: 2,
          align: 'center',
        }).setOrigin(0.5);
        txt.setDepth(10);
        buildingLabelCache.set(bKey, txt);
      }
    } else if (buildingLabelCache.has(bKey)) {
      buildingLabelCache.get(bKey)!.setVisible(false);
    }
  }

  // Hide labels for tiles no longer visible
  for (const [key, txt] of labelCache) {
    if (!seenKeys.has(key)) txt.setVisible(false);
  }
  for (const [key, txt] of buildingLabelCache) {
    const tileKey = key.replace('b_', '');
    if (!seenKeys.has(tileKey)) txt.setVisible(false);
  }
}

export { HEX_SIZE, TILE_ICONS };
