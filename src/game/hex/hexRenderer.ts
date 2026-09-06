import Phaser from 'phaser';
import { HexCoord, Tile, TileType } from '@/types/map';
import { getBuildingDef } from '@/data/buildings';
import { getLandmark, getMapFeature, getResourceNode } from '@/data/mapFeatures';
import { hexNeighbors, hexToPixel } from './hexUtils';
import { territoryEdges, MapTransition } from '@/logic/mapPresentation';
import { districtKey } from '@/logic/mapSignals';
import { buildingSymbol } from './buildingSymbols';

export const HEX_SIZE = 36;

interface TerrainStyle { base: number; high: number; line: number; }
const TERRAIN: Record<TileType, TerrainStyle> = {
  plains: { base: 0x778650, high: 0x9aa765, line: 0x53613c },
  forest: { base: 0x365d43, high: 0x567c52, line: 0x203c2c },
  mountain: { base: 0x686d67, high: 0xa6aaa0, line: 0x424944 },
  water: { base: 0x315f72, high: 0x4f8996, line: 0x234a5b },
  desert: { base: 0xb18b54, high: 0xd1b574, line: 0x7e653f },
  ruins: { base: 0x817354, high: 0xb29b6b, line: 0x514b3b },
  fertile: { base: 0x688b50, high: 0x98b767, line: 0x46653c },
  special: { base: 0x755d78, high: 0xaa8baa, line: 0x503c54 },
  rainforest: { base: 0x28523c, high: 0x467454, line: 0x173627 },
  swamp: { base: 0x52664f, high: 0x778369, line: 0x354335 },
  hills: { base: 0x867654, high: 0xaa9666, line: 0x5c503a },
  snow: { base: 0xb8c0bc, high: 0xe1e5df, line: 0x818c8b },
  ice: { base: 0x87afb8, high: 0xc0d7d8, line: 0x628c98 },
};
const FOG = 0x172123;
const isWaterTile = (type: TileType) => type === 'water' || type === 'ice';
const keyOf = (coord: HexCoord) => `${coord.q},${coord.r},${coord.s}`;

function points(x: number, y: number, size: number) {
  return Array.from({ length: 6 }, (_, index) => {
    const angle = Math.PI / 180 * 60 * index;
    return { x: x + size * Math.cos(angle), y: y + size * Math.sin(angle) };
  });
}

export function drawHex(graphics: Phaser.GameObjects.Graphics, x: number, y: number, size: number): void {
  const corners = points(x, y, size);
  graphics.beginPath();
  graphics.moveTo(corners[0].x, corners[0].y);
  for (let index = 1; index < corners.length; index++) graphics.lineTo(corners[index].x, corners[index].y);
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
}

function hash(tile: Tile, salt: number) {
  const value = Math.sin(tile.coord.q * 91.17 + tile.coord.r * 47.73 + salt * 13.1) * 43758.5453;
  return value - Math.floor(value);
}

