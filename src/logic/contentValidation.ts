import { AGES } from '@/data/ages';
import { getAgeContent } from '@/data/content';
import { BUILDINGS } from '@/data/buildings';
import { CIV_TAGS, LEADER_TRAITS } from '@/data/tags';
import { FEATS, PERKS } from '@/data/legacy';
import { LANDMARK_EVENTS } from '@/data/events/landmarks';
import { LANDMARKS } from '@/data/mapFeatures';
import { GameEvent } from '@/types/events';
import { AgeId, BuildingDef, TechNode } from '@/types/game';

export interface ContentCatalog {
  ages: { id: AgeId; techs: TechNode[]; events: GameEvent[]; settlement: string }[];
  buildings: BuildingDef[];
  tags: string[];
  traits: string[];
  landmarks: typeof LANDMARKS;
  landmarkEvents: GameEvent[];
}
export function currentCatalog(): ContentCatalog {
  return { ages: AGES.map(age => { const c = getAgeContent(age.id); return { id: age.id, techs: c.createTechs(), events: c.events, settlement: c.settlementBuilding }; }), buildings: BUILDINGS, tags: CIV_TAGS.map(t => t.id), traits: LEADER_TRAITS.map(t => t.id), landmarks: LANDMARKS, landmarkEvents: LANDMARK_EVENTS };
}

