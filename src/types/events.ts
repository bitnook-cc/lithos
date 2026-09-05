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
  activePerks?: string[];
  tileRevealed?: TileType[];
}

export interface EventOutcome {
  weight: number;
  text: string;
  flags?: Record<string, boolean>;
  resources?: Partial<Resources>;
  identity?: Partial<Record<'military' | 'economy' | 'knowledge', number>>;
  army?: Partial<ArmyStats>;
  grantFeat?: string;
  combat?: { enemyStrength: number; enemyToughness: number };
  fatalReason?: string;
}

export interface EventChoice {
  id: string;
  text: string;
  /** Voluntary payments must be affordable. Negative effects are unavoidable losses. */
  cost?: Partial<Resources>;
  requires: {
    identity?: Partial<Record<'military' | 'economy' | 'knowledge', number>>;
    leaderTraits?: string[];
    civTags?: string[];
    activePerks?: string[];
    armyStats?: Partial<ArmyStats>;
  };
  effects: {
    resources?: Partial<Resources>;
    identity?: Partial<Record<'military' | 'economy' | 'knowledge', number>>;
    army?: Partial<ArmyStats>;
    flags?: Record<string, boolean>;
    addCivTag?: string;
    addLeaderTrait?: string;
    grantFeat?: string;
    chronicle?: string;
    fatalReason?: string;
    outcomes?: EventOutcome[];
  };
}

export interface GameEvent {
  id: string;
  title?: string;
  category?: 'survival' | 'discovery' | 'politics' | 'war' | 'legacy';
  weight?: number;
  age: AgeId;
  triggers: EventTrigger;
  text: string;
  choices: EventChoice[];
  chain?: {
    nextEvents: Record<string, string>;
  };
  repeatable?: boolean;  // if true, can fire multiple times; default is non-repeatable
}