function drawTerrainDetails(graphics: Phaser.GameObjects.Graphics, tile: Tile, x: number, y: number) {
  const style = TERRAIN[tile.type];
  const amount = tile.type === 'rainforest' ? 6 : tile.type === 'forest' ? 5 : 3;
  if (tile.type === 'forest' || tile.type === 'rainforest') {
    for (let i = 0; i < amount; i++) {
      const dx = (hash(tile, i) - 0.5) * 39;
      const dy = (hash(tile, i + 20) - 0.5) * 28;
      const radius = tile.type === 'rainforest' ? 5.5 : 4.5;
      graphics.fillStyle(style.high, 0.72).fillCircle(x + dx, y + dy, radius);
      graphics.fillStyle(style.line, 0.75).fillCircle(x + dx, y + dy + 3, radius * 0.55);
    }
  } else if (tile.type === 'mountain') {
    graphics.fillStyle(style.line, 0.75).fillTriangle(x - 22, y + 16, x - 4, y - 19, x + 7, y + 16);
    graphics.fillStyle(style.high, 0.72).fillTriangle(x - 6, y + 16, x + 10, y - 13, x + 26, y + 16);
    graphics.fillStyle(0xe8e4d8, 0.72).fillTriangle(x - 10, y - 7, x - 4, y - 19, x + 1, y - 8);
  } else if (tile.type === 'hills') {
    graphics.lineStyle(2, style.high, 0.58);
    graphics.beginPath().moveTo(x - 25, y + 9).lineTo(x - 13, y - 3).lineTo(x - 2, y + 9).lineTo(x + 10, y - 6).lineTo(x + 24, y + 9).strokePath();
  } else if (tile.type === 'water' || tile.type === 'ice') {
    graphics.lineStyle(1.5, style.high, 0.52);
    for (let i = -1; i <= 1; i++) graphics.lineBetween(x - 20 + (i & 1 ? 5 : 0), y + i * 9, x + 20, y + i * 9);
    if (tile.type === 'ice') {
      graphics.lineStyle(1, 0xeaf5f2, 0.55).lineBetween(x - 7, y - 13, x + 6, y + 12);
      graphics.lineBetween(x - 15, y + 3, x + 13, y - 5);
    }
  } else if (tile.type === 'desert') {
    graphics.lineStyle(2, style.high, 0.6);
    graphics.beginPath().moveTo(x - 25, y + 6).lineTo(x - 10, y - 2).lineTo(x + 3, y + 5).lineTo(x + 18, y).lineTo(x + 25, y + 3).strokePath();
  } else if (tile.type === 'swamp') {
    graphics.lineStyle(1.5, style.high, 0.55);
    for (let i = 0; i < 4; i++) {
      const dx = -18 + i * 12;
      graphics.lineBetween(x + dx, y + 13, x + dx + 1, y - 5 - (i % 2) * 4);
      graphics.lineBetween(x + dx + 1, y, x + dx + 6, y - 6);
    }
  } else if (tile.type === 'snow') {
    graphics.fillStyle(style.high, 0.48).fillTriangle(x - 27, y + 13, x - 5, y - 8, x + 7, y + 13);
  } else if (tile.type === 'ruins') {
    graphics.lineStyle(3, style.high, 0.6);
    graphics.lineBetween(x - 13, y + 13, x - 13, y - 9);
    graphics.lineBetween(x + 10, y + 13, x + 10, y - 4);
    graphics.lineBetween(x - 19, y + 13, x + 17, y + 13);
  } else {
    graphics.lineStyle(1.5, style.high, 0.48);
    for (let i = 0; i < amount; i++) {
      const dx = -18 + i * 16 + hash(tile, i) * 5;
      graphics.lineBetween(x + dx, y + 12, x + dx + 3, y - 3 - hash(tile, i + 5) * 6);
      graphics.lineBetween(x + dx + 2, y + 4, x + dx + 7, y);
    }
  }
}

