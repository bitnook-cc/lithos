import { z } from 'zod';

const HexCoordSchema = z.object({
  q: z.number(),
  r: z.number(),
  s: z.number(),
});

const TileSchema = z.object({
  coord: HexCoordSchema,
  type: z.enum(['plains', 'forest', 'mountain', 'water', 'desert', 'ruins', 'fertile', 'special']),
  visible: z.boolean(),
  controlled: z.boolean(),
  building: z.string().nullable(),
  rivalId: z.string().nullable(),
});

const ResourcesSchema = z.object({
  food: z.number(),
  materials: z.number(),
  wealth: z.number(),
  knowledge: z.number(),
  influence: z.number(),
  population: z.number(),
});

const ArmyStatsSchema = z.object({
  strength: z.number(),
  toughness: z.number(),
  speed: z.number(),
  stealth: z.number(),
  morale: z.number(),
  numbers: z.number(),
});

const LeaderSchema = z.object({
  name: z.string(),
  traits: z.array(z.string()),
});

const CivStateSchema = z.object({
  identity: z.object({
    military: z.number(),
    economy: z.number(),
    knowledge: z.number(),
  }),
  tags: z.array(z.string()),
  leaders: z.array(LeaderSchema),
});

const RivalCivSchema = z.object({
  id: z.string(),
  name: z.string(),
  personality: z.enum(['aggressive', 'defensive', 'trader']),
  threat: ArmyStatsSchema,
  disposition: z.number(),
  homeTile: HexCoordSchema,
  controlledTiles: z.array(HexCoordSchema),
});

const TechEffectsSchema = z.object({
  resourceBonuses: z.record(z.string(), z.number()).optional(),
  armyBonuses: z.record(z.string(), z.number()).optional(),
  unlocksBuilding: z.string().optional(),
  addsCivTag: z.string().optional(),
  addsLeaderTrait: z.string().optional(),
  isAdvance: z.boolean().optional(),
});

const TechNodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  cost: z.number(),
  researched: z.boolean(),
  requires: z.array(z.string()),
  effects: TechEffectsSchema,
});

export const GameStateSchema = z.object({
  age: z.enum(['stone', 'bronze', 'classical', 'medieval', 'renaissance', 'industrial', 'modern', 'space']),
  turn: z.number(),
  actionPoints: z.number(),
  maxActionPoints: z.number(),
  resources: ResourcesSchema,
  army: ArmyStatsSchema,
  civ: CivStateSchema,
  map: z.array(TileSchema),
  rivals: z.array(RivalCivSchema),
  techs: z.array(TechNodeSchema),
  flags: z.record(z.string(), z.boolean()),
  phase: z.enum(['collect', 'actions', 'event', 'enemy', 'gameOver', 'ageTransition']),
  currentEvent: z.string().nullable(),
  gameOver: z.object({ reason: z.string(), victory: z.boolean() }).nullable(),
  activeResearch: z.string().nullable(),
  researchProgress: z.number(),
  firedEvents: z.array(z.string()),
});

export type ValidatedGameState = z.infer<typeof GameStateSchema>;
