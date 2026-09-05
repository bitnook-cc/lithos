import { GameState, RunNotice, RunRuntime } from '@/types/game';
import { HexCoord } from '@/types/map';
import { createNewRun } from './runEngine';
import { randomStream } from './random';
import { processBuildAction, processCollectPhase, processExpandAction, processInvestigateAction, processSurveyAction } from './turnEngine';
import { DiplomacyApproach, processDiplomacyAction, processRivalTurn } from './rivalEngine';
import { transitionAge } from './ageEngine';
import { getAvailableEvents, isChoiceAvailable, pickRandomEvent } from './eventEngine';
import { grantFeatsToRun, resolveEventChoice } from './choiceEngine';
import { evaluateFeatUnlocks, MAX_ACTIVE_PERKS, getPerk } from '@/data/legacy';
import { getAgeContent } from '@/data/content';
import { getLandmarkEvent } from '@/data/events/landmarks';
import { canQueue } from './techEngine';
import { extractOneShotEffects } from './effectsEngine';
import { rebalanceWorkers } from './populationEngine';
import { getDevelopment } from './developmentEngine';

export type GameCommand =
  | { type: 'start'; seed: number; perks: string[] }
  | { type: 'resume' }
  | { type: 'survey' | 'expand' | 'investigate'; target: HexCoord }
  | { type: 'build'; target: HexCoord; buildingId: string }
  | { type: 'research'; techId: string }
  | { type: 'prioritize'; target: HexCoord }
  | { type: 'diplomacy'; rivalId: string; approach: DiplomacyApproach }
  | { type: 'endTurn' }
  | { type: 'choose'; eventId: string; choiceId: string }
  | { type: 'dismiss'; noticeId: string };

export interface CommandResult { state: GameState; accepted: boolean; error?: string; }
type NoticeInput = RunNotice extends infer N ? N extends RunNotice ? Omit<N, 'id'> : never : never;

export function normalizeRuntime(state: GameState): RunRuntime {
  return state.runtime ?? { runId: `migrated-${state.age}-${state.turn}-${state.map.length}`, randomState: (state.turn * 7919 + state.map.length) >>> 0, commandSequence: 0, noticeSequence: 0, notices: [] };
}

export function findCurrentEvent(state: GameState) {
  return getAgeContent(state.age).events.find(event => event.id === state.currentEvent) ?? getLandmarkEvent(state.currentEvent);
}

/** Every completed action crosses this invariant boundary, including diplomacy and rewards. */
export function enforceDefeat(state: GameState): GameState {
  if (state.phase === 'setup') return state;
  const gameOver = state.gameOver ?? (state.resources.population <= 0 ? { reason: 'Your people have perished.', victory: false } : null);
  return { ...state, map: rebalanceWorkers(state.map, state.resources.population), ...(gameOver ? { gameOver, phase: 'gameOver' as const, currentEvent: null, eventOrigin: null } : {}) };
}