function drawNetwork(graphics: Phaser.GameObjects.Graphics, tile: Tile, tilesByKey: Map<string, Tile>, x: number, y: number, offsetX: number, offsetY: number) {
  if (tile.road) {
    graphics.lineStyle(4.5, 0x5a4430, 0.75);
    for (const coord of hexNeighbors(tile.coord)) {
      const neighbor = tilesByKey.get(keyOf(coord));
      if (!neighbor?.road || keyOf(tile.coord) > keyOf(coord)) continue;
      const target = hexToPixel(coord, HEX_SIZE);
      graphics.lineBetween(x, y, target.x + offsetX, target.y + offsetY);
    }
    graphics.lineStyle(1.4, 0xd2b077, 0.72);
    for (const coord of hexNeighbors(tile.coord)) {
      const neighbor = tilesByKey.get(keyOf(coord));
      if (!neighbor?.road || keyOf(tile.coord) > keyOf(coord)) continue;
      const target = hexToPixel(coord, HEX_SIZE);
      graphics.lineBetween(x, y, target.x + offsetX, target.y + offsetY);
    }
  }
  const riverEdges = tile.riverEdges ?? [];
  for (const direction of riverEdges) {
    const coord = hexNeighbors(tile.coord)[direction];
    const neighbor = tilesByKey.get(keyOf(coord));
    if (!neighbor?.visible || keyOf(tile.coord) > keyOf(coord)) continue;
    const target = hexToPixel(coord, HEX_SIZE);
    const targetX = target.x + offsetX, targetY = target.y + offsetY;
    const dx = targetX - x, dy = targetY - y;
    const length = Math.max(1, Math.hypot(dx, dy));
    const bend = (hash(tile, 70 + direction) - 0.5) * 15;
    const controlX = (x + targetX) / 2 - dy / length * bend;
    const controlY = (y + targetY) / 2 + dx / length * bend;
    const strokeRiver = (width: number, color: number, alpha: number) => {
      graphics.lineStyle(width, color, alpha);
      graphics.beginPath().moveTo(x, y);
      for (let segment = 1; segment <= 8; segment++) {
        const t = segment / 8, inverse = 1 - t;
        graphics.lineTo(
          inverse * inverse * x + 2 * inverse * t * controlX + t * t * targetX,
          inverse * inverse * y + 2 * inverse * t * controlY + t * t * targetY,
        );
      }
      graphics.strokePath();
    };
    strokeRiver(6.2, 0x173949, 0.82);
    strokeRiver(3.7, 0x4f9fb3, 1);
    strokeRiver(1.25, 0xa4deDF, 0.76);
  }
  if (riverEdges.length === 1) {
    const neighbor = tilesByKey.get(keyOf(hexNeighbors(tile.coord)[riverEdges[0]]));
    if (neighbor && tile.elevation >= neighbor.elevation && !isWaterTile(tile.type)) {
      graphics.fillStyle(0xb8e5e2, 0.95).fillCircle(x, y, 3.2);
      graphics.lineStyle(1.4, 0x285565, 0.9).strokeCircle(x, y, 4.5);
    }
  }
}

function drawTerritoryEdges(graphics: Phaser.GameObjects.Graphics, tile: Tile, tilesByKey: Map<string, Tile>, x: number, y: number) {
  if (!tile.controlled && !tile.rivalId) return;
  const corners = points(x, y, HEX_SIZE - 1.5);
  // Dark under-stroke keeps the perimeter readable against every terrain.
  const edges = territoryEdges(tile, tilesByKey);
  for (const [width, color] of [[5.5, 0x182020], [2.8, tile.controlled ? 0xd9bd68 : 0xdb8276]]) {
    graphics.lineStyle(width, color, 1);
    for (const index of edges) {
      const a = corners[(index + 5) % 6];
      const b = corners[index];
      graphics.lineBetween(a.x, a.y, b.x, b.y);
    }
  }
}

