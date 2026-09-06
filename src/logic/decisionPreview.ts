import { BuildingDef, GameState, Resources } from '@/types/game';
import { EventChoice } from '@/types/events';
import { Tile } from '@/types/map';
import { CULTURE_AXES } from './cultureEngine';
import { reserveLimit } from './developmentEngine';
import { districtYield } from './economyView';
import { getBuildingDef } from '@/data/buildings';
import { getFeat } from '@/data/legacy';

export const resourceName = (key: string) => key === 'knowledge' ? 'research reserve' : key === 'population' ? 'people' : key;
const signed = (n: number) => `${n > 0 ? '+' : ''}${n}`;

/** Base effects only: never roll or reveal the contents of random outcomes. Costs are shown separately. */
export function choicePreview(state: GameState, choice: EventChoice) {
  const immediate: string[] = [];
  for (const [key, amount] of Object.entries(choice.effects.resources ?? {})) {
    if (!amount) continue;
    const resource = key as keyof Resources;
    const paid = Math.max(0, state.resources[resource] - (choice.cost?.[resource] ?? 0));
    const before = resource === 'knowledge' && choice.cost?.knowledge ? Math.min(reserveLimit(state), paid) : paid;
    const after = Math.min(resource === 'knowledge' ? reserveLimit(state) : Infinity, Math.max(0, before + amount));
    immediate.push(`${signed(after - before)} ${resourceName(key)}${key === 'knowledge' && after - before !== amount ? ' (reserve cap)' : ''}`);
  }
  for (const axis of CULTURE_AXES) {
    const amount = choice.effects.identity?.[axis.key] ?? 0;
    if (!amount) continue;
    const change = Math.max(-100, Math.min(100, state.civ.identity[axis.key] + amount)) - state.civ.identity[axis.key];
    immediate.push(change ? `More ${amount > 0 ? axis.right.toLowerCase() : axis.left.toLowerCase()} (${Math.abs(change)})` : `${amount > 0 ? axis.right : axis.left} limit reached`);
  }
  for (const [key, amount] of Object.entries(choice.effects.army ?? {})) {
    if (amount) immediate.push(`${signed(Math.max(0, state.army[key as keyof typeof state.army] + amount) - state.army[key as keyof typeof state.army])} army ${key}`);
  }
  if (choice.effects.addCivTag && !state.civ.tags.includes(choice.effects.addCivTag)) immediate.push(`Gain ${choice.effects.addCivTag}`);
  if (choice.effects.addLeaderTrait && !state.civ.leaders[state.civ.leaders.length - 1]?.traits.includes(choice.effects.addLeaderTrait)) immediate.push(`Leader trait: ${choice.effects.addLeaderTrait}`);
  if (choice.effects.grantFeat && !state.featsEarned.includes(choice.effects.grantFeat)) immediate.push(`Feat: ${getFeat(choice.effects.grantFeat)?.name ?? choice.effects.grantFeat}`);
  const paidPopulation = Math.max(0, state.resources.population - (choice.cost?.population ?? 0));
  return { immediate, uncertain: Boolean(choice.effects.outcomes?.length), fatal: Boolean(choice.effects.fatalReason) || paidPopulation <= 0 || paidPopulation + (choice.effects.resources?.population ?? 0) <= 0 };
}

/** Compare complete staffed district yields, including discovery bonuses lost when replacing a building. */
export function constructionPreview(state: GameState, tile: Tile, building: BuildingDef) {
  const before = districtYield(state, tile);
  const after = districtYield(state, { ...tile, building: building.id });
  const production = Object.keys(after).filter(key => (after[key as keyof Resources] ?? 0) !== (before[key as keyof Resources] ?? 0)).map(key => {
    const oldValue = before[key as keyof Resources] ?? 0, newValue = after[key as keyof Resources] ?? 0;
    return `${key === 'knowledge' ? 'Research' : key[0].toUpperCase() + key.slice(1)} ${oldValue} → ${newValue}/turn (${signed(newValue - oldValue)})`;
  });
  const previous = getBuildingDef(tile.building ?? '')?.armyBonuses ?? {};
  const army = [...new Set([...Object.keys(previous), ...Object.keys(building.armyBonuses ?? {})])].flatMap(key => {
    const stat = key as keyof typeof previous;
    const delta = (building.armyBonuses?.[stat] ?? 0) - (previous[stat] ?? 0);
    return delta ? [`${signed(delta)} army ${key}`] : [];
  });
  return [...production, ...army];
}
