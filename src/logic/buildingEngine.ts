import { GameState } from '@/types/game';
import { getBuildingDef } from '@/data/buildings';

/** An unlocked upgrade includes the construction methods needed to establish its base. */
export function getUnlockedBuildings(state: Pick<GameState, 'techs'>): Set<string> {
  const ids = new Set<string>();
  const add = (id: string) => {
    if (ids.has(id)) return;
    ids.add(id);
    const base = getBuildingDef(id)?.upgradesFrom;
    if (base) add(base);
  };
  for (const tech of state.techs) if (tech.researched) for (const effect of tech.effects) {
    if (effect.type === 'unlock_building' || effect.type === 'upgrade_building') add(effect.buildingId);
  }
  return ids;
}