function drawBuilding(graphics: Phaser.GameObjects.Graphics, tile: Tile, x: number, y: number) {
  if (!tile.building || !(tile.controlled || tile.surveyed)) return;
  const kind = buildingSymbol(tile.building);
  graphics.fillStyle(0x182020, .85).fillCircle(x, y, 12);
  graphics.lineStyle(2, tile.worked || tile.rivalId ? 0xffe0a3 : 0xb6b1a6, 1);
  if (kind === 'hearth') {
    graphics.strokeTriangle(x - 8, y + 6, x, y - 8, x + 8, y + 6);
    graphics.lineBetween(x - 3, y + 6, x, y);
    graphics.lineBetween(x, y, x + 3, y + 6);
  } else if (kind === 'food') {
    graphics.lineBetween(x, y + 8, x, y - 8);
    for (const dy of [-5, 0, 5]) { graphics.lineBetween(x, y + dy, x - 6, y + dy - 4); graphics.lineBetween(x, y + dy, x + 6, y + dy - 4); }
  } else if (kind === 'materials') {
    graphics.lineBetween(x - 5, y + 8, x + 4, y - 7);
    graphics.beginPath().moveTo(x - 8, y - 2).lineTo(x, y - 7).lineTo(x + 8, y - 3).strokePath();
  } else if (kind === 'knowledge') {
    graphics.strokeTriangle(x - 9, y - 3, x, y - 9, x + 9, y - 3);
    graphics.lineBetween(x - 6, y - 1, x - 6, y + 7); graphics.lineBetween(x + 6, y - 1, x + 6, y + 7);
    graphics.lineBetween(x - 9, y + 8, x + 9, y + 8);
  } else if (kind === 'defense') {
    graphics.strokeRect(x - 6, y - 6, 12, 14);
    graphics.lineBetween(x - 7, y - 6, x - 7, y - 10); graphics.lineBetween(x, y - 6, x, y - 10); graphics.lineBetween(x + 7, y - 6, x + 7, y - 10);
  } else if (kind === 'water') {
    graphics.beginPath().moveTo(x - 9, y + 1).lineTo(x - 5, y + 7).lineTo(x + 5, y + 7).lineTo(x + 9, y + 1).closePath().strokePath();
    graphics.lineBetween(x, y + 1, x, y - 9); graphics.lineBetween(x, y - 8, x + 7, y - 2);
  } else {
    graphics.strokeRect(x - 7, y - 1, 14, 10);
    graphics.strokeTriangle(x - 10, y - 2, x, y - 9, x + 10, y - 2);
  }
}

export function renderMap(graphics: Phaser.GameObjects.Graphics, tiles: Tile[], offsetX: number, offsetY: number, selectedCoord?: HexCoord | null, threatened = new Set<string>(), claimable = false, guideCoord?: HexCoord | null): void {
  graphics.clear();
  const tilesByKey = new Map(tiles.map(tile => [keyOf(tile.coord), tile]));
  const ownershipByKey = new Map(tiles.map(tile => [districtKey(tile.coord), tile]));
  for (const tile of tiles) {
    const position = hexToPixel(tile.coord, HEX_SIZE);
    const x = position.x + offsetX;
    const y = position.y + offsetY;
    if (!tile.visible) {
      graphics.fillStyle(FOG, 0.94).lineStyle(1, 0x263234, 0.9);
      drawHex(graphics, x, y, HEX_SIZE - 0.5);
      if (hash(tile, 2) > 0.55) graphics.fillStyle(0x344143, 0.28).fillCircle(x + (hash(tile, 3) - .5) * 25, y + (hash(tile, 4) - .5) * 22, 5);
      continue;
    }
    const style = TERRAIN[tile.type] ?? TERRAIN.plains;
    graphics.fillStyle(style.base, 1).lineStyle(1.25, style.line, 0.95);
    drawHex(graphics, x, y, HEX_SIZE - 0.5);
    graphics.fillStyle(style.high, 0.1 + tile.elevation * 0.13).lineStyle(0, style.high, 0);
    drawHex(graphics, x - 2, y - 2, HEX_SIZE - 5);
    drawTerrainDetails(graphics, tile, x, y);
    if (tile.controlled && !tile.worked) {
      graphics.fillStyle(0x111718, 0.42).lineStyle(1, 0x8a8170, 0.35);
      drawHex(graphics, x, y, HEX_SIZE - 6);
      graphics.lineBetween(x - 12, y - 5, x + 12, y + 5);
    }
  }
  for (const tile of tiles.filter(tile => tile.visible)) {
    const position = hexToPixel(tile.coord, HEX_SIZE);
    drawNetwork(graphics, tile, tilesByKey, position.x + offsetX, position.y + offsetY, offsetX, offsetY);
  }
  for (const tile of tiles.filter(tile => tile.visible)) {
    const position = hexToPixel(tile.coord, HEX_SIZE);
    drawTerritoryEdges(graphics, tile, ownershipByKey, position.x + offsetX, position.y + offsetY);
    drawBuilding(graphics, tile, position.x + offsetX, position.y + offsetY - 3);
    if (threatened.has(`${tile.coord.q},${tile.coord.r}`)) {
      const x = position.x + offsetX - 15, y = position.y + offsetY - 14;
      graphics.fillStyle(0xffd099, 1).fillTriangle(x, y - 9, x - 9, y + 7, x + 9, y + 7);
      graphics.lineStyle(2, 0x48281c, 1).lineBetween(x, y - 4, x, y + 1);
      graphics.fillStyle(0x48281c, 1).fillCircle(x, y + 4, 1.2);
    }
  }
  if (guideCoord && (!selectedCoord || districtKey(guideCoord) !== districtKey(selectedCoord))) {
    const point = hexToPixel(guideCoord, HEX_SIZE);
    graphics.lineStyle(2, 0xe7d7af, .9).strokeCircle(point.x + offsetX, point.y + offsetY - 15, 7);
    graphics.fillStyle(0xe7d7af, 1).fillCircle(point.x + offsetX, point.y + offsetY - 15, 2);
  }
  if (selectedCoord && tiles.some(t => t.visible && districtKey(t.coord) === districtKey(selectedCoord))) {
    const position = hexToPixel(selectedCoord, HEX_SIZE);
    const x = position.x + offsetX, y = position.y + offsetY;
    if (claimable) {
      const ring = points(x, y, HEX_SIZE - 5);
      graphics.lineStyle(2, 0x94dca5, 1);
      ring.forEach((a, i) => { const b = ring[(i + 1) % 6]; graphics.lineBetween(a.x + (b.x - a.x) * .18, a.y + (b.y - a.y) * .18, a.x + (b.x - a.x) * .82, a.y + (b.y - a.y) * .82); });
    }
    const corners = points(x, y, HEX_SIZE - 12);
    // Inset corner brackets are inspection, never a second territorial perimeter.
    for (const [width, color] of [[5, 0x172b30], [2.5, 0xa3eeff]]) {
      graphics.lineStyle(width, color, 1);
      corners.forEach((corner, i) => {
        for (const adjacent of [corners[(i + 5) % 6], corners[(i + 1) % 6]]) graphics.lineBetween(corner.x, corner.y, corner.x + (adjacent.x - corner.x) * .28, corner.y + (adjacent.y - corner.y) * .28);
      });
    }
  }
}

