import Phaser from 'phaser';
import { renderMap, renderLabels, HEX_SIZE } from '../hex/hexRenderer';
import { pixelToHex, hexToPixel } from '../hex/hexUtils';
import { useGameStore } from '@/store/gameStore';
import { HexCoord } from '@/types/map';

export class HexMapScene extends Phaser.Scene {
  private graphics!: Phaser.GameObjects.Graphics;
  private cameraOffset = { x: 0, y: 0 };
  private isDragging = false;
  private dragStart = { x: 0, y: 0 };
  private selectedCoord: HexCoord | null = null;
  private labelCache = new Map<string, Phaser.GameObjects.Text>();
  private buildingLabelCache = new Map<string, Phaser.GameObjects.Text>();
  private lastHoveredKey: string | null = null;

  constructor() {
    super({ key: 'HexMapScene' });
  }

  create(): void {
    this.graphics = this.add.graphics();

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

    // Subscribe to store changes
    useGameStore.subscribe(() => this.renderCurrentMap());
    this.renderCurrentMap();
  }

  private emitHover(screenX: number, screenY: number): void {
    const worldX = screenX - this.cameraOffset.x;
    const worldY = screenY - this.cameraOffset.y;
    const coord = pixelToHex(worldX, worldY, HEX_SIZE);

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
    renderLabels(this, map, this.cameraOffset.x, this.cameraOffset.y, this.labelCache, this.buildingLabelCache);
  }

  update(): void {
    this.renderCurrentMap();
  }

  private handleTileClick(screenX: number, screenY: number): void {
    const worldX = screenX - this.cameraOffset.x;
    const worldY = screenY - this.cameraOffset.y;
    const coord = pixelToHex(worldX, worldY, HEX_SIZE);

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
