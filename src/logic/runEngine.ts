import { AgeId, ArmyStats, GameState, Resources, RivalCiv } from '@/types/game';
import { Tile } from '@/types/map';
import { getAgeContent } from '@/data/content';
import { getPerk } from '@/data/legacy';
import { generateMap } from './mapGenerator';
import { createRival } from './rivalEngine';
import { mulberry32 } from './random';

export const BASE_RESOURCES: Resources = { food: 10, materials: 5, wealth: 0, knowledge: 0, influence: 0, population: 5 };
export const BASE_ARMY: ArmyStats = { strength: 3, toughness: 2, speed: 2, stealth: 1, morale: 3, numbers: 5 };

function addPartial<T extends object>(base: T, delta?: Partial<T>): T {
  const result = { ...base } as T;
  if (!delta) return result;
  for (const key of Object.keys(delta) as (keyof T)[]) {
    const amount = delta[key];
    if (typeof amount === 'number') {
      (result as Record<keyof T, number>)[key] = Number(base[key]) + amount;
    }
  }
  return result;
}

export function createAgeWorld(age: AgeId, seed: number): { map: Tile[]; rivals: RivalCiv[] } {
  const content = getAgeContent(age);
  const map = generateMap({ targetTiles: content.definition.mapSize, seed, age });
  const origin = map.find(tile => tile.coord.q === 0 && tile.coord.r === 0 && tile.coord.s === 0);
  if (origin) origin.building = content.settlementBuilding;

  const rand = mulberry32(seed + 101);
  const candidates = map
    .filter(tile => !tile.controlled && !tile.visible && tile.type !== 'water')
    .sort((a, b) => Math.abs(b.coord.q) + Math.abs(b.coord.r) - Math.abs(a.coord.q) - Math.abs(a.coord.r));
  const rivals: RivalCiv[] = [];
  for (let index = 0; index < Math.min(content.definition.rivalCount, candidates.length); index++) {
    const tile = candidates[Math.min(candidates.length - 1, index * Math.max(1, Math.floor(candidates.length / content.definition.rivalCount)))];
    const rival = createRival(age, tile.coord, rand);
    tile.rivalId = rival.id;
    rivals.push(rival);
  }
  return { map, rivals };
}

export function createNewRun(activePerks: string[], seed: number): GameState {
  const content = getAgeContent('stone');
  const selectedPerks = activePerks.map(getPerk).filter((perk): perk is NonNullable<typeof perk> => Boolean(perk));
  let resources = { ...BASE_RESOURCES };
  let army = { ...BASE_ARMY };
  let maxActionPoints = 3;
  for (const perk of selectedPerks) {
    resources = addPartial(resources, perk.startingResources);
    army = addPartial(army, perk.startingArmy);
    for (const effect of perk.effects ?? []) if (effect.type === 'action_point_bonus') maxActionPoints += effect.amount;
  }
  const { map, rivals } = createAgeWorld('stone', seed);
  return {
    age: 'stone', turn: 1, actionPoints: maxActionPoints, maxActionPoints, exploration: 1,
    resources, army,
    civ: { identity: { military: 0, economy: 0, knowledge: 0 }, tags: [], leaders: [{ name: 'Kara', traits: ['Bold'] }] },
    map, rivals, techs: content.createTechs(), permanentEffects: [], flags: {}, phase: 'collect', currentEvent: null, eventOrigin: null,
    gameOver: null, activeResearch: null, researchProgress: 0, growthProgress: 0, firedEvents: [], activePerks,
    featsEarned: [],
    chronicle: [{ id: `stone-1-beginning-${seed}`, age: 'stone', turn: 1, title: 'The First Hearth', text: 'Kara gathered the survivors around a fire and asked what kind of people they would become.', tone: 'discovery' }],
    stats: { choicesMade: 0, tilesExplored: 0, tilesExpanded: 0, buildingsBuilt: 0, rivalsDefeated: 0, agesCompleted: 0, landmarksDiscovered: 0 },
    runRecorded: false,
  };
}