export function renderMapTransitions(graphics: Phaser.GameObjects.Graphics, transitions: Array<MapTransition & { progress: number }>, offsetX: number, offsetY: number) {
  graphics.clear();
  for (const motion of transitions) {
    const point = hexToPixel(motion.coord, HEX_SIZE);
    const x = point.x + offsetX, y = point.y + offsetY, p = motion.progress;
    if (motion.kind === 'reveal') {
      graphics.fillStyle(FOG, 1 - p).lineStyle(0, FOG, 0);
      drawHex(graphics, x, y, HEX_SIZE - .5);
    } else if (motion.kind === 'survey') {
      graphics.lineStyle(2, 0xa3eeff, 1 - p).strokeCircle(x, y, 9 + p * 24);
    } else if (motion.kind === 'claim') {
      graphics.fillStyle(0x94dca5, .2 * (1 - p)).lineStyle(2, 0x94dca5, 1 - p);
      drawHex(graphics, x, y, HEX_SIZE - 14 + 12 * p);
    } else {
      const lift = p * 13;
      graphics.lineStyle(2.5, 0xffe0a3, Math.min(1, (1 - p) * 3));
      graphics.lineBetween(x - 7, y - 7 - lift, x - 2, y - 2 - lift);
      graphics.lineBetween(x - 2, y - 2 - lift, x + 9, y - 14 - lift);
      graphics.lineStyle(1.5, 0xffe0a3, 1 - p).strokeCircle(x, y, 12 + p * 14);
    }
  }
}

