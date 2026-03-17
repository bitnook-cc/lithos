import { describe, it, expect } from 'vitest';
import { canQueue, researchTech, getTechCost } from '@/logic/techEngine';
import { TechNode } from '@/types/game';
import { stoneAgeTechs } from '@/data/techs/stoneAge';

describe('techEngine', () => {
  let techs: TechNode[];

  beforeEach(() => {
    techs = stoneAgeTechs();
  });

  describe('canQueue', () => {
    it('allows queueing a tech with no prerequisites', () => {
      expect(canQueue('fire_making', techs)).toBe(true);
    });

    it('blocks tech with unmet prerequisites', () => {
      expect(canQueue('tool_crafting', techs)).toBe(false);
    });

    it('allows tech when prerequisites are researched', () => {
      techs.find(t => t.id === 'fire_making')!.researched = true;
      expect(canQueue('tool_crafting', techs)).toBe(true);
    });

    it('blocks already-researched tech', () => {
      techs.find(t => t.id === 'fire_making')!.researched = true;
      expect(canQueue('fire_making', techs)).toBe(false);
    });
  });

  describe('getTechCost', () => {
    it('returns the cost of a tech', () => {
      expect(getTechCost('fire_making', techs)).toBe(3);
    });

    it('returns 0 for unknown tech', () => {
      expect(getTechCost('nonexistent', techs)).toBe(0);
    });
  });

  describe('researchTech', () => {
    it('marks the tech as researched', () => {
      const result = researchTech('fire_making', techs);
      expect(result.techs.find(t => t.id === 'fire_making')!.researched).toBe(true);
    });

    it('returns the tech effects', () => {
      const result = researchTech('fire_making', techs);
      expect(result.effects.resourceBonuses).toEqual({ food: 1 });
    });

    it('detects advance tech', () => {
      // Research prerequisites first
      techs.find(t => t.id === 'fire_making')!.researched = true;
      techs.find(t => t.id === 'tool_crafting')!.researched = true;
      techs.find(t => t.id === 'shelter_building')!.researched = true;
      techs.find(t => t.id === 'tribal_lore')!.researched = true;
      const result = researchTech('advance_bronze', techs);
      expect(result.effects.isAdvance).toBe(true);
    });
  });
});
