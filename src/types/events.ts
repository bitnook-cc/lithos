import { AgeId, Resources, ArmyStats } from './game';
import { TileType } from './map';

export interface EventTrigger {
  age?: AgeId;
  minTurn?: number;
  maxTurn?: number;
  flags?: Record<string, boolean>;
  identity?: Partial<Record<'military' | 'economy' | 'knowledge', { min?: number; max?: number }>>;
  leaderTraits?: string[];
  civTags?: string[];
  tileRevealed?: TileType[];
}

export interface EventOutcome {
  weight: number;
  text: string;
  flags?: Record<string, boolean>;
  combat?: { enemyStrength: number; enemyToughness: number };
}

export interface EventChoice {
  id: string;
  text: string;
  requires: {
    identity?: Partial<Record<'military' | 'economy' | 'knowledge', number>>;
    leaderTraits?: string[];
    civTags?: string[];
    armyStats?: Partial<ArmyStats>;
  };
  effects: {
    resources?: Partial<Resources>;
    identity?: Partial<Record<'military' | 'economy' | 'knowledge', number>>;
    army?: Partial<ArmyStats>;
    flags?: Record<string, boolean>;
    addCivTag?: string;
    addLeaderTrait?: string;
    outcomes?: EventOutcome[];
  };
}

export interface GameEvent {
  id: string;
  age: AgeId;
  triggers: EventTrigger;
  text: string;
  choices: EventChoice[];
  chain?: {
    nextEvents: Record<string, string>;
  };
  unique?: boolean;
}
