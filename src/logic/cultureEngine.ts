import { CivState } from '@/types/game';

export type CultureTone = 'balanced' | 'warlike' | 'pacifist' | 'mercantile' | 'insular' | 'erudite' | 'traditional';
export type CultureAxisKey = keyof CivState['identity'];

export interface CultureProfile {
  tone: CultureTone;
  name: string;
  symbol: string;
  ideal: string;
  description: string;
}

export const CULTURE_AXES: { key: CultureAxisKey; left: string; right: string; color: string }[] = [
  { key: 'military', left: 'Pacifist', right: 'Warlike', color: '#d76658' },
  { key: 'economy', left: 'Insular', right: 'Mercantile', color: '#d6a24f' },
  { key: 'knowledge', left: 'Traditional', right: 'Erudite', color: '#7fa6d8' },
];

const PROFILES: Record<CultureTone, CultureProfile> = {
  balanced: {
    tone: 'balanced', name: 'A People Becoming', symbol: '◇', ideal: 'The Unwritten Path',
    description: 'No single value yet commands the common imagination.',
  },
  warlike: {
    tone: 'warlike', name: 'Warlike', symbol: '⚔', ideal: 'The Spear',
    description: 'Strength, courage, and victory are treated as proofs of worth.',
  },
  pacifist: {
    tone: 'pacifist', name: 'Conciliatory', symbol: '◌', ideal: 'The Open Hand',
    description: 'Restraint and settlement are honored above glorious violence.',
  },
  mercantile: {
    tone: 'mercantile', name: 'Mercantile', symbol: '◆', ideal: 'The Open Road',
    description: 'Exchange, prosperity, and useful ties define the common good.',
  },
  insular: {
    tone: 'insular', name: 'Insular', symbol: '⬡', ideal: 'The Closed Gate',
    description: 'Self-reliance and guarded custom matter more than foreign promises.',
  },
  erudite: {
    tone: 'erudite', name: 'Erudite', symbol: '✦', ideal: 'The Lamp',
    description: 'Inquiry, memory, and learned argument carry public prestige.',
  },
  traditional: {
    tone: 'traditional', name: 'Traditionalist', symbol: '◎', ideal: 'The Ancestral Hearth',
    description: 'Inherited practice is trusted because it has survived every test.',
  },
};

const POSITIVE_TONE: Record<CultureAxisKey, CultureTone> = {
  military: 'warlike', economy: 'mercantile', knowledge: 'erudite',
};
const NEGATIVE_TONE: Record<CultureAxisKey, CultureTone> = {
  military: 'pacifist', economy: 'insular', knowledge: 'traditional',
};

export function getCultureProfile(identity: CivState['identity']): CultureProfile {
  const dominant = CULTURE_AXES.reduce((best, axis) =>
    Math.abs(identity[axis.key]) > Math.abs(identity[best.key]) ? axis : best
  );
  const value = identity[dominant.key];
  if (Math.abs(value) < 5) return PROFILES.balanced;
  return PROFILES[value > 0 ? POSITIVE_TONE[dominant.key] : NEGATIVE_TONE[dominant.key]];
}

export function cultureAxisPosition(value: number): number {
  return (Math.max(-100, Math.min(100, value)) + 100) / 2;
}