/** Atomic, deterministic application boundary. Rejected commands preserve the original state and RNG. */
export function dispatchCommand(input: GameState, command: GameCommand, unlockedPerks: string[] = []): CommandResult {
  const reject = (error: string): CommandResult => ({ state: input, accepted: false, error });
  let state = { ...enforceDefeat(input), runtime: { ...normalizeRuntime(input), notices: [...normalizeRuntime(input).notices] } };
  let random = randomStream(state.runtime.randomState);
  const notice = (value: NoticeInput) => {
    const runtime = state.runtime;
    runtime.noticeSequence += 1;
    runtime.notices.push({ ...value, id: `${runtime.runId}-${runtime.noticeSequence}` } as RunNotice);
  };
  const replace = (next: GameState) => { state = { ...next, runtime: state.runtime }; };
  const nextTurn = () => { state = { ...state, phase: 'collect', turn: state.turn + 1, actionPoints: state.maxActionPoints, eventOrigin: null }; };
  const finalize = () => {
    replace(enforceDefeat(state));
    const before = new Set(input.featsEarned);
    replace(grantFeatsToRun(state, evaluateFeatUnlocks(state)).state);
    for (const featId of state.featsEarned) if (!before.has(featId) && !state.runtime.notices.some(n => n.type === 'feat' && n.featId === featId)) notice({ type: 'feat', featId });
    replace(enforceDefeat(state));
  };
  // Resolve automatic phases synchronously, stopping at a decision or persisted presentation.
  const settle = () => {
    for (let step = 0; step < 12 && !state.runtime.notices.length && !state.gameOver; step++) {
      if (state.phase === 'collect') {
        const { completedTechEffects, completedTechId, ...updates } = processCollectPhase(state);
        replace(enforceDefeat({ ...state, ...updates }));
        if (state.gameOver) break;
        state.phase = 'actions';
        if (completedTechEffects && completedTechId) {
          const once = extractOneShotEffects(completedTechEffects);
          state.civ = { ...state.civ, tags: [...new Set([...state.civ.tags, ...once.addedCivTags])], leaders: state.civ.leaders.map((leader, i, all) => i === all.length - 1 ? { ...leader, traits: [...new Set([...leader.traits, ...once.addedLeaderTraits])] } : leader) };
          if (once.isAdvance) state.phase = 'ageTransition';
          const tech = state.techs.find(t => t.id === completedTechId)!;
          state.chronicle = [...state.chronicle, { id: `tech-${tech.id}-${state.age}-${state.turn}`, age: state.age, turn: state.turn, title: `Discovered: ${tech.name}`, text: tech.description, tone: 'discovery' }];
          notice({ type: 'tech', techId: completedTechId });
        }
      } else if (state.phase === 'event') {
        if (state.currentEvent) break;
        const event = pickRandomEvent(getAvailableEvents(getAgeContent(state.age).events, state), random.next);
        if (event) {
          state.currentEvent = event.id;
          state.eventOrigin = 'turn';
          state.firedEvents = [...state.firedEvents, event.id];
          break;
        }
        state.phase = 'enemy';
      } else if (state.phase === 'eventResult') {
        state.phase = state.eventOrigin === 'discovery' ? 'actions' : 'enemy';
        state.eventOrigin = null;
      } else if (state.phase === 'enemy') {
        const { report, ...updates } = processRivalTurn(state, random.next);
        replace(enforceDefeat({ ...state, ...updates }));
        if (report) notice({ type: 'result', title: 'Beyond your borders', text: report, effects: [] });
        if (!state.gameOver) state.phase = 'enemyResult';
      } else if (state.phase === 'enemyResult') nextTurn();
      else if (state.phase === 'ageTransition') {
        const advance = state.techs.find(t => t.researched && t.effects.some(e => e.type === 'advance_age'));
        if (!advance) throw new Error('Age transition requires a completed discovery.');
        notice({ type: 'tech', techId: advance.id });
      } else break;
    }
    finalize();
  };

  if (command.type === 'start') {
    if (state.phase !== 'setup') return reject('Finish or restart this lineage first.');
    if (!Number.isSafeInteger(command.seed) || new Set(command.perks).size !== command.perks.length || command.perks.length > MAX_ACTIVE_PERKS || command.perks.some(id => !getPerk(id) || !unlockedPerks.includes(id))) return reject('Choose only unlocked ancestral memories, up to two.');
    const run = createNewRun(command.perks, command.seed);
    state = { ...run, runtime: run.runtime! };
    random = randomStream(state.runtime.randomState);
    notice({ type: 'age', age: 'stone' });
  } else if (command.type === 'resume') {
    // Also resumes old saves that stopped between automatic phases.
  } else if (command.type === 'dismiss') {
    const first = state.runtime.notices[0];
    if (!first || first.id !== command.noticeId) return reject('That message has already been acknowledged.');
    state.runtime.notices.shift();
    if (first.type === 'tech' && state.phase === 'ageTransition' && !state.gameOver) {
      replace(transitionAge(state, Math.floor(random.next() * 0x100000000)));
      if (!state.gameOver) notice({ type: 'age', age: state.age });
    }
  } else {
    if (state.gameOver || state.resources.population <= 0) return reject('This lineage has ended.');
    if (state.runtime.notices.length) return reject('Acknowledge the current outcome first.');
    if (command.type === 'choose') {
      const event = findCurrentEvent(state);
      if (state.phase !== 'event' || !event || event.id !== command.eventId) return reject('That event is no longer active.');
      const choice = event.choices.find(c => c.id === command.choiceId);
      if (!choice || !isChoiceAvailable(choice, state)) return reject('The requirements or payment for that choice are not met.');
      const result = resolveEventChoice(state, event, choice, random.next);
      replace(result.state);
      notice({ type: 'result', title: choice.text, text: result.outcomeText, effects: result.effectLabels });
    } else {
      if (state.phase !== 'actions') return reject('Wait for your action phase.');
      if (command.type === 'endTurn') state.phase = 'event';
      else if (command.type === 'research') {
        if (!canQueue(command.techId, state.techs)) return reject('This discovery is unavailable.');
        const development = getDevelopment(state);
        if (state.activeResearch) development.projects[state.activeResearch] = { progress: state.researchProgress, ticks: development.projects[state.activeResearch]?.ticks ?? 0 };
        state.researchProgress = development.projects[command.techId]?.progress ?? 0;
        state.development = development;
        state.activeResearch = command.techId;
      } else {
        if (state.actionPoints < 1) return reject('No action points remain.');
        let updates: Partial<GameState>;
        if (command.type === 'diplomacy') {
          if (!state.rivals.some(r => r.id === command.rivalId) || !state.map.some(t => t.visible && t.rivalId === command.rivalId)) return reject('Discover that civilization before approaching it.');
          if (!['trade', 'envoy', 'threaten'].includes(command.approach)) return reject('Unknown diplomatic approach.');
          const result = processDiplomacyAction(state, command.rivalId, command.approach, random.next);
          updates = result.updates;
          if (!Object.keys(updates).length) return reject(result.text);
          notice({ type: 'result', title: 'Diplomacy', text: result.text, effects: ['-1 action point'] });
        } else {
          const { q, r, s } = command.target;
          if (![q, r, s].every(Number.isInteger) || q + r + s !== 0) return reject('Invalid district.');
          if (command.type === 'prioritize') {
            const tile = state.map.find(t => t.coord.q === q && t.coord.r === r && t.coord.s === s);
            if (!tile?.controlled || !tile.visible || (q === 0 && r === 0)) return reject('Choose one of your outlying districts to prioritize.');
            const priority = Math.max(0, ...state.map.map(t => t.workPriority ?? 0)) + 1;
            updates = { map: rebalanceWorkers(state.map.map(t => t === tile ? { ...t, workPriority: priority } : t), state.resources.population) };
          } else updates = command.type === 'survey' ? processSurveyAction(state, command.target)
            : command.type === 'expand' ? processExpandAction(state, command.target)
            : command.type === 'build' ? processBuildAction(state, command.target, command.buildingId)
            : processInvestigateAction(state, command.target);
          if (!updates.map) return reject('This action needs a valid connected district, available workers, an unlocked building, and enough resources.');
        }
        replace({ ...state, ...updates, actionPoints: state.actionPoints - 1 });
      }
    }
  }
  settle();
  state.runtime.randomState = random.state();
  state.runtime.commandSequence += command.type === 'resume' ? 0 : 1;
  return { state, accepted: true };
}
