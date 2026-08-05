import { AgeDef, AgeId } from '@/types/game';

export const AGES: AgeDef[] = [
  {
    id: 'stone', name: 'Stone Age', subtitle: 'The First Hearth',
    description: 'A scattered people learn to survive, remember, and become a tribe.',
    mapSize: 37, turnsPerAge: 10, rivalCount: 1, accent: '#d99a5b',
  },
  {
    id: 'bronze', name: 'Bronze Age', subtitle: 'Cities of River and Flame',
    description: 'Villages become cities. Trade, law, and conquest decide who controls the river valleys.',
    mapSize: 61, turnsPerAge: 11, rivalCount: 2, accent: '#d47b48',
    startingResources: { wealth: 3, influence: 2 },
  },
  {
    id: 'classical', name: 'Classical Age', subtitle: 'The Shape of an Empire',
    description: 'Your people must decide whether greatness means citizenship, wisdom, or dominion.',
    mapSize: 91, turnsPerAge: 12, rivalCount: 2, accent: '#d7bd72',
    startingResources: { wealth: 5, influence: 5 },
  },
];

export const PLAYABLE_AGE_IDS = AGES.map(age => age.id);

export function getNextAge(current: AgeId): AgeDef | null {
  const index = AGES.findIndex(age => age.id === current);
  return index >= 0 && index < AGES.length - 1 ? AGES[index + 1] : null;
}

export function getAgeDef(id: AgeId): AgeDef {
  return AGES.find(age => age.id === id) ?? AGES[0];
}
