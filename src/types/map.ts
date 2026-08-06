/** Cube coordinates for a flat-top hex grid. */
export interface HexCoord { q: number; r: number; s: number; }

export type TileType = 'plains' | 'forest' | 'mountain' | 'water' | 'desert' | 'ruins' | 'fertile' | 'special' | 'rainforest' | 'swamp' | 'hills' | 'snow' | 'ice';
export type MapFeatureId = 'ancient_cave' | 'old_growth_grove' | 'oasis' | 'geothermal_spring' | 'coral_reef' | 'game_trail' | 'marsh_reeds' | 'volcanic_vent' | 'wild_garden' | 'old_road';
export type ResourceNodeId = 'wild_game' | 'grain' | 'fish' | 'timber' | 'stone' | 'clay' | 'copper' | 'horses' | 'salt' | 'dyes';
export type LandmarkId = 'painted_vault' | 'jungle_temple' | 'world_tree' | 'obsidian_spire' | 'sunken_city' | 'oracle_spring' | 'titan_bones' | 'sky_stones' | 'lost_library' | 'first_battlefield';

export interface Tile {
  coord: HexCoord;
  type: TileType;
  elevation: number;
  moisture: number;
  visible: boolean;
  surveyed: boolean;
  controlled: boolean;
  worked: boolean;
  building: string | null;
  settlementName: string | null;
  rivalId: string | null;
  feature: MapFeatureId | null;
  resource: ResourceNodeId | null;
  landmark: LandmarkId | null;
  landmarkInvestigated: boolean;
  river: boolean;
  /** Neighbor direction indices (0–5) this river intentionally connects to. */
  riverEdges: number[];
  road: boolean;
}