/** Structural reachability, not a claim that every option can coexist in one run. */
export function validateContent(catalog = currentCatalog()): string[] {
  const errors: string[] = [];
  const check = (ok: boolean, message: string) => { if (!ok) errors.push(message); };
  const events = [...catalog.ages.flatMap(a => a.events), ...catalog.landmarkEvents];
  const eventIds = new Set(events.map(e => e.id));
  const buildings = new Map(catalog.buildings.map(b => [b.id, b]));
  const ageRank = (id: AgeId) => catalog.ages.findIndex(age => age.id === id);
  check(eventIds.size === events.length, 'Duplicate event IDs');
  check(buildings.size === catalog.buildings.length, 'Duplicate building IDs');
  check(new Set(catalog.tags).size === catalog.tags.length, 'Duplicate tag IDs');
  const allTechs = catalog.ages.flatMap(a => a.techs);
  check(new Set(allTechs.map(t => t.id)).size === allTechs.length, 'Duplicate technology IDs');
  const unlocked = new Set(catalog.ages.map(a => a.settlement));
  const inheritedTags = new Set(FEATS.map(f => f.reward?.addCivTag).filter((t): t is string => Boolean(t)));
  for (const feat of FEATS) {
    check(PERKS.some(p => p.id === feat.perkId && p.unlockedBy === feat.id), `Feat/perk mismatch: ${feat.id}`);
    if (feat.reward?.addCivTag) check(catalog.tags.includes(feat.reward.addCivTag), `Unknown feat tag: ${feat.reward.addCivTag}`);
  }
  for (const age of catalog.ages) {
    check(buildings.has(age.settlement), `Unknown settlement: ${age.id}/${age.settlement}`);
    const resolved = new Set<string>();
    const ids = new Set(age.techs.map(t => t.id));
    for (let i = 0; i < age.techs.length; i++) for (const tech of age.techs) {
      if (tech.requires.every(id => resolved.has(id))) resolved.add(tech.id);
    }
    check(resolved.size === ids.size, `Cyclic or missing research prerequisite in ${age.id}`);
    check(age.techs.filter(t => t.effects.some(e => e.type === 'advance_age')).length === 1, `Expected one advance discovery: ${age.id}`);
    for (const tech of age.techs) {
      check(Number.isFinite(tech.cost) && tech.cost > 0, `Invalid research cost: ${tech.id}`);
      for (const effect of tech.effects) {
        if (effect.type === 'unlock_building' || effect.type === 'upgrade_building') {
          check(buildings.has(effect.buildingId), `Unknown building: ${effect.buildingId}`);
          const building = buildings.get(effect.buildingId);
          if (building) check(ageRank(building.availableFrom) >= 0 && ageRank(building.availableFrom) <= ageRank(age.id), `Building unlocked before its age: ${age.id}/${building.id}`);
          unlocked.add(effect.buildingId);
        }
        if (effect.type === 'building_bonus') check(buildings.has(effect.buildingId), `Unknown bonus building: ${effect.buildingId}`);
        if (effect.type === 'add_civ_tag') { check(catalog.tags.includes(effect.tagId), `Unknown tech tag: ${effect.tagId}`); if (resolved.has(tech.id)) inheritedTags.add(effect.tagId); }
        if (effect.type === 'add_leader_trait') check(catalog.traits.includes(effect.trait), `Unknown trait: ${effect.trait}`);
      }
    }
    const ageEvents = [...age.events, ...catalog.landmarkEvents.filter(e => Object.values(catalog.landmarks).some(l => l.eventId === e.id && l.ages.includes(age.id)))];
    // Only grant an event tag once its own tag requirements can be reached.
    for (let i = 0; i < ageEvents.length; i++) for (const event of ageEvents) {
      if (!(event.triggers.civTags ?? []).every(t => inheritedTags.has(t))) continue;
      for (const choice of event.choices) if ((choice.requires.civTags ?? []).every(t => inheritedTags.has(t)) && choice.effects.addCivTag) inheritedTags.add(choice.effects.addCivTag);
    }
    for (const event of age.events) {
      check(event.age === age.id, `Wrong event age: ${event.id}`);
      for (const tag of [...(event.triggers.civTags ?? []), ...event.choices.flatMap(c => c.requires.civTags ?? [])]) check(inheritedTags.has(tag), `Unreachable tag by ${age.id}: ${event.id}/${tag}`);
    }
  }
  for (const event of events) {
    for (const tag of event.triggers.civTags ?? []) check(catalog.tags.includes(tag), `Unknown trigger tag: ${tag}`);
    for (const trait of event.triggers.leaderTraits ?? []) check(catalog.traits.includes(trait), `Unknown trigger trait: ${trait}`);
    for (const id of event.triggers.activePerks ?? []) check(PERKS.some(p => p.id === id), `Unknown trigger perk: ${id}`);
    check(event.weight === undefined || (Number.isFinite(event.weight) && event.weight > 0), `Invalid event weight: ${event.id}`);
    check(event.triggers.age === undefined || event.triggers.age === event.age, `Wrong trigger age: ${event.id}`);
    check(event.choices.length >= 2 && new Set(event.choices.map(c => c.id)).size === event.choices.length, `Invalid choices: ${event.id}`);
    check(event.choices.some(c => Object.keys(c.requires).length === 0 && !Object.values(c.cost ?? {}).some(n => n > 0)), `No unconditional unpaid fallback: ${event.id}`);
    check(event.triggers.minTurn === undefined || event.triggers.maxTurn === undefined || event.triggers.minTurn <= event.triggers.maxTurn, `Invalid event window: ${event.id}`);
    for (const id of Object.values(event.chain?.nextEvents ?? {})) check(eventIds.has(id), `Unknown chain target: ${id}`);
    for (const choice of event.choices) {
      for (const amount of Object.values(choice.cost ?? {})) check(Number.isFinite(amount) && amount >= 0, `Invalid payment: ${event.id}/${choice.id}`);
      for (const tag of [...(choice.requires.civTags ?? []), ...(choice.effects.addCivTag ? [choice.effects.addCivTag] : [])]) check(catalog.tags.includes(tag), `Unknown event tag: ${tag}`);
      for (const trait of [...(choice.requires.leaderTraits ?? []), ...(choice.effects.addLeaderTrait ? [choice.effects.addLeaderTrait] : [])]) check(catalog.traits.includes(trait), `Unknown event trait: ${trait}`);
      for (const id of choice.requires.activePerks ?? []) check(PERKS.some(p => p.id === id), `Unknown perk: ${id}`);
      for (const fx of [choice.effects, ...(choice.effects.outcomes ?? [])]) if (fx.grantFeat) check(FEATS.some(f => f.id === fx.grantFeat), `Unknown feat: ${fx.grantFeat}`);
      for (const outcome of choice.effects.outcomes ?? []) check(Number.isFinite(outcome.weight) && outcome.weight > 0, `Invalid outcome weight: ${event.id}`);
    }
  }
  for (const building of catalog.buildings) {
    check(unlocked.has(building.id), `No building unlock: ${building.id}`);
    let ancestor: BuildingDef | undefined = building;
    const seen = new Set<string>();
    let terrains = building.requiredTile;
    while (ancestor?.upgradesFrom) {
      if (seen.has(ancestor.id)) { errors.push(`Building upgrade cycle: ${building.id}`); break; }
      seen.add(ancestor.id);
      ancestor = buildings.get(ancestor.upgradesFrom);
      check(Boolean(ancestor), `Missing upgrade base: ${building.id}`);
      if (ancestor) check(ageRank(ancestor.availableFrom) >= 0 && ageRank(ancestor.availableFrom) <= ageRank(building.availableFrom), `Upgrade base unavailable by age: ${building.id}`);
      if (ancestor?.requiredTile) terrains = terrains ? terrains.filter(t => ancestor!.requiredTile!.includes(t)) : ancestor.requiredTile;
    }
    check(!terrains || terrains.length > 0, `No compatible upgrade terrain: ${building.id}`);
  }
  for (const landmark of Object.values(catalog.landmarks)) check(catalog.landmarkEvents.some(e => e.id === landmark.eventId), `Unknown landmark event: ${landmark.id}`);
  return errors;
}
