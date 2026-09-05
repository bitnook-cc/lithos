import Phaser from 'phaser';
import { renderMap, renderLabels, renderMapTransitions, HEX_SIZE } from '../hex/hexRenderer';
import { pixelToHex, hexToPixel } from '../hex/hexUtils';
import { useGameStore } from '@/store/gameStore';
import { HexCoord } from '@/types/map';
import { frontierWarnings, districtKey } from '@/logic/mapSignals';
import { claimPreview, mapTransitions, MapTransition, transitionProgress } from '@/logic/mapPresentation';
import { openingObjective } from '@/logic/tutorialEngine';
import { reducedMotion } from '@/ui/motionPreference';

export class HexMapScene extends Phaser.Scene {
  private graphics!: Phaser.GameObjects.Graphics;
  private motionGraphics!: Phaser.GameObjects.Graphics;
  private motions: Array<MapTransition & { started: number }> = [];
  private cameraOffset = { x: 0, y: 0 };
  private zoomLevel = 1.5;
  private isDragging = false;
  private dragStart = { x: 0, y: 0 };
  private pointerDown = { x: 0, y: 0 };
  private selectedCoord: HexCoord | null = null;
  private iconCache = new Map<string, Phaser.GameObjects.Text>();
  private buildingLabelCache = new Map<string, Phaser.GameObjects.Text>();
  private lastHoveredKey: string | null = null;
  private needsRender = true;
  private unsubscribeStore?: () => void;

  constructor() {
    super({ key: 'HexMapScene' });
  }

  create(): void {
    this.graphics = this.add.graphics();
    this.motionGraphics = this.add.graphics().setDepth(11);

    this.cameras.main.setBackgroundColor('#10191b');
    this.zoomLevel = this.scale.width < 700 ? 1.12 : 1.5;

    // Center camera offset
    this.cameraOffset = {
      x: this.scale.width / 2,
      y: this.scale.height / 2 + 22,
    };

    // Pan with drag
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.tweens.killTweensOf(this.cameraOffset);
      this.isDragging = true;
      this.pointerDown = { x: pointer.x, y: pointer.y };
      this.dragStart = { x: pointer.x - this.cameraOffset.x, y: pointer.y - this.cameraOffset.y };
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging) {
        this.cameraOffset.x = pointer.x - this.dragStart.x;
        this.cameraOffset.y = pointer.y - this.dragStart.y;
        this.needsRender = true;
      }

