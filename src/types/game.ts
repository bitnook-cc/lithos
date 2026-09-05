import { Tile, HexCoord, TileType } from './map';
import { Effect } from './effects';

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
  effects: Effect[];
}

export interface BuildingDef {
  id: string;
  name: string;
  cost: Partial<Resources>;
  produces: Partial<Resources>;
  armyBonuses?: Partial<ArmyStats>;
  requiredTile?: TileType[];
  availableFrom: AgeId;
  upgradesFrom?: string;  // building ID this upgrades from
}

export interface AgeDef {
  id: AgeId;
  name: string;
  subtitle: string;
  description: string;
  mapSize: number;
  turnsPerAge: number;
  rivalCount: number;
  accent: string;
  startingResources?: Partial<Resources>;
}

export interface ChronicleEntry {
  id: string;
  age: AgeId;
  turn: number;
  title: string;
  text: string;
  tone: 'neutral' | 'triumph' | 'loss' | 'discovery';
}

export interface RunStats {
  choicesMade: number;
  tilesExplored: number;
  tilesExpanded: number;
  buildingsBuilt: number;
  rivalsDefeated: number;
  agesCompleted: number;
  landmarksDiscovered: number;
}

export interface RunSummary {
  age: AgeId;
  turn: number;
  victory: boolean;
  reason: string;
  featsEarned: string[];
}

export interface PerkDef {
  id: string;
  name: string;
  description: string;
  flavor: string;
  unlockedBy: string;
  startingResources?: Partial<Resources>;
  startingArmy?: Partial<ArmyStats>;
  effects?: Effect[];
}

export interface FeatDef {
  id: string;
  name: string;
  description: string;
  flavor: string;
  perkId: string;
  reward?: {
    resources?: Partial<Resources>;
    army?: Partial<ArmyStats>;
    addCivTag?: string;
  };
}

export interface MetaState {
  recordedRunIds?: string[];
  unlockedFeats: string[];
  unlockedPerks: string[];
  completedRuns: number;
  victories: number;
  bestAge: AgeId;
  runHistory: RunSummary[];
}

export interface GameState {
  development?: DevelopmentState;
  tutorial?: { enabled: boolean; foodInspected: boolean; target: HexCoord | null };
  /** Optional only for pre-alpha saves and domain fixtures; normalized at the command boundary. */
  runtime?: RunRuntime;
  age: AgeId;
  turn: number;
  actionPoints: number;
  maxActionPoints: number;
  exploration: number;
  resources: Resources;
  army: ArmyStats;
  civ: CivState;
  map: Tile[];
  rivals: RivalCiv[];
  techs: TechNode[];
  permanentEffects: Effect[];
  flags: Record<string, boolean>;
  phase: 'setup' | 'collect' | 'actions' | 'event' | 'eventResult' | 'enemy' | 'enemyResult' | 'gameOver' | 'ageTransition';
  currentEvent: string | null;
  eventOrigin: 'turn' | 'discovery' | null;
  gameOver: { reason: string; victory: boolean } | null;
  activeResearch: string | null;    // tech ID being researched
  researchProgress: number;         // accumulated knowledge toward active research
  growthProgress: number;           // accumulated food surplus toward next population
  firedEvents: string[];            // IDs of events that have already fired
  activePerks: string[];
  featsEarned: string[];
  chronicle: ChronicleEntry[];
  stats: RunStats;
  runRecorded: boolean;
}

export interface DevelopmentState {
  discoveredTechs: string[];
  unlockedBuildings: string[];
  projects: Record<string, { progress: number; ticks: number }>;
  inheritance?: { from: AgeId; districts: number; buildings: number; discoveries: number; foodPerTurn: number; text: string };
}

export type RunNotice = { id: string } & (
  | { type: 'result'; title: string; text?: string; effects: string[] }
  | { type: 'tech'; techId: string }
  | { type: 'age'; age: AgeId }
  | { type: 'feat'; featId: string }
);

export interface RunRuntime {
  runId: string;
  randomState: number;
  commandSequence: number;
  noticeSequence: number;
  notices: RunNotice[];
}
