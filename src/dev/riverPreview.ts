/// <reference types="vite/client" />
// Development-only visual fixture. No game store, localStorage or save imports.
import Phaser from 'phaser';
import { createNewRun } from '@/logic/runEngine';
import { transitionAge } from '@/logic/ageEngine';
import { renderMap, HEX_SIZE } from '@/game/hex/hexRenderer';
import { hexToPixel } from '@/game/hex/hexUtils';
import { riverPaths } from '@/game/hex/riverGeometry';

if (import.meta.env.DEV) {
  class RiverPreview extends Phaser.Scene {
    private ink!: Phaser.GameObjects.Graphics;
    private labels: Phaser.GameObjects.Text[] = [];
    create() {
      this.ink = this.add.graphics();
      this.scale.on('resize', () => this.redraw());
      const parent = document.querySelector('#map') as HTMLElement;
      const observer = new ResizeObserver(() => this.scale.resize(parent.clientWidth, parent.clientHeight));
      observer.observe(parent);
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => observer.disconnect());
      document.querySelector('#regenerate')!.addEventListener('click', () => this.redraw());
      document.querySelector('#reveal')!.addEventListener('change', () => this.redraw());
      document.querySelector('#age')!.addEventListener('change', () => this.redraw());
      this.redraw();
    }
    redraw() {
      const seed = Number((document.querySelector('#seed') as HTMLInputElement).value) >>> 0;
      const age = (document.querySelector('#age') as HTMLSelectElement).value;
      const reveal = (document.querySelector('#reveal') as HTMLInputElement).checked;
      let run = createNewRun([], seed);
      if (age !== 'stone') run = transitionAge(run, seed + 100);
      if (age === 'classical') run = transitionAge(run, seed + 200);
      const paths = riverPaths(run.map);
      if (reveal) run.map.forEach(tile => { tile.visible = true; });
      const positions = run.map.map(tile => hexToPixel(tile.coord, HEX_SIZE));
      const width = Math.max(...positions.map(p => p.x)) - Math.min(...positions.map(p => p.x)) + HEX_SIZE * 2.5;
      const height = Math.max(...positions.map(p => p.y)) - Math.min(...positions.map(p => p.y)) + HEX_SIZE * 2.5;
      const zoom = Math.min(this.scale.width / width, this.scale.height / height, 2.5);
      this.cameras.main.setZoom(zoom);
      const x = this.scale.width / 2, y = this.scale.height / 2;
      renderMap(this.ink, run.map, x, y);
      this.labels.forEach(label => label.destroy()); this.labels = [];
      paths.forEach((path, i) => {
        [path[0], path[path.length - 1]].forEach((tile, end) => {
          if (!tile.visible) return;
          const p = hexToPixel(tile.coord, HEX_SIZE);
          this.labels.push(this.add.text(p.x + x, p.y + y + 22, `${i + 1} ${end ? tile.waterBody : 'source'}`,
            { fontFamily: 'sans-serif', fontSize: '9px', color: '#f0e9d7', backgroundColor: '#142124', padding: { x: 3, y: 2 } }).setOrigin(0.5));
        });
      });
      document.querySelector('#summary')!.textContent = `${run.map.length} districts · ${paths.length} rivers · ${paths.map((path, i) => `River ${i + 1}: ${path[0].type} → ${path[path.length - 1].waterBody}, ${path.length} districts`).join(' · ')}`;
    }
  }
  new Phaser.Game({ type: Phaser.AUTO, parent: 'map', backgroundColor: '#10191b',
    scale: { mode: Phaser.Scale.RESIZE, width: '100%', height: '100%' }, scene: RiverPreview });
}
