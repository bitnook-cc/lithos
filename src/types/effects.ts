import { ArmyStats, Resources } from './game';
import { TileType } from './map';

/** Discriminated union for all game effects */
export type Effect =
  | { type: 'army_bonus'; stat: keyof ArmyStats; amount: number }
  | { type: 'tile_bonus'; tileType: TileType; resource: keyof Resources; amount: number }
  | { type: 'building_bonus'; buildingId: string; resource: keyof Resources; amount: number }
  | { type: 'resource_per_turn'; resource: keyof Resources; amount: number }
  | { type: 'unlock_building'; buildingId: string }
  | { type: 'upgrade_building'; buildingId: string }
  | { type: 'add_civ_tag'; tagId: string }
  | { type: 'add_leader_trait'; trait: string }
  | { type: 'advance_age' };

/** Tag definition with optional effects */
export interface TagDef {
  id: string;
  name: string;
  description: string;
  effects?: Effect[];
}
