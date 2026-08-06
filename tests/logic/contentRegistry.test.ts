import { describe, expect, it } from 'vitest';
import { AGES } from '@/data/ages';
import { getAgeContent } from '@/data/content';
import { createNewRun } from '@/logic/runEngine';
import { transitionAge } from '@/logic/ageEngine';
import { getBuildingDef } from '@/data/buildings';
import { getCivTag } from '@/data/tags';
import { FEATS, PERKS } from '@/data/legacy';

const playable = ['stone', 'bronze', 'classical'] as const;

describe('three-age content registry', () => {
  it('provides substantial unique content for every playable age', () => {
    const eventIds = new Set<string>();
    const techIds = new Set<string>();
    for (const age of playable) {
      const content = getAgeContent(age);
      const techs = content.createTechs();
      expect(content.definition.id).toBe(age);
      expect(content.events.length).toBeGreaterThanOrEqual(10);
      expect(techs.length).toBeGreaterThanOrEqual(10);
      for (const event of content.events) {
        expect(event.age).toBe(age);
        expect(eventIds.has(event.id)).toBe(false);
        eventIds.add(event.id);
      }
      for (const tech of techs) {
        expect(techIds.has(tech.id)).toBe(false);
        techIds.add(tech.id);
      }
    }
  });

  it('increases research breadth in every subsequent age', () => {
    const counts = playable.map(age => getAgeContent(age).createTechs().length);
    expect(counts).toEqual([14, 18, 22]);
    expect(counts[0]).toBeLessThan(counts[1]);
    expect(counts[1]).toBeLessThan(counts[2]);
  });

  it('keeps focused advancement routes multi-turn and within the target age length', () => {
    const routes = {
      stone: ['survival', 'fire_making', 'tool_crafting', 'mysticism', 'tribal_lore', 'advance_bronze'],
      bronze: ['writing', 'urbanism', 'trade_routes', 'bronze_working', 'law_codes', 'advance_classical'],
      classical: ['philosophy', 'citizenship', 'rhetoric', 'republic', 'theater', 'legacy_of_lithos'],
    } as const;
    // Capital production, era momentum, and required discoveries inherited from earlier ages.
    const startingRates = { stone: 2, bronze: 5, classical: 7 } as const;

    for (const age of playable) {
      const techs = getAgeContent(age).createTechs();
      let researchRate: number = startingRates[age];
      let turns = 0;
      for (const techId of routes[age]) {
        const tech = techs.find(item => item.id === techId)!;
        expect(tech, `${age}:${techId}`).toBeTruthy();
        expect(tech.cost, `${age}:${techId} should take multiple turns`).toBeGreaterThan(researchRate);
        turns += Math.ceil(tech.cost / researchRate);
        for (const effect of tech.effects) {
          if (effect.type === 'resource_per_turn' && effect.resource === 'knowledge') researchRate += effect.amount;
        }
      }
      expect(turns, `${age} focused route`).toBeGreaterThanOrEqual(15);
      expect(turns, `${age} focused route`).toBeLessThanOrEqual(20);
      expect(getAgeContent(age).definition.turnsPerAge).toBe(turns + 1);
    }
  });

  it('keeps every research graph and content reference valid', () => {
    for (const age of playable) {
      const content = getAgeContent(age);
      const techs = content.createTechs();
      const ids = new Set(techs.map(tech => tech.id));
      const resolved = new Set<string>();
      let changed = true;
      while (changed) {
        changed = false;
        for (const tech of techs) {
          expect(tech.requires.every(requirement => ids.has(requirement))).toBe(true);
          if (!resolved.has(tech.id) && tech.requires.every(requirement => resolved.has(requirement))) {
            resolved.add(tech.id);
            changed = true;
          }
          for (const effect of tech.effects) {
            if (effect.type === 'unlock_building' || effect.type === 'upgrade_building') expect(getBuildingDef(effect.buildingId)).toBeTruthy();
            if (effect.type === 'add_civ_tag') expect(getCivTag(effect.tagId)).toBeTruthy();
          }
        }
      }
      expect(resolved.size).toBe(techs.length);
      expect(techs.filter(tech => tech.effects.some(effect => effect.type === 'advance_age'))).toHaveLength(1);
      for (const event of content.events) {
        expect(event.choices.length).toBeGreaterThan(1);
        expect(event.choices.some(choice => Object.keys(choice.requires).length === 0), event.id).toBe(true);
      }
    }
    for (const feat of FEATS) expect(PERKS.some(perk => perk.id === feat.perkId)).toBe(true);
  });

  it('defines exactly three playable prototype ages', () => {
    expect(AGES.map(age => age.id)).toEqual(playable);
  });

  it('progresses Stone to Bronze to Classical and then victory', () => {
    const stone = createNewRun([], 42);
    const bronze = transitionAge(stone, 43);
    const classical = transitionAge(bronze, 44);
    const ending = transitionAge(classical, 45);
    expect(bronze.age).toBe('bronze');
    expect(bronze.techs.length).toBeGreaterThan(0);
    expect(bronze.rivals.length).toBe(2);
    expect(classical.age).toBe('classical');
    expect(classical.techs.length).toBeGreaterThan(0);
    expect(ending.gameOver?.victory).toBe(true);
  });
});
