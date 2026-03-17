import { describe, it, expect } from 'vitest';
import { hexNeighbors, hexDistance, hexToPixel, pixelToHex, createHex } from '@/game/hex/hexUtils';

describe('hexUtils', () => {
  describe('createHex', () => {
    it('creates a hex with q + r + s = 0', () => {
      const h = createHex(1, -1);
      expect(h).toEqual({ q: 1, r: -1, s: 0 });
    });
  });
  describe('hexNeighbors', () => {
    it('returns 6 neighbors for origin', () => {
      const neighbors = hexNeighbors({ q: 0, r: 0, s: 0 });
      expect(neighbors).toHaveLength(6);
    });
    it('returns correct neighbor coords', () => {
      const neighbors = hexNeighbors({ q: 0, r: 0, s: 0 });
      expect(neighbors).toContainEqual({ q: 1, r: -1, s: 0 });
      expect(neighbors).toContainEqual({ q: -1, r: 1, s: 0 });
    });
  });
  describe('hexDistance', () => {
    it('returns 0 for same hex', () => { expect(hexDistance({ q: 0, r: 0, s: 0 }, { q: 0, r: 0, s: 0 })).toBe(0); });
    it('returns 1 for adjacent hexes', () => { expect(hexDistance({ q: 0, r: 0, s: 0 }, { q: 1, r: -1, s: 0 })).toBe(1); });
    it('returns correct distance for far hexes', () => { expect(hexDistance({ q: 0, r: 0, s: 0 }, { q: 3, r: -3, s: 0 })).toBe(3); });
  });
  describe('hexToPixel', () => {
    it('maps origin to 0,0', () => { const { x, y } = hexToPixel({ q: 0, r: 0, s: 0 }, 32); expect(x).toBe(0); expect(y).toBe(0); });
    it('returns different coords for different hexes', () => {
      const a = hexToPixel({ q: 1, r: 0, s: -1 }, 32);
      const b = hexToPixel({ q: 0, r: 1, s: -1 }, 32);
      expect(a.x).not.toBe(b.x);
    });
  });
  describe('pixelToHex', () => {
    it('round-trips through hexToPixel', () => {
      const original = { q: 2, r: -1, s: -1 };
      const { x, y } = hexToPixel(original, 32);
      const result = pixelToHex(x, y, 32);
      expect(result).toEqual(original);
    });
  });
});
