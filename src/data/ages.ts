import { AgeDef } from '@/types/game';

export const AGES: AgeDef[] = [
  { id: 'stone', name: 'Stone Age', mapSize: 15, turnsPerAge: 12 },
  { id: 'bronze', name: 'Bronze Age', mapSize: 25, turnsPerAge: 12 },
  { id: 'classical', name: 'Classical Age', mapSize: 30, turnsPerAge: 12 },
  { id: 'medieval', name: 'Medieval Age', mapSize: 35, turnsPerAge: 12 },
  { id: 'renaissance', name: 'Renaissance', mapSize: 35, turnsPerAge: 10 },
  { id: 'industrial', name: 'Industrial Age', mapSize: 30, turnsPerAge: 10 },
  { id: 'modern', name: 'Modern Age', mapSize: 30, turnsPerAge: 10 },
  { id: 'space', name: 'Space Age', mapSize: 30, turnsPerAge: 10 },
];

export function getNextAge(current: string): AgeDef | null {
  const idx = AGES.findIndex(a => a.id === current);
  if (idx < 0 || idx >= AGES.length - 1) return null;
  return AGES[idx + 1];
}

export function getAgeDef(id: string): AgeDef | undefined {
  return AGES.find(a => a.id === id);
}
