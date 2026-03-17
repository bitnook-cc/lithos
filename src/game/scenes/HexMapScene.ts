import Phaser from 'phaser';
import { renderMap, renderLabels, loadTileIcons, HEX_SIZE } from '../hex/hexRenderer';
import { pixelToHex, hexToPixel } from '../hex/hexUtils';
import { useGameStore } from '@/store/gameStore';
import { HexCoord } from '@/types/map';

export class HexMapScene extends Phaser.Scene {
  private graphics!: Phaser.GameObjects.Graphics;
  private cameraOffset = { x: 0, y: 0 };
  private zoomLevel = 2.0;
  private isDragging = false;
  private dragStart = { x: 0, y: 0 };
  private selectedCoord: HexCoord | null = null;
  private iconCache = new Map<string, Phaser.GameObjects.Image>();
  private buildingLabelCache = new Map<string, Phaser.GameObjects.Text>();
  private lastHoveredKey: string | null = null;

  constructor() {
    super({ key: 'HexMapScene' });
  }

  create(): void {
    this.graphics = this.add.graphics();

    // Load SVG tile icons as textures
    loadTileIcons(this);

    // Center camera offset
    this.cameraOffset = {
      x: this.scale.width / 2,
      y: this.scale.height / 2,
    };

    // Pan with drag
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.isDragging = true;
      this.dragStart = { x: pointer.x - this.cameraOffset.x, y: pointer.y - this.cameraOffset.y };
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging) {
        this.cameraOffset.x = pointer.x - this.dragStart.x;
        this.cameraOffset.y = pointer.y - this.dragStart.y;
      }

      // Emit hover event for React tooltip
      this.emitHover(pointer.x, pointer.y);
    });

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (!this.isDragging) return;
      this.isDragging = false;

      // If minimal drag, treat as click
      const dx = Math.abs(pointer.x - (this.dragStart.x + this.cameraOffset.x));
      const dy = Math.abs(pointer.y - (this.dragStart.y + this.cameraOffset.y));
      if (dx < 5 && dy < 5) {
        this.handleTileClick(pointer.x, pointer.y);
      }
    });

    // Zoom with scroll wheel
    // Phaser wheel callback: (pointer, gameObjects, deltaX, deltaY, deltaZ)
    this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _gameObjects: any[], _deltaX: number, deltaY: number) => {
      const zoomDelta = deltaY > 0 ? -0.15 : 0.15;
      this.zoomLevel = Math.max(0.5, Math.min(4.0, this.zoomLevel + zoomDelta));
      this.cameras.main.setZoom(this.zoomLevel);
    });

    // Set default zoom
    this.cameras.main.setZoom(this.zoomLevel);

    // Subscribe to store changes
    useGameStore.subscribe(() => this.renderCurrentMap());
    this.renderCurrentMap();
  }

  private screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    const x = (screenX - centerX) / this.zoomLevel + centerX - this.cameraOffset.x;
    const y = (screenY - centerY) / this.zoomLevel + centerY - this.cameraOffset.y;
    return { x, y };
  }

  private emitHover(screenX: number, screenY: number): void {
    const world = this.screenToWorld(screenX, screenY);
    const coord = pixelToHex(world.x, world.y, HEX_SIZE);

    const state = useGameStore.getState();
    const tile = state.map.find(t =>
      t.coord.q === coord.q && t.coord.r === coord.r && t.coord.s === coord.s
    );

    const key = tile ? `${tile.coord.q},${tile.coord.r},${tile.coord.s}` : null;

    // Only emit when hovered tile changes
    if (key === this.lastHoveredKey) return;
    this.lastHoveredKey = key;

    if (tile) {
      window.dispatchEvent(new CustomEvent('tile-hovered', {
        detail: { tile, screenX, screenY }
      }));
    } else {
      window.dispatchEvent(new CustomEvent('tile-hovered', {
        detail: { tile: null }
      }));
    }
  }

  private renderCurrentMap(): void {
    const { map } = useGameStore.getState();
    renderMap(this.graphics, map, this.cameraOffset.x, this.cameraOffset.y, this.selectedCoord);
    renderLabels(this, map, this.cameraOffset.x, this.cameraOffset.y, this.iconCache, this.buildingLabelCache);
  }

  update(): void {
    this.renderCurrentMap();
  }

  private handleTileClick(screenX: number, screenY: number): void {
    const world = this.screenToWorld(screenX, screenY);
    const coord = pixelToHex(world.x, world.y, HEX_SIZE);

    const state = useGameStore.getState();
    const tile = state.map.find(t =>
      t.coord.q === coord.q && t.coord.r === coord.r && t.coord.s === coord.s
    );

    if (tile) {
      this.selectedCoord = tile.coord;
      // Emit tile selection for React UI to handle
      window.dispatchEvent(new CustomEvent('tile-selected', { detail: { tile, coord } }));
    }
  }
}
