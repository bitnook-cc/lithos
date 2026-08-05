import { AgeId, Resources } from '@/types/game';
import { LandmarkId, MapFeatureId, ResourceNodeId, TileType } from '@/types/map';

interface MapDecoration {
  name: string;
  description: string;
  terrains: TileType[];
  yields: Partial<Resources>;
  glyph: string;
  color: number;
}

export type FeatureDef = MapDecoration & { id: MapFeatureId };
export type ResourceNodeDef = MapDecoration & { id: ResourceNodeId };
export type LandmarkDef = MapDecoration & { id: LandmarkId; eventId: string; ages: AgeId[] };

export const MAP_FEATURES: Record<MapFeatureId, FeatureDef> = {
  ancient_cave: { id: 'ancient_cave', name: 'Echoing Cave', description: 'A dark limestone hollow marked by smoke and old scratches.', terrains: ['hills', 'mountain'], yields: { knowledge: 1 }, glyph: '⌂', color: 0xd7c2a0 },
  old_growth_grove: { id: 'old_growth_grove', name: 'Old-growth Grove', description: 'Trees older than any living storyteller shelter rich soil.', terrains: ['forest', 'rainforest'], yields: { food: 1 }, glyph: '♣', color: 0x9bc26c },
  oasis: { id: 'oasis', name: 'Oasis', description: 'Palms and clear water gather in a fold of the dunes.', terrains: ['desert'], yields: { food: 2 }, glyph: '◉', color: 0x52b9a8 },
  geothermal_spring: { id: 'geothermal_spring', name: 'Warm Springs', description: 'Mineral water steams through the cold earth.', terrains: ['hills', 'snow'], yields: { food: 1, knowledge: 1 }, glyph: '≈', color: 0x76d4cf },
  coral_reef: { id: 'coral_reef', name: 'Coral Reef', description: 'A bright living shelf draws fish close to shore.', terrains: ['water'], yields: { food: 2 }, glyph: '⌇', color: 0xef8877 },
  game_trail: { id: 'game_trail', name: 'Game Trail', description: 'Tracks converge where herds have crossed for generations.', terrains: ['plains', 'forest', 'hills'], yields: { food: 1 }, glyph: '⋔', color: 0xc89f6a },
  marsh_reeds: { id: 'marsh_reeds', name: 'Reed Beds', description: 'Dense reeds provide fiber, thatch, and hidden nesting grounds.', terrains: ['swamp'], yields: { materials: 1 }, glyph: '╿', color: 0xa9bb72 },
  volcanic_vent: { id: 'volcanic_vent', name: 'Volcanic Vent', description: 'Black stone and sulfurous heat break through the ridge.', terrains: ['mountain'], yields: { materials: 1 }, glyph: '♨', color: 0xe2764d },
  wild_garden: { id: 'wild_garden', name: 'Wild Garden', description: 'Edible roots and seed grasses grow together in unusual abundance.', terrains: ['fertile', 'plains'], yields: { food: 1 }, glyph: '❧', color: 0xd5cb72 },
  old_road: { id: 'old_road', name: 'Old Track', description: 'A weathered path hints that others once crossed this country.', terrains: ['plains', 'hills', 'ruins'], yields: { wealth: 1 }, glyph: '⌁', color: 0xcfb77c },
};

export const RESOURCE_NODES: Record<ResourceNodeId, ResourceNodeDef> = {
  wild_game: { id: 'wild_game', name: 'Wild Game', description: 'A dependable hunting ground.', terrains: ['plains', 'forest', 'hills', 'snow'], yields: { food: 1 }, glyph: '♞', color: 0xc79d70 },
  grain: { id: 'grain', name: 'Grain', description: 'Dense stands of edible grass ready for cultivation.', terrains: ['plains', 'fertile'], yields: { food: 1 }, glyph: '♈', color: 0xe0c76f },
  fish: { id: 'fish', name: 'Fish', description: 'Schools gather in these productive waters.', terrains: ['water', 'swamp'], yields: { food: 1 }, glyph: '◒', color: 0x8bd3db },
  timber: { id: 'timber', name: 'Timber', description: 'Straight, workable trunks grow in abundance.', terrains: ['forest', 'rainforest'], yields: { materials: 1 }, glyph: '♠', color: 0x8fb26c },
  stone: { id: 'stone', name: 'Stone', description: 'Exposed rock can be quarried into durable blocks.', terrains: ['hills', 'mountain'], yields: { materials: 1 }, glyph: '◆', color: 0xb8b2a4 },
  clay: { id: 'clay', name: 'Clay', description: 'River deposits provide material for vessels and brick.', terrains: ['swamp', 'fertile', 'plains'], yields: { materials: 1 }, glyph: '●', color: 0xb97557 },
  copper: { id: 'copper', name: 'Copper', description: 'Green-stained seams promise metal to skilled hands.', terrains: ['hills', 'mountain'], yields: { materials: 1, wealth: 1 }, glyph: '⬙', color: 0xd78250 },
  horses: { id: 'horses', name: 'Horses', description: 'Swift herds range across the open country.', terrains: ['plains', 'hills'], yields: { food: 1, wealth: 1 }, glyph: '♘', color: 0xd1b28a },
  salt: { id: 'salt', name: 'Salt', description: 'Pale mineral crusts make food last and merchants travel.', terrains: ['desert', 'water'], yields: { wealth: 1 }, glyph: '✦', color: 0xe7ded0 },
  dyes: { id: 'dyes', name: 'Dyes', description: 'Rare blossoms and insects yield vivid pigments.', terrains: ['rainforest', 'forest', 'swamp'], yields: { wealth: 1 }, glyph: '✿', color: 0xc474aa },
};

