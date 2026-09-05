import React, { useEffect, useState } from 'react';
import { HUD } from '@/ui/HUD';
import { EventCard } from '@/ui/EventCard';
import { TechTree } from '@/ui/TechTree';
import { BuildMenu } from '@/ui/BuildMenu';
import { GameOver } from '@/ui/GameOver';
import { TileTooltip } from '@/ui/TileTooltip';
import { TileInspector } from '@/ui/TileInspector';
import { EffectSummary } from '@/ui/EffectSummary';
import { CivPanel } from '@/ui/CivPanel';
import { GameMenu } from '@/ui/GameMenu';
import { TechCompleted } from '@/ui/TechCompleted';
import { RunSetup } from '@/ui/RunSetup';
import { AgeIntro } from '@/ui/AgeIntro';
import { FeatUnlocked } from '@/ui/FeatUnlocked';
import { DiplomacyPanel } from '@/ui/DiplomacyPanel';
import { CultureBanner } from '@/ui/CultureBanner';
import { SaveStatus } from '@/ui/SaveStatus';
import { Tile } from '@/types/map';
import { useGameStore } from '@/store/gameStore';
import { findCurrentEvent } from '@/logic/commandEngine';
import { getLandmark } from '@/data/mapFeatures';
import { getAvailablePopulation, getExplorationLevel } from '@/logic/populationEngine';
import { getCultureProfile } from '@/logic/cultureEngine';

const PhaserGame = React.lazy(() => import('@/game/PhaserGame').then(module => ({ default: module.PhaserGame })));

