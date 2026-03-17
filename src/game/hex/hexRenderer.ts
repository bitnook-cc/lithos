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
  rainforest: 0x1a5c1a,
  swamp: 0x4a6a3a,
  hills: 0xa89060,
  snow: 0xd0d8e0,
  ice: 0x8ec8e8,
};

// Lucide icon SVG paths (24x24 viewBox) for crisp vector rendering
const TILE_SVG_PATHS: Record<TileType, string> = {
  plains: '<path d="M2 22 16 8"/><path d="m3.47 12.53 5 5"/><path d="M5 17c-1.2-1-1.6-3.2 0-4.4l7.4-5.6C14 5.8 16.2 6 17.4 7.2l0 0c1.2 1.2 1.4 3.2-.2 4.8L11.6 17c-1.2 1.6-3.4 1.2-4.6 0"/><path d="m14 8 6-6"/><path d="M17 4 4 17"/><path d="m20 11-7.4 5.6"/>', // wheat
  forest: '<path d="M10 10v.2A3 3 0 0 1 8.9 16H5a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z"/><path d="M7 16v6"/><path d="M13 19v3"/><path d="M16 10v.2a3 3 0 0 1 2.1 5.8H15a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0v.2"/><path d="M13 16h3"/>', // tree-deciduous
  mountain: '<path d="m8 3 4 8 5-5 5 15H2L8 3z"/>', // mountain
  water: '<path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>', // waves
  desert: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>', // sun (for desert heat)
  ruins: '<line x1="6" x2="6" y1="20" y2="9"/><line x1="10" x2="10" y1="20" y2="4"/><line x1="14" x2="14" y1="20" y2="4"/><line x1="18" x2="18" y1="20" y2="9"/><path d="M4 20h16"/><path d="M2 20h20"/><path d="M6 9h12l-1.5-5h-9Z"/>', // landmark (columns)
  fertile: '<path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.5 9.4c-1.1.8-1.8 2.2-2.3 3.7 2 .4 3.5.4 4.8-.3 1.2-.6 2.3-1.9 3-4.2-2.8-.5-4.4 0-5.5.8z"/>', // sprout
  special: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>', // star
  rainforest: '<path d="M10 10v.2A3 3 0 0 1 8.9 16H5a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z"/><path d="M7 16v6"/><path d="M13 19v3"/><path d="M16 10v.2a3 3 0 0 1 2.1 5.8H15a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0v.2"/><path d="M13 16h3"/><circle cx="12" cy="4" r="1"/>', // tree + rain
  swamp: '<path d="M12 22v-4"/><path d="M7 12H2"/><path d="M22 12h-5"/><path d="m17 8-5 5"/><path d="m7 8 5 5"/><circle cx="12" cy="6" r="2"/>', // swamp plant
  hills: '<path d="m2 18 4-8 4 4 4-6 4 4 4-4"/><line x1="2" y1="18" x2="22" y2="18"/>', // rolling hills
  snow: '<path d="M2 12h20"/><path d="M12 2v20"/><path d="m4.93 4.93 14.14 14.14"/><path d="m19.07 4.93-14.14 14.14"/>', // snowflake
  ice: '<path d="M12 2v4"/><path d="M12 18v4"/><path d="m4.93 7.93 2.83 2.83"/><path d="m16.24 13.24 2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="m4.93 16.07 2.83-2.83"/><path d="m16.24 10.76 2.83-2.83"/>', // crystal
};

/** Generate an SVG data URL for a tile icon */
function makeSvgDataUrl(paths: string, color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/** Preload tile icon textures into a Phaser scene. Call once in scene preload/create. */
export function loadTileIcons(scene: Phaser.Scene): void {
  const iconColor = '#ffffff';
  for (const [type, paths] of Object.entries(TILE_SVG_PATHS)) {
    const key = `tile_icon_${type}`;
    if (scene.textures.exists(key)) continue;
    const url = makeSvgDataUrl(paths, iconColor);
    scene.textures.addBase64(key, url);
  }
}

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
  }

  // Draw selection highlight AFTER all tiles so it's never covered
  if (selectedCoord) {
    const { x, y } = hexToPixel(selectedCoord, HEX_SIZE);
    graphics.lineStyle(3, 0x00ffff);
    graphics.fillStyle(0x00ffff, 0.0); // transparent fill so strokePath works
    drawHex(graphics, x + offsetX, y + offsetY, HEX_SIZE - 1);
  }
}

function hexKey(coord: HexCoord): string {
  return `${coord.q},${coord.r},${coord.s}`;
}

/**
 * Create/update Phaser Image + Text objects for tile icons and building labels.
 * Uses Maps to cache objects so they aren't recreated every frame.
 */
export function renderLabels(
  scene: Phaser.Scene,
  tiles: Tile[],
  offsetX: number,
  offsetY: number,
  iconCache: Map<string, Phaser.GameObjects.Image>,
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

    // Tile icon (SVG-based image)
    const textureKey = `tile_icon_${tile.type}`;
    if (scene.textures.exists(textureKey)) {
      if (iconCache.has(key)) {
        const img = iconCache.get(key)!;
        img.setPosition(screenX, screenY - 4);
        img.setTexture(textureKey);
        img.setVisible(true);
      } else {
        const img = scene.add.image(screenX, screenY - 4, textureKey);
        img.setOrigin(0.5);
        img.setScale(0.6);
        img.setDepth(10);
        img.setAlpha(0.85);
        iconCache.set(key, img);
      }
    }

    // Building label
    const bKey = `b_${key}`;
    if (tile.building) {
      const bDef = getBuildingDef(tile.building);
      const bName = bDef?.name ?? tile.building;
      if (buildingLabelCache.has(bKey)) {
        const txt = buildingLabelCache.get(bKey)!;
        txt.setPosition(screenX, screenY + 12);
        txt.setText(bName);
        txt.setVisible(true);
      } else {
        const txt = scene.add.text(screenX, screenY + 12, bName, {
          fontSize: '16px',
          color: '#fff',
          fontStyle: 'bold',
          stroke: '#000',
          strokeThickness: 4,
          align: 'center',
          resolution: 2,
        }).setOrigin(0.5).setScale(0.5);
        txt.setDepth(10);
        buildingLabelCache.set(bKey, txt);
      }
    } else if (buildingLabelCache.has(bKey)) {
      buildingLabelCache.get(bKey)!.setVisible(false);
    }
  }

  // Hide objects for tiles no longer visible
  for (const [key, img] of iconCache) {
    if (!seenKeys.has(key)) img.setVisible(false);
  }
  for (const [key, txt] of buildingLabelCache) {
    const tileKey = key.replace('b_', '');
    if (!seenKeys.has(tileKey)) txt.setVisible(false);
  }
}

export { HEX_SIZE };
