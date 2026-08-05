import { RivalCiv, GameState, AgeId, Resources } from '@/types/game';
import { HexCoord, Tile } from '@/types/map';
import { hexNeighbors } from '@/game/hex/hexUtils';
import { getEffectiveArmy } from './effectsEngine';
import { resolveCombat } from './combatEngine';
import { rebalanceWorkers } from './populationEngine';

const NAMES: Record<'stone' | 'bronze' | 'classical', string[]> = {
  stone: ['Wolf Clan', 'River People', 'Hill Tribe', 'Stone Band', 'Fire Walkers'],
  bronze: ['Kingdom of Aresh', 'Cities of the Reed', 'Oxhide League', 'House of Tammuz'],
  classical: ['Asterian League', 'Republic of Vey', 'The Molossian Kings', 'Saffron Empire'],
};
const PERSONALITIES: RivalCiv['personality'][] = ['aggressive', 'defensive', 'trader'];
const hexKey = (coord: HexCoord) => `${coord.q},${coord.r}`;
const ageStrength = (age: AgeId) => age === 'stone' ? 3 : age === 'bronze' ? 8 : 13;

export function createRival(age: AgeId, homeTile: HexCoord, rand: () => number): RivalCiv {
  const base = ageStrength(age);
  const names = age === 'bronze' ? NAMES.bronze : age === 'classical' ? NAMES.classical : NAMES.stone;
  return {
    id: `rival_${age}_${homeTile.q}_${homeTile.r}`, name: names[Math.floor(rand() * names.length)],
    personality: PERSONALITIES[Math.floor(rand() * PERSONALITIES.length)],
    threat: { strength: base + Math.floor(rand() * 3), toughness: base - 1 + Math.floor(rand() * 2), speed: 2 + Math.floor(base / 6), stealth: 1, morale: 3 + Math.floor(base / 4), numbers: 4 + Math.floor(rand() * 4) + Math.floor(base / 3) },
    disposition: 0, homeTile, controlledTiles: [homeTile],
  };
}

export interface RivalTurnResult {
  rivals: RivalCiv[];
  map: Tile[];
  army?: GameState['army'];
  resources?: Resources;
  phase?: GameState['phase'];
  gameOver?: GameState['gameOver'];
  report?: string;
}

export function processRivalTurn(state: GameState, rand: () => number): RivalTurnResult {
  const map = state.map.map(tile => ({ ...tile }));
  const lookup = new Map(map.map(tile => [hexKey(tile.coord), tile]));
  const rivals = state.rivals.map(rival => ({ ...rival, threat: { ...rival.threat }, controlledTiles: [...rival.controlledTiles] }));
  let army = { ...state.army };
  let resources = { ...state.resources };
  const reports: string[] = [];

  for (const rival of rivals) {
    rival.threat.strength += rival.personality === 'aggressive' ? 1 : 0;
    rival.threat.toughness += rival.personality === 'defensive' && state.turn % 2 === 0 ? 1 : 0;
    rival.threat.numbers = Math.min(rival.threat.numbers + (state.turn % 2 === 0 ? 1 : 0), 24);

    const borderTiles = rival.controlledTiles.flatMap(coord => hexNeighbors(coord).map(neighbor => lookup.get(hexKey(neighbor)))).filter((tile): tile is Tile => Boolean(tile));
    const playerBorder = borderTiles.filter(tile => tile.controlled);
    const shouldAttack = rival.personality === 'aggressive' && rival.disposition < 20 && playerBorder.length > 0 && rand() < 0.35;

    if (shouldAttack) {
      const result = resolveCombat(getEffectiveArmy({ ...state, army, resources, map, rivals }), { enemyStrength: rival.threat.strength, enemyToughness: rival.threat.toughness }, rand);
      army.numbers = Math.max(0, army.numbers - result.numbersLost);
      if (result.victory) {
        rival.threat.numbers = Math.max(1, rival.threat.numbers - 2);
        rival.disposition -= 8;
        resources.wealth += 2;
        reports.push(`${rival.name} tested your border and was driven back.`);
      } else {
        resources.population = Math.max(0, resources.population - 1);
        resources.food = Math.max(0, resources.food - 3);
        reports.push(`${rival.name} broke through the frontier. One district was put to flight.`);
      }
      continue;
    }

    const canExpand = rival.personality === 'aggressive' || (rival.personality === 'trader' && rand() > 0.65);
    const candidates = borderTiles.filter(tile => !tile.controlled && !tile.rivalId && tile.type !== 'water');
    if (canExpand && candidates.length) {
      const target = candidates[Math.floor(rand() * candidates.length)];
      target.rivalId = rival.id;
      rival.controlledTiles.push(target.coord);
      if (target.visible) reports.push(`${rival.name} claimed new land on your frontier.`);
    } else if (rival.personality === 'trader' && rival.disposition >= 20) {
      resources.wealth += 1;
      reports.push(`Trade with ${rival.name} brought +1 wealth.`);
    }
  }

  if (resources.population <= 0) {
    return { rivals, map: rebalanceWorkers(map, resources.population), army, resources, phase: 'gameOver', gameOver: { reason: 'Rival armies scattered the last of your people.', victory: false }, report: reports.join(' ') };
  }
  return { rivals, map: rebalanceWorkers(map, resources.population), army, resources, report: reports.join(' ') || undefined };
}

export type DiplomacyApproach = 'trade' | 'envoy' | 'threaten';
export function processDiplomacyAction(state: GameState, rivalId: string, approach: DiplomacyApproach, rand: () => number): { updates: Partial<GameState>; text: string; success: boolean } {
  const rival = state.rivals.find(item => item.id === rivalId);
  if (!rival) return { updates: {}, text: 'No envoy can find that court.', success: false };
  const rivals = state.rivals.map(item => ({ ...item }));
  const target = rivals.find(item => item.id === rivalId)!;
  const resources = { ...state.resources };
  const identity = { ...state.civ.identity };

  if (approach === 'trade') {
    if (resources.wealth < 2) return { updates: {}, text: 'You need 2 wealth to provision a caravan.', success: false };
    resources.wealth -= 2; resources.food += 3; resources.materials += 2; target.disposition += 18; identity.economy = Math.min(100, identity.economy + 5);
    return { updates: { resources, rivals, civ: { ...state.civ, identity } }, text: `A caravan returns from ${target.name} with food, materials, and safer roads.`, success: true };
  }
  if (approach === 'envoy') {
    if (resources.influence < 2) return { updates: {}, text: 'You need 2 influence to send a credible envoy.', success: false };
    resources.influence -= 2; target.disposition += 25; identity.military = Math.max(-100, identity.military - 3);
    return { updates: { resources, rivals, civ: { ...state.civ, identity } }, text: `Your envoy and ${target.name} agree to respect the frontier.`, success: true };
  }

  const power = getEffectiveArmy(state).strength + getEffectiveArmy(state).numbers / 2;
  const success = power * (0.85 + rand() * 0.3) > target.threat.strength + target.threat.numbers / 2;
  target.disposition -= success ? 8 : 20; identity.military = Math.min(100, identity.military + 6);
  if (success) resources.materials += 4;
  else resources.population = Math.max(0, resources.population - 1);
  const map = rebalanceWorkers(state.map, resources.population);
  return { updates: { resources, rivals, map, civ: { ...state.civ, identity } }, text: success ? `${target.name} yields supplies rather than test your army.` : `${target.name} answers your threat with a bloody border raid.`, success };
}