export function renderLabels(scene: Phaser.Scene, tiles: Tile[], offsetX: number, offsetY: number, markerCache: Map<string, Phaser.GameObjects.Text>, buildingLabelCache: Map<string, Phaser.GameObjects.Text>, selectedCoord?: HexCoord | null): void {
  const seen = new Set<string>();
  const labelBounds: Array<{ x: number; y: number; width: number; height: number }> = [];
  const priority = (tile: Tile) => selectedCoord && districtKey(tile.coord) === districtKey(selectedCoord) ? 2 : tile.settlementName ? 1 : 0;
  for (const tile of [...tiles].sort((a, b) => priority(b) - priority(a))) {
    if (!tile.visible) continue;
    const key = keyOf(tile.coord);
    seen.add(key);
    const position = hexToPixel(tile.coord, HEX_SIZE);
    const x = position.x + offsetX, y = position.y + offsetY;
    const surveyed = tile.surveyed || tile.controlled;
    const landmark = surveyed ? getLandmark(tile.landmark) : null;
    const feature = surveyed ? getMapFeature(tile.feature) : null;
    const resource = surveyed ? getResourceNode(tile.resource) : null;
    const marker = !surveyed ? '?' : landmark ? landmark.glyph : resource ? resource.glyph : feature ? feature.glyph : '';
    const markerColor = landmark ? `#${landmark.color.toString(16).padStart(6, '0')}` : resource ? `#${resource.color.toString(16).padStart(6, '0')}` : feature ? `#${feature.color.toString(16).padStart(6, '0')}` : '#ffffff';
    let text = markerCache.get(key);
    if (!text) {
      text = scene.add.text(x, y, marker, { fontFamily: 'Georgia, serif', fontSize: landmark ? '22px' : '14px', color: markerColor, stroke: '#172020', strokeThickness: landmark ? 4 : 3, resolution: 2 }).setOrigin(0.5).setDepth(12);
      markerCache.set(key, text);
    }
    text.setPosition(x + (tile.building && surveyed ? 17 : resource && !landmark ? 15 : feature && !resource && !landmark ? -14 : 0), y + (tile.building && surveyed ? 9 : landmark ? -2 : 11));
    text.setText(marker).setColor(markerColor).setFontSize(landmark ? 22 : 14).setAlpha(landmark && !tile.landmarkInvestigated ? 1 : 0.84).setVisible(Boolean(marker));

    const labelKey = `b_${key}`;
    const definition = tile.building ? getBuildingDef(tile.building) : null;
    let label = buildingLabelCache.get(labelKey);
    if (tile.building && surveyed) {
      const labelText = tile.settlementName ?? definition?.name ?? tile.building;
      if (!label) {
        label = scene.add.text(x, y + 20, labelText, { fontFamily: 'Inter, sans-serif', fontSize: '8px', fontStyle: 'bold', color: '#f3ead4', backgroundColor: tile.rivalId ? '#782f2a' : '#4a3824', padding: { x: 4, y: 2 }, resolution: 2 }).setOrigin(0.5).setDepth(14);
        buildingLabelCache.set(labelKey, label);
      }
      label.setPosition(x, y + 20).setText(labelText);
      const bounds = { x: x - label.width / 2, y: y + 20 - label.height / 2, width: label.width, height: label.height };
      const overlaps = labelBounds.some(b => bounds.x < b.x + b.width + 4 && bounds.x + bounds.width + 4 > b.x && bounds.y < b.y + b.height + 3 && bounds.y + bounds.height + 3 > b.y);
      const visible = (priority(tile) > 0 || scene.cameras.main.zoom >= 1.8) && !overlaps;
      label.setVisible(visible);
      if (visible) labelBounds.push(bounds);
    } else label?.setVisible(false);
  }
  for (const [key, marker] of markerCache) if (!seen.has(key)) marker.setVisible(false);
  for (const [key, label] of buildingLabelCache) if (!seen.has(key.replace('b_', ''))) label.setVisible(false);
}
