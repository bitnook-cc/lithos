import { Effect } from '@/types/effects';
import { GameState, ArmyStats, Resources } from '@/types/game';
import { getCivTag, getLeaderTrait } from '@/data/tags';

/** Collect all active effects from all sources */
export function collectAllEffects(state: GameState): Effect[] {
  const effects: Effect[] = [];

  // From researched techs (ongoing effects only: resource_per_turn, army_bonus, tile_bonus, building_bonus)
  for (const tech of state.techs) {
    if (!tech.researched) continue;
    for (const effect of tech.effects) {
      if (effect.type === 'resource_per_turn' || effect.type === 'army_bonus' ||
          effect.type === 'tile_bonus' || effect.type === 'building_bonus') {
        effects.push(effect);
      }
    }
  }

  // From civ tags
  for (const tagId of state.civ.tags) {
    const tag = getCivTag(tagId);
    if (tag?.effects) effects.push(...tag.effects);
  }

  // From current leader traits
  const currentLeader = state.civ.leaders[state.civ.leaders.length - 1];
  if (currentLeader) {
    for (const traitId of currentLeader.traits) {
      const trait = getLeaderTrait(traitId);
      if (trait?.effects) effects.push(...trait.effects);
    }
  }

  return effects;
}

/** Compute total army bonuses from effects */
export function computeArmyBonuses(effects: Effect[]): Partial<ArmyStats> {
  const bonuses: Partial<ArmyStats> = {};
  for (const e of effects) {
    if (e.type === 'army_bonus') {
      bonuses[e.stat] = (bonuses[e.stat] ?? 0) + e.amount;
    }
  }
  return bonuses;
}

/** Compute per-turn resource bonuses from effects */
export function computeResourceBonuses(effects: Effect[]): Partial<Resources> {
  const bonuses: Partial<Resources> = {};
  for (const e of effects) {
    if (e.type === 'resource_per_turn') {
      bonuses[e.resource] = (bonuses[e.resource] ?? 0) + e.amount;
    }
  }
  return bonuses;
}

/** Get tile bonus for a specific tile type and resource */
export function computeTileBonuses(effects: Effect[], tileType: string): Partial<Resources> {
  const bonuses: Partial<Resources> = {};
  for (const e of effects) {
    if (e.type === 'tile_bonus' && e.tileType === tileType) {
      bonuses[e.resource] = (bonuses[e.resource] ?? 0) + e.amount;
    }
  }
  return bonuses;
}

/** Get building bonus for a specific building */
export function computeBuildingBonuses(effects: Effect[], buildingId: string): Partial<Resources> {
  const bonuses: Partial<Resources> = {};
  for (const e of effects) {
    if (e.type === 'building_bonus' && e.buildingId === buildingId) {
      bonuses[e.resource] = (bonuses[e.resource] ?? 0) + e.amount;
    }
  }
  return bonuses;
}

/** Helper: extract one-time effects from a tech's effects list */
export function extractOneShotEffects(effects: Effect[]): {
  unlockedBuildings: string[];
  addedCivTags: string[];
  addedLeaderTraits: string[];
  isAdvance: boolean;
} {
  const unlockedBuildings: string[] = [];
  const addedCivTags: string[] = [];
  const addedLeaderTraits: string[] = [];
  let isAdvance = false;

  for (const e of effects) {
    if (e.type === 'unlock_building') unlockedBuildings.push(e.buildingId);
    if (e.type === 'add_civ_tag') addedCivTags.push(e.tagId);
    if (e.type === 'add_leader_trait') addedLeaderTraits.push(e.trait);
    if (e.type === 'advance_age') isAdvance = true;
  }

  return { unlockedBuildings, addedCivTags, addedLeaderTraits, isAdvance };
}

/** Format effects into human-readable strings for UI */
export function formatEffects(effects: Effect[]): string[] {
  const lines: string[] = [];
  for (const e of effects) {
    switch (e.type) {
      case 'army_bonus': lines.push(`+${e.amount} army ${e.stat}`); break;
      case 'tile_bonus': lines.push(`+${e.amount} ${e.resource} from ${e.tileType} tiles`); break;
      case 'building_bonus': lines.push(`+${e.amount} ${e.resource} from ${e.buildingId}`); break;
      case 'resource_per_turn': {
        const label = e.resource === 'knowledge' ? 'research rate' : e.resource;
        lines.push(`+${e.amount} ${label} per turn`);
        break;
      }
      case 'unlock_building': lines.push(`Unlocks building: ${e.buildingId}`); break;
      case 'add_civ_tag': lines.push(`Grants tag: ${e.tagId}`); break;
      case 'add_leader_trait': lines.push(`Leader gains: ${e.trait}`); break;
      case 'advance_age': lines.push('Advances to next age'); break;
    }
  }
  return lines;
}