export const LANDMARKS: Record<LandmarkId, LandmarkDef> = {
  painted_vault: { id: 'painted_vault', name: 'The Painted Vault', description: 'A cave ceiling preserves a sky of ochre beasts and handprints.', terrains: ['hills', 'mountain'], yields: { knowledge: 2 }, glyph: '◭', color: 0xf0a15f, eventId: 'landmark_painted_vault', ages: ['stone'] },
  jungle_temple: { id: 'jungle_temple', name: 'The Verdant Temple', description: 'Carved steps climb into a shrine consumed by roots and birdsong.', terrains: ['rainforest', 'forest'], yields: { knowledge: 1, influence: 1 }, glyph: '♜', color: 0xe0bf62, eventId: 'landmark_jungle_temple', ages: ['stone', 'bronze', 'classical'] },
  world_tree: { id: 'world_tree', name: 'The World Tree', description: 'A vast crown shades an entire valley; offerings hang from its roots.', terrains: ['forest', 'rainforest', 'fertile'], yields: { food: 1, influence: 1 }, glyph: '♣', color: 0xb7d56a, eventId: 'landmark_world_tree', ages: ['stone', 'bronze'] },
  obsidian_spire: { id: 'obsidian_spire', name: 'The Obsidian Spire', description: 'A blade of black glass rises where the earth once burned.', terrains: ['mountain', 'hills'], yields: { materials: 1, knowledge: 1 }, glyph: '▲', color: 0xb99adb, eventId: 'landmark_obsidian_spire', ages: ['stone', 'bronze', 'classical'] },
  sunken_city: { id: 'sunken_city', name: 'The Drowned City', description: 'At low tide, avenues and columns appear beneath clear water.', terrains: ['water', 'swamp'], yields: { wealth: 1, knowledge: 1 }, glyph: '≋', color: 0x65c8d2, eventId: 'landmark_sunken_city', ages: ['bronze', 'classical'] },
  oracle_spring: { id: 'oracle_spring', name: 'The Oracle Spring', description: 'Warm water rises beneath stones etched with unanswered questions.', terrains: ['fertile', 'hills', 'desert'], yields: { knowledge: 1, influence: 1 }, glyph: '◉', color: 0x76e0d2, eventId: 'landmark_oracle_spring', ages: ['bronze', 'classical'] },
  titan_bones: { id: 'titan_bones', name: 'The Titan Bones', description: 'Ribs taller than houses arc from the hardpan.', terrains: ['desert', 'plains', 'snow'], yields: { knowledge: 2 }, glyph: '☠', color: 0xe8dfc6, eventId: 'landmark_titan_bones', ages: ['stone', 'bronze', 'classical'] },
  sky_stones: { id: 'sky_stones', name: 'The Sky Stones', description: 'A perfect ring of standing stones tracks the wandering stars.', terrains: ['plains', 'hills', 'snow'], yields: { knowledge: 1, influence: 1 }, glyph: '✧', color: 0xb9cce8, eventId: 'landmark_sky_stones', ages: ['stone', 'bronze'] },
  lost_library: { id: 'lost_library', name: 'The Ashen Library', description: 'Clay tablets survive beneath the collapsed roof of a forgotten archive.', terrains: ['ruins', 'desert', 'hills'], yields: { knowledge: 2 }, glyph: '▤', color: 0xe5c877, eventId: 'landmark_lost_library', ages: ['bronze', 'classical'] },
  first_battlefield: { id: 'first_battlefield', name: 'Field of Standards', description: 'Broken spearheads and burial mounds mark a war with no surviving name.', terrains: ['plains', 'hills', 'ruins'], yields: { influence: 1, knowledge: 1 }, glyph: '⚑', color: 0xd27968, eventId: 'landmark_first_battlefield', ages: ['bronze', 'classical'] },
};

export const getMapFeature = (id: MapFeatureId | null) => id ? MAP_FEATURES[id] : null;
export const getResourceNode = (id: ResourceNodeId | null) => id ? RESOURCE_NODES[id] : null;
export const getLandmark = (id: LandmarkId | null) => id ? LANDMARKS[id] : null;
