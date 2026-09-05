import { GameState, Resources, ArmyStats } from '@/types/game';
import { EventChoice, EventOutcome, GameEvent } from '@/types/events';
import { getFeat } from '@/data/legacy';
import { getEffectiveArmy } from './effectsEngine';
import { interpolateText, resolveOutcome, isChoiceAvailable } from './eventEngine';
import { resolveCombat } from './combatEngine';
import { rebalanceWorkers } from './populationEngine';

interface MutableEffects {
  resources?: Partial<Resources>;
  identity?: Partial<Record<'military' | 'economy' | 'knowledge', number>>;
  army?: Partial<ArmyStats>;
  flags?: Record<string, boolean>;
  addCivTag?: string;
  addLeaderTrait?: string;
  grantFeat?: string;
  fatalReason?: string;
}

export interface ChoiceResolution {
  state: GameState;
  outcomeText?: string;
  effectLabels: string[];
  newFeatIds: string[];
}

const clamp = (value: number, minimum: number, maximum: number) => Math.max(minimum, Math.min(maximum, value));

function applyEffects(state: GameState, effects: MutableEffects, labels: string[], newFeatIds: string[]): GameState {
  let next: GameState = { ...state };

  if (effects.resources) {
    const resources = { ...next.resources };
    for (const [key, amount] of Object.entries(effects.resources)) {
      if (!amount) continue;
      resources[key as keyof Resources] = Math.max(0, resources[key as keyof Resources] + amount);
      const actual = resources[key as keyof Resources] - next.resources[key as keyof Resources];
      labels.push(`${actual > 0 ? '+' : ''}${actual} ${key}`);
    }
    next.resources = resources;
  }

  if (effects.identity) {
    const identity = { ...next.civ.identity };
    for (const [axis, amount] of Object.entries(effects.identity)) {
      if (!amount) continue;
      identity[axis as keyof typeof identity] = clamp(identity[axis as keyof typeof identity] + amount, -100, 100);
      labels.push(`${axis[0].toUpperCase()}${axis.slice(1)} ${amount > 0 ? '+' : ''}${amount}`);
    }
    next.civ = { ...next.civ, identity };
  }

  if (effects.army) {
    const army = { ...next.army };
    for (const [stat, amount] of Object.entries(effects.army)) {
      if (!amount) continue;
      army[stat as keyof ArmyStats] = Math.max(0, army[stat as keyof ArmyStats] + amount);
      labels.push(`${stat[0].toUpperCase()}${stat.slice(1)} ${amount > 0 ? '+' : ''}${amount}`);
    }
    next.army = army;
  }

  if (effects.flags) next.flags = { ...next.flags, ...effects.flags };
  if (effects.addCivTag && !next.civ.tags.includes(effects.addCivTag)) {
    next.civ = { ...next.civ, tags: [...next.civ.tags, effects.addCivTag] };
    labels.push(`New legacy: ${effects.addCivTag}`);
  }
  if (effects.addLeaderTrait) {
    const leaders = [...next.civ.leaders];
    const current = leaders[leaders.length - 1];
    if (current && !current.traits.includes(effects.addLeaderTrait)) {
      leaders[leaders.length - 1] = { ...current, traits: [...current.traits, effects.addLeaderTrait] };
      next.civ = { ...next.civ, leaders };
      labels.push(`${current.name} becomes ${effects.addLeaderTrait}`);
    }
  }

  if (effects.grantFeat && !next.featsEarned.includes(effects.grantFeat)) {
    const feat = getFeat(effects.grantFeat);
    next.featsEarned = [...next.featsEarned, effects.grantFeat];
    newFeatIds.push(effects.grantFeat);
    if (feat) {
      labels.push(`Feat: ${feat.name}`);
      next = applyEffects(next, feat.reward ?? {}, labels, newFeatIds);
    }
  }

  if (effects.fatalReason || next.resources.population <= 0) {
    next.phase = 'gameOver';
    next.gameOver = { reason: effects.fatalReason ?? 'Your people have perished.', victory: false };
  }
  return next;
}

export function grantFeatsToRun(state: GameState, featIds: string[]): { state: GameState; granted: string[]; labels: string[] } {
  const labels: string[] = [];
  const granted: string[] = [];
  let next = state;
  for (const featId of featIds) next = applyEffects(next, { grantFeat: featId }, labels, granted);
  if (granted.length) {
    next = {
      ...next,
      chronicle: [...next.chronicle, ...granted.map((id, index) => {
        const feat = getFeat(id);
        return {
          id: `feat-${id}-${next.turn}-${index}`, age: next.age, turn: next.turn,
          title: feat?.name ?? 'A New Feat', text: feat?.flavor ?? 'The deed will be remembered.', tone: 'triumph' as const,
        };
      })],
    };
  }
  return { state: next, granted, labels };
}

export function resolveEventChoice(state: GameState, event: GameEvent, choice: EventChoice, rand: () => number): ChoiceResolution {
  if (!isChoiceAvailable(choice, state)) return { state, effectLabels: [], newFeatIds: [] };
  const labels: string[] = [];
  const newFeatIds: string[] = [];
  const payments = Object.fromEntries(Object.entries(choice.cost ?? {}).map(([key, value]) => [key, -value]));
  let next = applyEffects(state, { resources: payments }, labels, newFeatIds);
  next = applyEffects(next, choice.effects, labels, newFeatIds);
  let outcomeText: string | undefined;

  if (choice.effects.outcomes?.length) {
    const outcome: EventOutcome = resolveOutcome(choice.effects.outcomes, rand);
    outcomeText = outcome.text;
    next = applyEffects(next, outcome, labels, newFeatIds);
    if (outcome.combat && !next.gameOver) {
      const result = resolveCombat(getEffectiveArmy(next), outcome.combat, rand);
      next = applyEffects(next, { army: { numbers: -result.numbersLost } }, labels, newFeatIds);
      outcomeText = `${outcomeText} ${result.text}`;
      if (!result.victory && next.army.numbers <= 0) {
        next = applyEffects(next, { resources: { population: -1 } }, labels, newFeatIds);
      }
    }
  }

  next = { ...next, map: rebalanceWorkers(next.map, next.resources.population) };

  const chronicleText = interpolateText(
    choice.effects.chronicle ?? `${choice.text}.${outcomeText ? ` ${outcomeText}` : ''}`,
    next,
  );
  next = {
    ...next,
    currentEvent: null,
    phase: next.gameOver ? 'gameOver' : 'eventResult',
    stats: { ...next.stats, choicesMade: next.stats.choicesMade + 1 },
    chronicle: [...next.chronicle, {
      id: `${event.id}-${choice.id}-${next.turn}-${next.chronicle.length}`,
      age: next.age,
      turn: next.turn,
      title: event.title ?? 'A Turning Point',
      text: chronicleText,
      tone: next.gameOver ? 'loss' : outcomeText ? 'discovery' : 'neutral',
    }],
  };

  return { state: next, outcomeText, effectLabels: labels, newFeatIds };
}
