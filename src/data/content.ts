import { AgeId, TechNode } from '@/types/game';
import { GameEvent } from '@/types/events';
import { getAgeDef } from './ages';
import { STONE_AGE_EVENTS } from './events/stoneAge';
import { BRONZE_AGE_EVENTS } from './events/bronzeAge';
import { CLASSICAL_AGE_EVENTS } from './events/classicalAge';
import { stoneAgeTechs } from './techs/stoneAge';
import { bronzeAgeTechs } from './techs/bronzeAge';
import { classicalAgeTechs } from './techs/classicalAge';

export interface AgeContent {
  definition: ReturnType<typeof getAgeDef>;
  events: GameEvent[];
  createTechs: () => TechNode[];
  settlementBuilding: string;
}

const CONTENT: Partial<Record<AgeId, AgeContent>> = {
  stone: { definition: getAgeDef('stone'), events: STONE_AGE_EVENTS, createTechs: stoneAgeTechs, settlementBuilding: 'hearthstone' },
  bronze: { definition: getAgeDef('bronze'), events: BRONZE_AGE_EVENTS, createTechs: bronzeAgeTechs, settlementBuilding: 'palace' },
  classical: { definition: getAgeDef('classical'), events: CLASSICAL_AGE_EVENTS, createTechs: classicalAgeTechs, settlementBuilding: 'forum' },
};

export function getAgeContent(age: AgeId): AgeContent {
  return CONTENT[age] ?? CONTENT.stone!;
}
