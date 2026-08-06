import { AgeId } from '@/types/game';
import { mulberry32 } from '@/logic/random';

const NAMES: Record<'stone' | 'bronze' | 'classical', string[]> = {
  stone: [
    'Ash Hollow', 'Red Elk', 'Flintmere', 'Dawn Shelter', 'Wolfwater', 'Ember Vale',
    'Riverbone', 'Old Cedar', 'Mammoth Rest', 'Sky Cairn', 'Fox Crossing', 'Rainstone',
    'Bright Cave', 'Aurochs Ford', 'Smoke Hill', 'Moonwell', 'Thorn Hearth', 'Eagle Reach',
  ],
  bronze: [
    'Aresh', 'Kassara', 'Tamaruk', 'Namarra', 'Ur-Kesh', 'Belisar', 'Orundu', 'Samara',
    'Dun Avar', 'Tel Harun', 'Khorat', 'Zamiri', 'Ashkel', 'Marad', 'Ilyra', 'Hattun',
  ],
  classical: [
    'Asterion', 'Caldria', 'Thessara', 'Veyra', 'Orinth', 'Cassara', 'Pelagon', 'Ephyra',
    'Aurelis', 'Korinthos', 'Selucia', 'Myreon', 'Valeria', 'Olyssos', 'Theramon', 'Nemea',
  ],
};

export function generateSettlementName(age: AgeId, seed: number): string {
  const era = age === 'bronze' || age === 'classical' ? age : 'stone';
  const names = NAMES[era];
  const rand = mulberry32((seed ^ 0x51e771e) + era.length * 997);
  return names[Math.floor(rand() * names.length)];
}
