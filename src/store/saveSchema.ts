import { z } from 'zod';

const age = z.enum(['stone', 'bronze', 'classical', 'medieval', 'renaissance', 'industrial', 'modern', 'space']);
const resourceKey = z.enum(['food', 'materials', 'wealth', 'knowledge', 'influence', 'population']);
const armyKey = z.enum(['strength', 'toughness', 'speed', 'stealth', 'morale', 'numbers']);
const tileType = z.enum(['plains', 'forest', 'mountain', 'water', 'desert', 'ruins', 'fertile', 'special', 'rainforest', 'swamp', 'hills', 'snow', 'ice']);
const mapFeature = z.enum(['ancient_cave', 'old_growth_grove', 'oasis', 'geothermal_spring', 'coral_reef', 'game_trail', 'marsh_reeds', 'volcanic_vent', 'wild_garden', 'old_road']);
const resourceNode = z.enum(['wild_game', 'grain', 'fish', 'timber', 'stone', 'clay', 'copper', 'horses', 'salt', 'dyes']);
const landmark = z.enum(['painted_vault', 'jungle_temple', 'world_tree', 'obsidian_spire', 'sunken_city', 'oracle_spring', 'titan_bones', 'sky_stones', 'lost_library', 'first_battlefield']);
const nonnegative = z.number().nonnegative();
const hex = z.object({ q: z.number().int(), r: z.number().int(), s: z.number().int() }).refine(h => h.q + h.r + h.s === 0, 'Invalid hex coordinate');
const resources = z.object({ food: nonnegative, materials: nonnegative, wealth: nonnegative, knowledge: nonnegative, influence: nonnegative, population: nonnegative.int() });
const army = z.object({ strength: nonnegative, toughness: nonnegative, speed: nonnegative, stealth: nonnegative, morale: nonnegative, numbers: nonnegative });
const effect = z.discriminatedUnion('type', [
  z.object({ type: z.literal('army_bonus'), stat: armyKey, amount: z.number() }),
  z.object({ type: z.literal('tile_bonus'), tileType, resource: resourceKey, amount: z.number() }),
  z.object({ type: z.literal('building_bonus'), buildingId: z.string(), resource: resourceKey, amount: z.number() }),
  z.object({ type: z.literal('resource_per_turn'), resource: resourceKey, amount: z.number() }),
  z.object({ type: z.literal('unlock_building'), buildingId: z.string() }),
  z.object({ type: z.literal('upgrade_building'), buildingId: z.string() }),
  z.object({ type: z.literal('add_civ_tag'), tagId: z.string() }),
  z.object({ type: z.literal('add_leader_trait'), trait: z.string() }),
  z.object({ type: z.literal('action_point_bonus'), amount: z.number() }),
  z.object({ type: z.literal('exploration_bonus'), amount: z.number() }),
  z.object({ type: z.literal('advance_age') }),
]);
const tech = z.object({ id: z.string(), name: z.string(), description: z.string(), cost: z.number(), researched: z.boolean(), requires: z.array(z.string()), effects: z.array(effect) });

export const GameStateSchema = z.object({
  development: z.object({ discoveredTechs: z.array(z.string()), unlockedBuildings: z.array(z.string()), projects: z.record(z.string(), z.object({ progress: nonnegative, ticks: nonnegative.int() })),
    inheritance: z.object({ from: age, districts: nonnegative.int(), buildings: nonnegative.int(), discoveries: nonnegative.int(), foodPerTurn: z.number(), text: z.string() }).optional(),
  }).optional(),
  tutorial: z.object({ enabled: z.boolean(), foodInspected: z.boolean(), target: hex.nullable() }).optional(),
  runtime: z.object({
    runId: z.string().min(1), randomState: z.number().int().min(0).max(0xffffffff), commandSequence: nonnegative.int(), noticeSequence: nonnegative.int(),
    notices: z.array(z.discriminatedUnion('type', [
      z.object({ id: z.string(), type: z.literal('result'), title: z.string(), text: z.string().optional(), effects: z.array(z.string()) }),
      z.object({ id: z.string(), type: z.literal('tech'), techId: z.string() }),
      z.object({ id: z.string(), type: z.literal('age'), age }),
      z.object({ id: z.string(), type: z.literal('feat'), featId: z.string() }),
    ])),
  }).optional(),
  age, turn: z.number().int().positive(), actionPoints: nonnegative.int(), maxActionPoints: z.number().int().positive(), exploration: z.number().default(1), resources, army,
  civ: z.object({ identity: z.object({ military: z.number(), economy: z.number(), knowledge: z.number() }), tags: z.array(z.string()), leaders: z.array(z.object({ name: z.string(), traits: z.array(z.string()) })) }),
  map: z.array(z.object({
    coord: hex, type: tileType, workPriority: nonnegative.int().optional(), elevation: z.number().default(0.5), moisture: z.number().default(0.5),
    visible: z.boolean(), surveyed: z.boolean().optional(), controlled: z.boolean(), worked: z.boolean().optional(), building: z.string().nullable(), settlementName: z.string().nullable().default(null), rivalId: z.string().nullable(),
    feature: mapFeature.nullable().default(null), resource: resourceNode.nullable().default(null), landmark: landmark.nullable().default(null),
    landmarkInvestigated: z.boolean().default(false), river: z.boolean().default(false), riverEdges: z.array(z.number().int().min(0).max(5)).default([]), road: z.boolean().default(false),
  })),
  rivals: z.array(z.object({ id: z.string(), name: z.string(), personality: z.enum(['aggressive', 'defensive', 'trader']), threat: army, disposition: z.number(), homeTile: hex, controlledTiles: z.array(hex) })),
  techs: z.array(tech), permanentEffects: z.array(effect), flags: z.record(z.string(), z.boolean()),
  phase: z.enum(['setup', 'collect', 'actions', 'event', 'eventResult', 'enemy', 'enemyResult', 'gameOver', 'ageTransition']), currentEvent: z.string().nullable(), eventOrigin: z.enum(['turn', 'discovery']).nullable().default(null),
  gameOver: z.object({ reason: z.string(), victory: z.boolean() }).nullable(), activeResearch: z.string().nullable(), researchProgress: z.number(), growthProgress: z.number(),
  firedEvents: z.array(z.string()), activePerks: z.array(z.string()), featsEarned: z.array(z.string()),
  chronicle: z.array(z.object({ id: z.string(), age, turn: z.number(), title: z.string(), text: z.string(), tone: z.enum(['neutral', 'triumph', 'loss', 'discovery']) })),
  stats: z.object({ choicesMade: z.number(), tilesExplored: z.number(), tilesExpanded: z.number().default(0), buildingsBuilt: z.number(), rivalsDefeated: z.number(), agesCompleted: z.number(), landmarksDiscovered: z.number().default(0) }),
  runRecorded: z.boolean(),
});
