import { GameState, ArmyStats } from '@/types/game';
import { EventTrigger, EventChoice, GameEvent, EventOutcome } from '@/types/events';
import { TileType } from '@/types/map';
import { getEffectiveArmy } from './effectsEngine';

export function evaluateTriggers(triggers: EventTrigger, state: GameState): boolean {
  if (triggers.age && triggers.age !== state.age) return false;
  if (triggers.minTurn && state.turn < triggers.minTurn) return false;
  if (triggers.maxTurn && state.turn > triggers.maxTurn) return false;

  if (triggers.flags) {
    for (const [key, val] of Object.entries(triggers.flags)) {
      if (state.flags[key] !== val) return false;
    }
  }

  if (triggers.identity) {
    for (const [axis, range] of Object.entries(triggers.identity)) {
      const val = state.civ.identity[axis as keyof typeof state.civ.identity];
      if (range.min !== undefined && val < range.min) return false;
      if (range.max !== undefined && val > range.max) return false;
    }
  }

  if (triggers.leaderTraits) {
    const currentLeader = state.civ.leaders[state.civ.leaders.length - 1];
    if (!currentLeader) return false;
    if (!triggers.leaderTraits.every(t => currentLeader.traits.includes(t))) return false;
  }

  if (triggers.civTags) {
    if (!triggers.civTags.every(t => state.civ.tags.includes(t))) return false;
  }

  if (triggers.activePerks && !triggers.activePerks.every(perk => state.activePerks.includes(perk))) return false;

  if (triggers.tileRevealed) {
    const visibleTypes = new Set(state.map.filter(t => t.visible).map(t => t.type));
    if (!triggers.tileRevealed.some(tt => visibleTypes.has(tt))) return false;
  }

  return true;
}

export function isChoiceAvailable(choice: EventChoice, state: GameState): boolean {
  const req = choice.requires;

  if (req.identity) {
    for (const [axis, minVal] of Object.entries(req.identity)) {
      if (state.civ.identity[axis as keyof typeof state.civ.identity] < minVal) return false;
    }
  }

  if (req.leaderTraits) {
    const currentLeader = state.civ.leaders[state.civ.leaders.length - 1];
    if (!currentLeader || !req.leaderTraits.every(t => currentLeader.traits.includes(t))) return false;
  }

  if (req.civTags) {
    if (!req.civTags.every(t => state.civ.tags.includes(t))) return false;
  }

  if (req.activePerks && !req.activePerks.every(perk => state.activePerks.includes(perk))) return false;

  if (req.armyStats) {
    const effectiveArmy = getEffectiveArmy(state);
    for (const [stat, minVal] of Object.entries(req.armyStats)) {
      if (effectiveArmy[stat as keyof ArmyStats] < minVal) return false;
    }
  }

  return true;
}

export function getAvailableEvents(allEvents: GameEvent[], state: GameState): GameEvent[] {
  return allEvents.filter(event => {
    // Skip non-repeatable events that have already fired
    if (!event.repeatable && state.firedEvents.includes(event.id)) return false;
    return evaluateTriggers(event.triggers, state);
  });
}

export function pickRandomEvent(events: GameEvent[], rand: () => number): GameEvent | null {
  if (events.length === 0) return null;
  const totalWeight = events.reduce((total, event) => total + (event.weight ?? 1), 0);
  let roll = rand() * totalWeight;
  for (const event of events) {
    roll -= event.weight ?? 1;
    if (roll <= 0) return event;
  }
  return events[events.length - 1] ?? null;
}

export function resolveOutcome(outcomes: EventOutcome[], rand: () => number): EventOutcome {
  const total = outcomes.reduce((s, o) => s + o.weight, 0);
  let roll = rand() * total;
  for (const outcome of outcomes) {
    roll -= outcome.weight;
    if (roll <= 0) return outcome;
  }
  return outcomes[outcomes.length - 1];
}

export function interpolateText(text: string, state: GameState): string {
  const leader = state.civ.leaders[state.civ.leaders.length - 1];
  return text
    .replace(/\{leaderName\}/g, leader?.name ?? 'Your leader')
    .replace(/\{civTag\}/g, state.civ.tags[state.civ.tags.length - 1] ?? '');
}