export default function App() {
  const store = useGameStore();
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [showBuild, setShowBuild] = useState(false);
  const [showDiplomacy, setShowDiplomacy] = useState(false);
  const [activeTab, setActiveTab] = useState<'map' | 'civ' | 'research'>('map');
  const notice = store.runtime?.notices[0];
  const activeEvent = store.phase === 'event' && !notice ? findCurrentEvent(store) : null;
  const completedTech = notice?.type === 'tech' ? store.techs.find(t => t.id === notice.techId) : null;
  const dismiss = () => { if (notice) store.dispatch({ type: 'dismiss', noticeId: notice.id }); };

  useEffect(() => {
    const handler = (event: Event) => setSelectedTile((event as CustomEvent).detail.tile);
    window.addEventListener('tile-selected', handler);
    return () => window.removeEventListener('tile-selected', handler);
  }, []);
  useEffect(() => {
    setSelectedTile(current => current ? store.map.find(tile => tile.coord.q === current.coord.q && tile.coord.r === current.coord.r && tile.coord.s === current.coord.s) ?? null : null);
  }, [store.map]);
  useEffect(() => {
    setSelectedTile(null); setShowBuild(false); setShowDiplomacy(false); setActiveTab('map');
  }, [store.age, store.runtime?.runId]);

  if (store.phase === 'setup') return <><RunSetup onBegin={store.startRun} /><SaveStatus />{store.commandError && <p className="command-error" role="alert">{store.commandError}</p>}</>;
  const selectedRival = selectedTile?.visible && selectedTile.rivalId ? store.rivals.find(rival => rival.id === selectedTile.rivalId) : undefined;
  const canAct = store.phase === 'actions' && store.actionPoints > 0 && !notice;
  const availablePopulation = getAvailablePopulation(store);
  const explorationLevel = getExplorationLevel(store);
  const cultureProfile = getCultureProfile(store.civ.identity);

  return <div className={`app-shell age-${store.age} culture-${cultureProfile.tone}`}>
    <SaveStatus />
    <div className="game-stage">
      <React.Suspense fallback={<div className="map-loading"><span>Drawing the known world…</span></div>}><PhaserGame /></React.Suspense>
      <div className="world-vignette" />
      <GameMenu />
      <HUD onOpenResearch={() => setActiveTab('research')} />
      <TileTooltip />
      {activeTab === 'map' && !selectedTile && <CultureBanner onOpen={() => setActiveTab('civ')} />}
      {activeTab === 'map' && selectedTile?.visible && <TileInspector tile={selectedTile} onClose={() => setSelectedTile(null)} />}
      {store.commandError && <p className="command-error" role="alert">{store.commandError}</p>}
      {activeTab === 'map' && <div className="action-dock">
        <div className="turn-prompt"><span>{canAct ? 'Your council awaits' : store.phase === 'event' ? 'A choice must be made' : 'The world is moving'}</span><strong>{store.actionPoints} actions remain</strong></div>
        {canAct && selectedTile && !selectedTile.surveyed && !selectedTile.rivalId && selectedTile.visible && <button className="action-button explore" onClick={() => store.dispatch({ type: 'survey', target: selectedTile.coord })}>Survey frontier · range {explorationLevel}</button>}
        {canAct && selectedTile?.surveyed && !selectedTile.controlled && !selectedTile.rivalId && <button className="action-button expand" disabled={availablePopulation < 1} onClick={() => store.dispatch({ type: 'expand', target: selectedTile.coord })}>{availablePopulation > 0 ? 'Expand here · reserve 1 person' : 'Population fully assigned'}</button>}
        {canAct && selectedTile?.visible && selectedTile.surveyed && !selectedTile.rivalId && selectedTile.landmark && !selectedTile.landmarkInvestigated && <button className="action-button investigate" onClick={() => store.dispatch({ type: 'investigate', target: selectedTile.coord })}>Investigate {getLandmark(selectedTile.landmark)?.name}</button>}
        {canAct && selectedTile?.controlled && <button className="action-button build" onClick={() => setShowBuild(true)}>{selectedTile.building ? 'Improve district' : 'Build here'}</button>}
        {canAct && selectedRival && <button className="action-button diplomacy" onClick={() => setShowDiplomacy(true)}>Approach {selectedRival.name}</button>}
        {canAct && !store.activeResearch && <button className="action-button research-action" onClick={() => setActiveTab('research')}>Choose research</button>}
        {store.phase === 'actions' && !notice && <button className="action-button end-turn" onClick={() => store.dispatch({ type: 'endTurn' })}>End turn <span>→</span></button>}
      </div>}
      {activeTab === 'civ' && <CivPanel />}
      {activeTab === 'research' && <TechTree onResearch={techId => { if (store.dispatch({ type: 'research', techId })) setActiveTab('map'); }} />}
      {showBuild && selectedTile && <BuildMenu tile={selectedTile} onBuild={buildingId => {
        if (store.dispatch({ type: 'build', target: selectedTile.coord, buildingId })) { setShowBuild(false); setSelectedTile(null); }
      }} onClose={() => setShowBuild(false)} />}
      {showDiplomacy && selectedRival && <DiplomacyPanel rival={selectedRival} onChoose={approach => {
        if (store.dispatch({ type: 'diplomacy', rivalId: selectedRival.id, approach })) setShowDiplomacy(false);
      }} onClose={() => setShowDiplomacy(false)} />}
      {activeEvent && <EventCard event={activeEvent} onChoice={choice => store.dispatch({ type: 'choose', eventId: activeEvent.id, choiceId: choice.id })} />}
      {notice?.type === 'result' && <EffectSummary data={{ choiceText: notice.title, outcomeText: notice.text, effects: notice.effects }} onDismiss={dismiss} />}
      {completedTech && <TechCompleted tech={completedTech} onDismiss={dismiss} />}
      {notice?.type === 'age' && <AgeIntro age={notice.age} onContinue={dismiss} />}
      {notice?.type === 'feat' && <FeatUnlocked featId={notice.featId} onDismiss={dismiss} />}
      {!notice && <GameOver />}
    </div>
    <nav className="tab-bar">
      {(['map', 'civ', 'research'] as const).map(tab => <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}><span>{tab === 'map' ? '⌾' : tab === 'civ' ? '♜' : '⌁'}</span>{tab === 'civ' ? 'Civilization' : tab[0].toUpperCase() + tab.slice(1)}</button>)}
    </nav>
  </div>;
}
