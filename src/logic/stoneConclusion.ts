import { GameState } from '@/types/game';
import { getCultureProfile } from './cultureEngine';
import { getBuildingDef } from '@/data/buildings';
import { economySummary } from './economyView';

export function isStoneConclusion(state: GameState) {
  const notice = state.runtime?.notices[0];
  return state.age === 'stone' && state.phase === 'ageTransition' && !state.gameOver && notice?.type === 'tech'
    && state.techs.some(t => t.id === notice.techId && t.researched && t.effects.some(e => e.type === 'advance_age'));
}

/** Read the still-intact Stone world at its persisted transition, before Bronze transforms the capital. */
export function stoneConclusion(state: GameState) {
  const districts = state.map.filter(tile => tile.controlled);
  const memories = state.chronicle.filter(entry => entry.age === 'stone' && !entry.id.startsWith('tech-') && !entry.id.startsWith('feat-') && !entry.id.startsWith('stone-1-beginning-'));
  return {
    culture: getCultureProfile(state.civ.identity),
    districts: districts.length,
    buildings: districts.filter(tile => tile.building).length,
    discoveries: state.techs.filter(tech => tech.researched).map(tech => tech.name),
    settlements: districts.map(tile => ({ key: `${tile.coord.q},${tile.coord.r}`, name: tile.settlementName ?? getBuildingDef(tile.building ?? '')?.name ?? `${tile.type} district`, location: `${tile.coord.q}, ${tile.coord.r}` })),
    memories,
    netFood: economySummary(state).netFood,
  };
}
