import { GameState } from '@/types/game';
import { getBuildingDef } from '@/data/buildings';

export function openingObjective(state: GameState) {
  if (!state.tutorial?.enabled || state.age !== 'stone') return null;
  const target = state.map.find(t => t.coord.q === state.tutorial?.target?.q && t.coord.r === state.tutorial?.target?.r);
  if (!state.tutorial.foodInspected) return { step: 1, title: 'Read the hearth', text: 'Open Food & workers. Compare food produced with mouths to feed; stored food covers a shortfall.', action: 'food' } as const;
  if (!target?.surveyed) return { step: 2, title: 'Find a dependable food source', text: 'Survey the highlighted fertile district. Survey costs 1 action and reveals resources; it does not claim land.', action: 'district' } as const;
  if (!target.controlled) return { step: 3, title: 'Make room for your people', text: 'Claim the surveyed district for 1 action. One person will work there, adding its food to every collection.', action: 'district' } as const;
  if (!state.techs.some(t => t.id === 'survival' && t.researched) && state.activeResearch !== 'survival') return { step: 4, title: 'Research Survival', text: 'Choose Survival in Research. Discoveries take at least two collections. End turns to make progress; changing projects keeps your work.', action: 'research' } as const;
  if (!(target.building && (getBuildingDef(target.building)?.produces.food ?? 0) > 0)) {
    if (!state.techs.some(t => t.id === 'survival' && t.researched)) return { step: 5, title: 'Let research take root', text: 'End turns and resolve events until Survival completes. Each collection advances the project; saved knowledge alone cannot finish it instantly.', action: 'turn' } as const;
    return { step: 5, title: 'Build a lasting food supply', text: 'Build a Gathering Site in the claimed district: 1 action and 3 materials, for +2 food each turn.', action: 'district' } as const;
  }
  if (!state.flags.tutorial_event_done) return { step: 6, title: 'Decide what abundance means', text: 'End the turn to face The First Harvest. Choose what to do with your surplus and see how that choice shapes your culture.', action: 'turn' } as const;
  return { step: 7, title: 'A hearth that can endure', text: 'You have learned the opening loop. Explore, follow a research branch, and complete Dawn of Bronze when you are ready. The next age keeps your settled districts.', action: 'complete' } as const;
}
