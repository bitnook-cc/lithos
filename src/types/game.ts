import { Tile, HexCoord, TileType } from './map';

export type AgeId = 'stone' | 'bronze' | 'classical' | 'medieval' | 'renaissance' | 'industrial' | 'modern' | 'space';

export interface Resources {
  food: number;
  materials: number;
  wealth: number;
  knowledge: number;
  influence: number;
  population: number;
}

export interface ArmyStats {
  strength: number;
  toughness: number;
  speed: number;
  stealth: number;
  morale: number;
  numbers: number;
}

export interface Leader {
  name: string;
  traits: string[];
}

export interface CivState {
  identity: {
    military: number;
    economy: number;
    knowledge: number;
  };
  tags: string[];
  leaders: Leader[];
}

export interface RivalCiv {
  id: string;
  name: string;
  personality: 'aggressive' | 'defensive' | 'trader';
  threat: ArmyStats;
  disposition: number;
  homeTile: HexCoord;
  controlledTiles: HexCoord[];
}

export interface TechNode {
  id: string;
  name: string;
  description: string;
  cost: number;
  researched: boolean;
  requires: string[];
  effects: TechEffects;
}

export interface TechEffects {
  resourceBonuses?: Partial<Resources>;
  armyBonuses?: Partial<ArmyStats>;
  unlocksBuilding?: string;
  addsCivTag?: string;
  addsLeaderTrait?: string;
  isAdvance?: boolean;
}

export interface BuildingDef {
  id: string;
  name: string;
  cost: Partial<Resources>;
  produces: Partial<Resources>;
  armyBonuses?: Partial<ArmyStats>;
  requiredTile?: TileType[];
  availableFrom: AgeId;
}

export interface AgeDef {
  id: AgeId;
  name: string;
  mapSize: number;
  turnsPerAge: number;
  startingResources?: Partial<Resources>;
}

export interface GameState {
  age: AgeId;
  turn: number;
  actionPoints: number;
  maxActionPoints: number;
  resources: Resources;
  army: ArmyStats;
  civ: CivState;
  map: Tile[];
  rivals: RivalCiv[];
  techs: TechNode[];
  flags: Record<string, boolean>;
  phase: 'collect' | 'actions' | 'event' | 'enemy' | 'gameOver' | 'ageTransition';
  currentEvent: string | null;
  gameOver: { reason: string; victory: boolean } | null;
  activeResearch: string | null;    // tech ID being researched
  researchProgress: number;         // accumulated knowledge toward active research
  firedEvents: string[];            // IDs of events that have already fired
}
