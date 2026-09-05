import { DevelopmentState, GameState } from '@/types/game';
import { getAgeContent } from '@/data/content';
import { AGES } from '@/data/ages';
import { getBuildingDef } from '@/data/buildings';

export const ALL_DISCOVERIES = AGES.flatMap(age => getAgeContent(age.id).createTechs());
export const MIN_RESEARCH_TICKS = 2;
export function reserveLimit(state: Pick<GameState, 'age'>): number {
  return { stone: 24, bronze: 40, classical: 60 }[state.age as 'stone' | 'bronze' | 'classical'] ?? 24;
}

/** Persistent methods are independent of the current age's selectable projects. */
export function getDevelopment(state: Pick<GameState, 'techs' | 'development'>): DevelopmentState {
  const discoveredTechs = [...new Set([...(state.development?.discoveredTechs ?? []), ...state.techs.filter(t => t.researched).map(t => t.id)])];
  const methods = new Set(state.development?.unlockedBuildings ?? []);
  const add = (id: string) => {
    if (methods.has(id)) return;
    methods.add(id);
    const base = getBuildingDef(id)?.upgradesFrom;
    if (base) add(base);
  };
  for (const id of discoveredTechs) for (const effect of ALL_DISCOVERIES.find(t => t.id === id)?.effects ?? []) {
    if (effect.type === 'unlock_building' || effect.type === 'upgrade_building') add(effect.buildingId);
  }
  return { ...state.development, discoveredTechs, unlockedBuildings: [...methods], projects: { ...state.development?.projects } };
}

export function researchEstimate(state: GameState, techId: string, income: number): number {
  const tech = state.techs.find(t => t.id === techId);
  if (!tech || tech.researched) return 0;
  const saved = state.development?.projects[techId];
  const progress = state.activeResearch === techId ? state.researchProgress : saved?.progress ?? 0;
  const ticks = saved?.ticks ?? 0;
  const remaining = Math.max(0, tech.cost - progress - state.resources.knowledge);
  return Math.max(MIN_RESEARCH_TICKS - ticks, remaining === 0 ? 1 : income > 0 ? Math.ceil(remaining / income) : Infinity);
}
