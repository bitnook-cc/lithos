import { describe, it, expect } from 'vitest';
import { canResearch, researchTech } from '@/logic/techEngine';
import { TechNode, Resources } from '@/types/game';
import { stoneAgeTechs } from '@/data/techs/stoneAge';

describe('techEngine', () => {
  let techs: TechNode[];

  beforeEach(() => {
    techs = stoneAgeTechs();
  });

  describe('canResearch', () => {
    it('allows researching a tech with no prerequisites', () => {
      expect(canResearch('fire_making', techs, { knowledge: 3 } as Resources)).toBe(true);
    });

    it('blocks tech with unmet prerequisites', () => {
      expect(canResearch('tool_crafting', techs, { knowledge: 10 } as Resources)).toBe(false);
    });

    it('blocks tech with insufficient knowledge', () => {
      expect(canResearch('fire_making', techs, { knowledge: 1 } as Resources)).toBe(false);
    });

    it('allows tech when prerequisites are researched', () => {
      techs.find(t => t.id === 'fire_making')!.researched = true;
      expect(canResearch('tool_crafting', techs, { knowledge: 5 } as Resources)).toBe(true);
    });

    it('blocks already-researched tech', () => {
      techs.find(t => t.id === 'fire_making')!.researched = true;
      expect(canResearch('fire_making', techs, { knowledge: 10 } as Resources)).toBe(false);
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
