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
    it('allows queueing a root tech with no prerequisites', () => {
      expect(canQueue('survival', techs)).toBe(true);
      expect(canQueue('warfare', techs)).toBe(true);
      expect(canQueue('mysticism', techs)).toBe(true);
    });

    it('blocks tech with unmet prerequisites', () => {
      expect(canQueue('tool_crafting', techs)).toBe(false);
    });

    it('allows tech when prerequisites are researched', () => {
      techs.find(t => t.id === 'survival')!.researched = true;
      techs.find(t => t.id === 'fire_making')!.researched = true;
      expect(canQueue('tool_crafting', techs)).toBe(true);
    });

    it('blocks already-researched tech', () => {
      techs.find(t => t.id === 'survival')!.researched = true;
      expect(canQueue('survival', techs)).toBe(false);
    });

    it('handles cross-branch prerequisites', () => {
      // fortification requires warfare + shelter_building
      expect(canQueue('fortification', techs)).toBe(false);
      techs.find(t => t.id === 'warfare')!.researched = true;
      expect(canQueue('fortification', techs)).toBe(false);
      techs.find(t => t.id === 'survival')!.researched = true;
      techs.find(t => t.id === 'shelter_building')!.researched = true;
      expect(canQueue('fortification', techs)).toBe(true);
    });
  });

  describe('getTechCost', () => {
    it('returns the cost of a tech', () => {
      expect(getTechCost('survival', techs)).toBe(2);
      expect(getTechCost('fire_making', techs)).toBe(3);
    });

    it('returns 0 for unknown tech', () => {
      expect(getTechCost('nonexistent', techs)).toBe(0);
    });
  });

  describe('researchTech', () => {
    it('marks the tech as researched', () => {
      const result = researchTech('survival', techs);
      expect(result.techs.find(t => t.id === 'survival')!.researched).toBe(true);
    });

    it('returns the tech effects', () => {
      const result = researchTech('survival', techs);
      expect(result.effects.unlocksBuilding).toBe('gathering_site');
      expect(result.effects.addsCivTag).toBe('Foragers');
    });

    it('detects advance tech', () => {
      techs.find(t => t.id === 'survival')!.researched = true;
      techs.find(t => t.id === 'fire_making')!.researched = true;
      techs.find(t => t.id === 'tool_crafting')!.researched = true;
      techs.find(t => t.id === 'mysticism')!.researched = true;
      techs.find(t => t.id === 'tribal_lore')!.researched = true;
      const result = researchTech('advance_bronze', techs);
      expect(result.effects.isAdvance).toBe(true);
    });
  });
});
