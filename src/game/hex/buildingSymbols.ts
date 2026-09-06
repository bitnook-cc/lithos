import { getBuildingDef } from '@/data/buildings';

export type BuildingSymbol = 'hearth' | 'food' | 'materials' | 'knowledge' | 'defense' | 'water' | 'settlement';
/** Geometric silhouettes rather than platform-dependent emoji or a new bitmap asset pipeline. */
export function buildingSymbol(id: string): BuildingSymbol {
  if (['hearthstone', 'camp'].includes(id)) return 'hearth';
  if (['fishing_dock', 'harbor', 'pearl_diver', 'ice_fishing', 'oasis_well'].includes(id)) return 'water';
  const building = getBuildingDef(id);
  if (building?.armyBonuses?.toughness) return 'defense';
  if (building?.produces.knowledge) return 'knowledge';
  if (building?.produces.materials) return 'materials';
  if (building?.produces.food) return 'food';
  return 'settlement';
}