      // Emit hover event for React tooltip
      this.emitHover(pointer.x, pointer.y);
    });

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (!this.isDragging) return;
      this.isDragging = false;

      // If minimal drag, treat as click
      const dx = Math.abs(pointer.x - this.pointerDown.x);
      const dy = Math.abs(pointer.y - this.pointerDown.y);
      if (dx < 5 && dy < 5) {
        this.handleTileClick(pointer.x, pointer.y);
      }
    });

    // Zoom with scroll wheel
    // Phaser wheel callback: (pointer, gameObjects, deltaX, deltaY, deltaZ)
    this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _gameObjects: any[], _deltaX: number, deltaY: number) => {
      const zoomDelta = deltaY > 0 ? -0.15 : 0.15;
      this.zoomLevel = Math.max(0.68, Math.min(2.7, this.zoomLevel + zoomDelta));
      this.cameras.main.setZoom(this.zoomLevel);
      this.needsRender = true;
    });

    // Set default zoom and provide a quick way home after a long pan.
    this.cameras.main.setZoom(this.zoomLevel);
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown()) {
        this.cameraOffset = { x: this.scale.width / 2, y: this.scale.height / 2 + 22 };
        this.needsRender = true;
      }
    });

    const control = (event: Event) => {
      const { action, coord } = (event as CustomEvent<{ action: string; coord?: HexCoord }>).detail;
      if (action === 'in' || action === 'out') {
        this.zoomLevel = Math.max(.68, Math.min(2.7, this.zoomLevel + (action === 'in' ? .2 : -.2)));
        this.cameras.main.setZoom(this.zoomLevel);
      } else if (action === 'focus' || action === 'center') {
        const point = coord ? hexToPixel(coord, HEX_SIZE) : { x: 0, y: 0 };
        let targetX = this.scale.width / 2;
        let targetY = this.scale.height / 2;
        if (coord && this.scale.width <= 620) {
          const controlsBottom = document.querySelector('.map-controls')?.getBoundingClientRect().bottom ?? 210;
          const panelTop = document.querySelector('.council-panel')?.getBoundingClientRect().top ?? this.scale.height - 180;
          targetX = this.scale.width * .73;
          targetY = (controlsBottom + panelTop) / 2;
        }
        const target = { x: this.scale.width / 2 - point.x + (targetX - this.scale.width / 2) / this.zoomLevel, y: this.scale.height / 2 - point.y + (targetY - this.scale.height / 2) / this.zoomLevel };
        this.tweens.killTweensOf(this.cameraOffset);
        if (action === 'focus' && !reducedMotion()) this.tweens.add({ targets: this.cameraOffset, ...target, duration: 240, ease: 'Cubic.Out', onUpdate: () => { this.needsRender = true; } });
        else Object.assign(this.cameraOffset, target);
      }
      this.needsRender = true;
    };
    const selection = (event: Event) => {
      this.selectedCoord = (event as CustomEvent<{ coord: HexCoord | null }>).detail.coord;
      this.needsRender = true;
    };
    const motionChanged = () => { if (reducedMotion()) { this.motions = []; this.motionGraphics.clear(); this.tweens.killTweensOf(this.cameraOffset); } };
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const resize = () => control(new CustomEvent('map-control', { detail: { action: 'center' } }));
    window.addEventListener('map-control', control);
    window.addEventListener('map-selection', selection);
    window.addEventListener('lithos-motion-change', motionChanged);
    media.addEventListener('change', motionChanged);
    this.scale.on('resize', resize);
    this.unsubscribeStore = useGameStore.subscribe((state, previous) => {
      if (state.age !== previous.age || state.runtime?.runId !== previous.runtime?.runId) { this.motions = []; this.motionGraphics.clear(); this.selectedCoord = null; resize(); }
      else if (!reducedMotion()) this.motions = [...this.motions, ...mapTransitions(previous, state).map(change => ({ ...change, started: this.time.now }))].slice(-80);
      this.needsRender = true;
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.unsubscribeStore?.();
      this.unsubscribeStore = undefined;
      window.removeEventListener('map-control', control);
      window.removeEventListener('map-selection', selection);
      window.removeEventListener('lithos-motion-change', motionChanged);
      media.removeEventListener('change', motionChanged);
      this.motions = [];
      this.scale.off('resize', resize);
    });
    window.dispatchEvent(new Event('map-ready'));
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
    const state = useGameStore.getState();
    const { map, tutorial } = state;
    const tile = map.find(t => this.selectedCoord && districtKey(t.coord) === districtKey(this.selectedCoord));
    const threatened = new Set(frontierWarnings(state).flatMap(warning => warning.districts.map(t => districtKey(t.coord))));
    const guide = openingObjective(state)?.action === 'district' ? tutorial?.target : null;
    renderMap(this.graphics, map, this.cameraOffset.x, this.cameraOffset.y, this.selectedCoord, threatened, tile ? claimPreview(state, tile).available : false, guide);
    renderLabels(this, map, this.cameraOffset.x, this.cameraOffset.y, this.iconCache, this.buildingLabelCache);
  }

  update(): void {
    if (this.needsRender) { this.renderCurrentMap(); this.needsRender = false; }
    if (this.motions.length) {
      const frames = this.motions.map(motion => ({ ...motion, progress: transitionProgress(motion.kind, this.time.now - motion.started, reducedMotion()) }));
      renderMapTransitions(this.motionGraphics, frames.filter(frame => frame.progress < 1), this.cameraOffset.x, this.cameraOffset.y);
      this.motions = this.motions.filter((_, index) => frames[index].progress < 1);
    }
  }

  private handleTileClick(screenX: number, screenY: number): void {
    const world = this.screenToWorld(screenX, screenY);
    const coord = pixelToHex(world.x, world.y, HEX_SIZE);

    const state = useGameStore.getState();
    const tile = state.map.find(t =>
      t.coord.q === coord.q && t.coord.r === coord.r && t.coord.s === coord.s
    );

    if (tile?.visible) {
      this.selectedCoord = tile.coord;
      this.needsRender = true;
      // Emit tile selection for React UI to handle
      window.dispatchEvent(new CustomEvent('tile-selected', { detail: { tile, coord } }));
    }
  }
}
