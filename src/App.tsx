import React, { useEffect, useRef, useState } from 'react';
import { HUD } from '@/ui/HUD';
import { EventCard } from '@/ui/EventCard';
import { TechTree } from '@/ui/TechTree';
import { BuildMenu } from '@/ui/BuildMenu';
import { GameOver } from '@/ui/GameOver';
import { TileTooltip } from '@/ui/TileTooltip';
import { TileInspector } from '@/ui/TileInspector';
import { EffectSummary, EffectSummaryData } from '@/ui/EffectSummary';
import { CivPanel } from '@/ui/CivPanel';
import { GameMenu } from '@/ui/GameMenu';
import { TechCompleted } from '@/ui/TechCompleted';
import { RunSetup } from '@/ui/RunSetup';
import { AgeIntro } from '@/ui/AgeIntro';
import { FeatUnlocked } from '@/ui/FeatUnlocked';
import { DiplomacyPanel } from '@/ui/DiplomacyPanel';
import { AgeId, GameState, TechNode } from '@/types/game';
import { Tile } from '@/types/map';
import { EventChoice, GameEvent } from '@/types/events';
import { useGameStore } from '@/store/gameStore';
import { useMetaStore } from '@/store/metaStore';
import { extractOneShotEffects } from '@/logic/effectsEngine';
import { getAgeContent } from '@/data/content';
import { getAvailableEvents, pickRandomEvent } from '@/logic/eventEngine';
import { processCollectPhase, processSurveyAction, processExpandAction, processBuildAction, processInvestigateAction } from '@/logic/turnEngine';
import { processDiplomacyAction, processRivalTurn, DiplomacyApproach } from '@/logic/rivalEngine';
import { transitionAge } from '@/logic/ageEngine';
import { grantFeatsToRun, resolveEventChoice } from '@/logic/choiceEngine';
import { evaluateFeatUnlocks } from '@/data/legacy';
import { mulberry32 } from '@/logic/random';
import { canQueue } from '@/logic/techEngine';
import { getLandmarkEvent } from '@/data/events/landmarks';
import { getLandmark } from '@/data/mapFeatures';
import { getAvailablePopulation, getExplorationLevel } from '@/logic/populationEngine';

const PhaserGame = React.lazy(() => import('@/game/PhaserGame').then(module => ({ default: module.PhaserGame })));

