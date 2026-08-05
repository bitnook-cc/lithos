import { FeatDef, GameState, PerkDef } from '@/types/game';

export const FEATS: FeatDef[] = [
  { id: 'keeper_of_flame', name: 'Keeper of the Flame', description: 'Defy the dark with fire and nerve.', flavor: 'Every hearth remembers the first hand that carried flame.', perkId: 'ember_memory', reward: { resources: { food: 3 }, addCivTag: 'Flame Proven' } },
  { id: 'beast_slayer', name: 'Beast Slayer', description: 'Bring down a creature that once hunted your people.', flavor: 'Children wear its teeth for courage.', perkId: 'hunter_blood', reward: { army: { strength: 2, morale: 1 } } },
  { id: 'open_hand', name: 'The Open Hand', description: 'Turn a dangerous encounter into lasting exchange.', flavor: 'A road begins wherever strangers choose not to draw blades.', perkId: 'caravan_memory', reward: { resources: { wealth: 4 }, addCivTag: 'Trusted Traders' } },
  { id: 'city_of_many', name: 'City of Many', description: 'Build a city where newcomers can become citizens.', flavor: 'Its gates face every road.', perkId: 'founder_instinct', reward: { resources: { materials: 5, population: 1 } } },
  { id: 'voice_of_citizens', name: 'Voice of Citizens', description: 'Share power when taking it would be easier.', flavor: 'The assembly outlives the speaker.', perkId: 'citizen_oath', reward: { resources: { influence: 5 }, addCivTag: 'Oathbound' } },
  { id: 'hawk_tamer', name: 'Hawk Tamer', description: 'Befriend the raptors nesting beyond the known paths.', flavor: 'Your scouts learned to borrow the eyes of the sky.', perkId: 'eyes_of_the_hawk', reward: { resources: { knowledge: 2 }, addCivTag: 'Sky Scouts' } },
  { id: 'three_ages', name: 'A Civilization Remembered', description: 'Carry one people from the first hearth to a classical legacy.', flavor: 'Stone, bronze, and iron bear the same name.', perkId: 'ancestral_continuity', reward: { army: { morale: 3 }, resources: { influence: 5 } } },
];

export const PERKS: PerkDef[] = [
  { id: 'ember_memory', name: 'Ember Memory', description: 'Begin with 4 extra Food and gain +1 Food each turn.', flavor: 'You always know how to keep a spark alive.', unlockedBy: 'keeper_of_flame', startingResources: { food: 4 }, effects: [{ type: 'resource_per_turn', resource: 'food', amount: 1 }] },
  { id: 'hunter_blood', name: 'Hunter Blood', description: 'Begin each run with +2 Strength and +1 Stealth.', flavor: 'The old predator is never far beneath the skin.', unlockedBy: 'beast_slayer', startingArmy: { strength: 2, stealth: 1 } },
  { id: 'caravan_memory', name: 'Caravan Memory', description: 'Begin with 3 Wealth and gain +1 Wealth each turn.', flavor: 'Your people remember the value of an open road.', unlockedBy: 'open_hand', startingResources: { wealth: 3 }, effects: [{ type: 'resource_per_turn', resource: 'wealth', amount: 1 }] },
  { id: 'founder_instinct', name: 'Founder Instinct', description: 'Begin with 5 Materials and one additional Population.', flavor: 'Even a temporary camp is laid out like a future capital.', unlockedBy: 'city_of_many', startingResources: { materials: 5, population: 1 } },
  { id: 'citizen_oath', name: 'Citizen Oath', description: 'Gain +1 Influence each turn and a fourth action point.', flavor: 'Authority is borrowed from those who must live with it.', unlockedBy: 'voice_of_citizens', effects: [{ type: 'resource_per_turn', resource: 'influence', amount: 1 }, { type: 'action_point_bonus', amount: 1 }] },
  { id: 'eyes_of_the_hawk', name: 'Eyes of the Hawk', description: 'Survey one additional ring of territory with every expedition.', flavor: 'A circling shadow maps the country ahead.', unlockedBy: 'hawk_tamer', effects: [{ type: 'exploration_bonus', amount: 1 }] },
  { id: 'ancestral_continuity', name: 'Ancestral Continuity', description: 'Begin with +2 Morale and +1 Knowledge each turn.', flavor: 'Each generation begins where the last one ended.', unlockedBy: 'three_ages', startingArmy: { morale: 2 }, effects: [{ type: 'resource_per_turn', resource: 'knowledge', amount: 1 }] },
];

export const MAX_ACTIVE_PERKS = 2;

export function getFeat(id: string): FeatDef | undefined { return FEATS.find(feat => feat.id === id); }
export function getPerk(id: string): PerkDef | undefined { return PERKS.find(perk => perk.id === id); }

export function evaluateFeatUnlocks(state: GameState): string[] {
  const candidates: string[] = [];
  if (state.flags.drove_off_wolves || state.flags.mastered_fire_trial) candidates.push('keeper_of_flame');
  if (state.civ.tags.includes('Beast Slayers') || state.flags.slew_guardian) candidates.push('beast_slayer');
  if (state.flags.shared_hunting_grounds || state.flags.bronze_trade_compact) candidates.push('open_hand');
  if (state.flags.welcomed_migrants) candidates.push('city_of_many');
  if (state.flags.founded_assembly) candidates.push('voice_of_citizens');
  if (state.gameOver?.victory) candidates.push('three_ages');
  return candidates.filter(id => !state.featsEarned.includes(id));
}