export default function App() {
  const store = useGameStore();
  const meta = useMetaStore();
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [activeEvent, setActiveEvent] = useState<GameEvent | null>(null);
  const [showBuild, setShowBuild] = useState(false);
  const [showDiplomacy, setShowDiplomacy] = useState(false);
  const [effectSummary, setEffectSummary] = useState<EffectSummaryData | null>(null);
  const [summaryAdvancesPhase, setSummaryAdvancesPhase] = useState(false);
  const [completedTech, setCompletedTech] = useState<TechNode | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'civ' | 'research'>('map');
  const [ageIntro, setAgeIntro] = useState<AgeId | null>(null);
  const [featQueue, setFeatQueue] = useState<string[]>([]);
  const summaryOpenRef = useRef(false);
  const randRef = useRef(mulberry32(Date.now()));
  const rand = randRef.current;

  const unlockGlobally = (featIds: string[]) => {
    const newlyGlobal = useMetaStore.getState().unlockFeats(featIds);
    if (newlyGlobal.length) setFeatQueue(current => [...current, ...newlyGlobal.filter(id => !current.includes(id))]);
  };

  const applyConditionalFeats = (state: GameState): GameState => {
    const result = grantFeatsToRun(state, evaluateFeatUnlocks(state));
    unlockGlobally(result.granted);
    return result.state;
  };

  useEffect(() => {
    const handler = (event: Event) => setSelectedTile((event as CustomEvent).detail.tile);
    window.addEventListener('tile-selected', handler);
    return () => window.removeEventListener('tile-selected', handler);
  }, []);

  useEffect(() => {
    setSelectedTile(current => current ? store.map.find(tile => tile.coord.q === current.coord.q && tile.coord.r === current.coord.r && tile.coord.s === current.coord.s) ?? null : null);
  }, [store.map]);

  useEffect(() => {
    if (store.phase === 'setup' || store.phase === 'gameOver' || store.phase === 'ageTransition') return;
    if (store.phase === 'eventResult' || store.phase === 'enemyResult') {
      setTimeout(() => { if (!summaryOpenRef.current) useGameStore.getState().nextPhase(); }, 0);
      return;
    }

    if (store.phase === 'collect') {
      const updates = processCollectPhase(store);
      if (updates.completedTechEffects) {
        const oneShot = extractOneShotEffects(updates.completedTechEffects);
        const nextPhase: GameState['phase'] = oneShot.isAdvance ? 'ageTransition' : 'actions';
        store.setState({ ...updates, phase: updates.gameOver ? 'gameOver' : nextPhase });
        for (const tag of oneShot.addedCivTags) store.addCivTag(tag);
        for (const trait of oneShot.addedLeaderTraits) store.addLeaderTrait(trait);
        const current = useGameStore.getState();
        const tech = current.techs.find(item => item.id === updates.completedTechId);
        if (tech) {
          store.setState({ chronicle: [...current.chronicle, {
            id: `tech-${tech.id}-${current.age}-${current.turn}`, age: current.age, turn: current.turn,
            title: `Discovered: ${tech.name}`, text: tech.description, tone: 'discovery',
          }] });
          setCompletedTech(tech);
        }
        return;
      }
      store.setState(updates);
      if (!updates.gameOver) setTimeout(() => useGameStore.getState().nextPhase(), 0);
      return;
    }

    if (store.phase === 'event') {
      const content = getAgeContent(store.age);
      if (store.currentEvent) {
        setActiveEvent(content.events.find(event => event.id === store.currentEvent) ?? getLandmarkEvent(store.currentEvent));
        return;
      }
      const event = pickRandomEvent(getAvailableEvents(content.events, store), rand);
      if (!event) {
        setTimeout(() => useGameStore.getState().nextPhase(), 0);
        return;
      }
      setActiveEvent(event);
      store.setState({ currentEvent: event.id, eventOrigin: 'turn', firedEvents: [...store.firedEvents, event.id] });
      return;
    }

    if (store.phase === 'enemy') {
      const { report, ...updates } = processRivalTurn(store, rand);
      store.setState(updates);
      if (updates.gameOver) return;
      if (report) {
        summaryOpenRef.current = true;
        setEffectSummary({ choiceText: 'Beyond your borders', outcomeText: report, effects: [] });
        setSummaryAdvancesPhase(true);
        store.setState({ phase: 'enemyResult' });
      } else {
        setTimeout(() => useGameStore.getState().nextPhase(), 0);
      }
    }
  }, [store.phase, store.turn]);

  useEffect(() => {
    if (store.phase !== 'ageTransition' || completedTech) return;
    const advance = store.techs.find(tech => tech.researched && extractOneShotEffects(tech.effects).isAdvance);
    if (advance) setCompletedTech(advance);
  }, [store.phase, completedTech, store.techs]);

  useEffect(() => {
    if (!store.gameOver || store.runRecorded) return;
    let finalState = applyConditionalFeats(store);
    const ending = finalState.gameOver ?? store.gameOver;
    if (ending.victory && !finalState.featsEarned.includes('three_ages')) {
      const granted = grantFeatsToRun(finalState, ['three_ages']);
      finalState = granted.state;
      unlockGlobally(granted.granted);
    }
    useMetaStore.getState().recordRun({ age: finalState.age, turn: finalState.turn, victory: ending.victory, reason: ending.reason, featsEarned: finalState.featsEarned });
    store.setState({ ...finalState, runRecorded: true });
  }, [store.gameOver, store.runRecorded]);

  const handleSurvey = (tile: Tile) => {
    if (store.phase !== 'actions' || store.actionPoints <= 0) return;
    const updates = processSurveyAction(store, tile.coord);
    if (!updates.map) return;
    store.setState(updates);
    store.spendActionPoint();
    setSelectedTile(updates.map.find(item => item.coord.q === tile.coord.q && item.coord.r === tile.coord.r) ?? null);
  };

  const handleExpand = (tile: Tile) => {
    if (store.phase !== 'actions' || store.actionPoints <= 0) return;
    const updates = processExpandAction(store, tile.coord);
    if (!updates.map) return;
    store.setState(updates);
    store.spendActionPoint();
    setSelectedTile(updates.map.find(item => item.coord.q === tile.coord.q && item.coord.r === tile.coord.r) ?? null);
  };

  const handleInvestigate = (tile: Tile) => {
    if (store.phase !== 'actions' || store.actionPoints <= 0) return;
    const updates = processInvestigateAction(store, tile.coord);
    if (!updates.map || !updates.currentEvent) return;
    store.setState(updates);
    store.spendActionPoint();
    setSelectedTile(updates.map.find(item => item.coord.q === tile.coord.q && item.coord.r === tile.coord.r) ?? null);
  };

  const handleBuild = (buildingId: string) => {
    if (!selectedTile || store.phase !== 'actions' || store.actionPoints <= 0) return;
    const updates = processBuildAction(store, selectedTile.coord, buildingId);
    if (!updates.map) return;
    store.setState(updates);
    store.spendActionPoint();
    setShowBuild(false);
    setSelectedTile(null);
  };

  const handleResearch = (techId: string) => {
    if (!canQueue(techId, store.techs)) return;
    store.setState({ activeResearch: techId, researchProgress: store.activeResearch === techId ? store.researchProgress : 0 });
    setActiveTab('map');
  };

  const handleEventChoice = (choice: EventChoice) => {
    if (!activeEvent) return;
    const resolution = resolveEventChoice(useGameStore.getState(), activeEvent, choice, rand);
    unlockGlobally(resolution.newFeatIds);
    const next = applyConditionalFeats(resolution.state);
    summaryOpenRef.current = true;
    setEffectSummary({ choiceText: choice.text, outcomeText: resolution.outcomeText, effects: resolution.effectLabels });
    setSummaryAdvancesPhase(!next.gameOver);
    store.setState(next);
    setActiveEvent(null);
  };

  const handleDiplomacy = (approach: DiplomacyApproach) => {
    const rivalId = selectedTile?.rivalId;
    if (!rivalId || store.actionPoints <= 0) return;
    const result = processDiplomacyAction(store, rivalId, approach, rand);
    if (Object.keys(result.updates).length === 0) {
      summaryOpenRef.current = true;
      setEffectSummary({ choiceText: 'The envoy waits', outcomeText: result.text, effects: [] });
      setSummaryAdvancesPhase(false);
      return;
    }
    store.setState(result.updates);
    store.spendActionPoint();
    setShowDiplomacy(false);
    summaryOpenRef.current = true;
    setEffectSummary({ choiceText: 'Diplomacy', outcomeText: result.text, effects: ['-1 action point'] });
    setSummaryAdvancesPhase(false);
  };

  const dismissSummary = () => {
    summaryOpenRef.current = false;
    setEffectSummary(null);
    if (summaryAdvancesPhase && useGameStore.getState().phase !== 'gameOver') useGameStore.getState().nextPhase();
    setSummaryAdvancesPhase(false);
  };

  const dismissTech = () => {
    const tech = completedTech;
    setCompletedTech(null);
    if (!tech || !extractOneShotEffects(tech.effects).isAdvance) return;
    let next = transitionAge(useGameStore.getState(), Date.now());
    next = applyConditionalFeats(next);
    store.setState(next);
    if (next.phase !== 'gameOver') {
      setSelectedTile(null);
      setActiveTab('map');
      setAgeIntro(next.age);
    }
  };

  if (store.phase === 'setup') return <RunSetup onBegin={perks => { store.startRun(perks); setAgeIntro('stone'); }} />;

  const selectedRival = selectedTile?.visible && selectedTile.rivalId ? store.rivals.find(rival => rival.id === selectedTile.rivalId) : undefined;
  const canAct = store.phase === 'actions' && store.actionPoints > 0;
  const availablePopulation = getAvailablePopulation(store);
  const explorationLevel = getExplorationLevel(store);

  return <div className={`app-shell age-${store.age}`}>
    <div className="game-stage">
      <React.Suspense fallback={<div className="map-loading"><span>Drawing the known world…</span></div>}><PhaserGame /></React.Suspense>
      <div className="world-vignette" />
      <GameMenu />
      <HUD onOpenResearch={() => setActiveTab('research')} />
      <TileTooltip />
      {activeTab === 'map' && selectedTile?.visible && <TileInspector tile={selectedTile} onClose={() => setSelectedTile(null)} />}

      {activeTab === 'map' && <div className="action-dock">
        <div className="turn-prompt"><span>{canAct ? 'Your council awaits' : store.phase === 'event' ? 'A choice must be made' : 'The world is moving'}</span><strong>{store.actionPoints} actions remain</strong></div>
        {canAct && selectedTile && !selectedTile.surveyed && !selectedTile.rivalId && selectedTile.visible && <button className="action-button explore" onClick={() => handleSurvey(selectedTile)}>Survey frontier · range {explorationLevel}</button>}
        {canAct && selectedTile?.surveyed && !selectedTile.controlled && !selectedTile.rivalId && <button className="action-button expand" disabled={availablePopulation < 1} onClick={() => handleExpand(selectedTile)}>{availablePopulation > 0 ? 'Expand here · reserve 1 person' : 'Population fully assigned'}</button>}
        {canAct && selectedTile?.surveyed && selectedTile.landmark && !selectedTile.landmarkInvestigated && <button className="action-button investigate" onClick={() => handleInvestigate(selectedTile)}>Investigate {getLandmark(selectedTile.landmark)?.name}</button>}
        {canAct && selectedTile?.controlled && <button className="action-button build" onClick={() => setShowBuild(true)}>{selectedTile.building ? 'Improve district' : 'Build here'}</button>}
        {canAct && selectedRival && <button className="action-button diplomacy" onClick={() => setShowDiplomacy(true)}>Approach {selectedRival.name}</button>}
        {canAct && !store.activeResearch && <button className="action-button research-action" onClick={() => setActiveTab('research')}>Choose research</button>}
        {store.phase === 'actions' && <button className="action-button end-turn" onClick={() => store.nextPhase()}>End turn <span>→</span></button>}
      </div>}

      {activeTab === 'civ' && <CivPanel />}
      {activeTab === 'research' && <TechTree onResearch={handleResearch} />}

      {showBuild && selectedTile && <BuildMenu tile={selectedTile} onBuild={handleBuild} onClose={() => setShowBuild(false)} />}
      {showDiplomacy && selectedRival && <DiplomacyPanel rival={selectedRival} onChoose={handleDiplomacy} onClose={() => setShowDiplomacy(false)} />}
      {activeEvent && <EventCard event={activeEvent} onChoice={handleEventChoice} />}
      {effectSummary && <EffectSummary data={effectSummary} onDismiss={dismissSummary} />}
      {completedTech && <TechCompleted tech={completedTech} onDismiss={dismissTech} />}
      {ageIntro && <AgeIntro age={ageIntro} onContinue={() => setAgeIntro(null)} />}
      {featQueue[0] && <FeatUnlocked featId={featQueue[0]} onDismiss={() => setFeatQueue(queue => queue.slice(1))} />}
      <GameOver />
    </div>

    <nav className="tab-bar">
      {(['map', 'civ', 'research'] as const).map(tab => <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}><span>{tab === 'map' ? '⌾' : tab === 'civ' ? '♜' : '⌁'}</span>{tab === 'civ' ? 'Civilization' : tab[0].toUpperCase() + tab.slice(1)}</button>)}
    </nav>
  </div>;
}
