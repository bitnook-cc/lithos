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
import { EconomyPanel } from '@/ui/EconomyPanel';
import { ObjectivePanel } from '@/ui/ObjectivePanel';
import { DistrictActions } from '@/ui/DistrictActions';
import { MapControls } from '@/ui/MapControls';
import { TurnRecap } from '@/ui/TurnRecap';
import { Tile } from '@/types/map';
import { useGameStore } from '@/store/gameStore';
import { findCurrentEvent } from '@/logic/commandEngine';
import { getCultureProfile } from '@/logic/cultureEngine';

const PhaserGame = React.lazy(() => import('@/game/PhaserGame').then(module => ({ default: module.PhaserGame })));

export default function App() {
  const store = useGameStore();
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [showBuild, setShowBuild] = useState(false);
  const [showDiplomacy, setShowDiplomacy] = useState(false);
  const [showEconomy, setShowEconomy] = useState(false);
  const [activeTab, setActiveTab] = useState<'map' | 'civ' | 'research'>('map');
  const notice = store.runtime?.notices[0];
  const activeEvent = store.phase === 'event' && !notice ? findCurrentEvent(store) : null;
  const completedTech = notice?.type === 'tech' ? store.techs.find(t => t.id === notice.techId) : null;
  const dismiss = () => { if (notice) store.dispatch({ type: 'dismiss', noticeId: notice.id }); };
  const openEconomy = () => {
    if (store.tutorial?.enabled && !store.tutorial.foodInspected && store.phase === 'actions' && !notice) store.dispatch({ type: 'inspectFood' });
    setShowEconomy(true);
  };
  const selectDistrict = (tile: Tile) => {
    setSelectedTile(tile); setActiveTab('map');
    window.dispatchEvent(new CustomEvent('map-control', { detail: { action: 'focus', coord: tile.coord } }));
  };
  useEffect(() => {
    const handler = (event: Event) => setSelectedTile((event as CustomEvent).detail.tile);
    window.addEventListener('tile-selected', handler);
    return () => window.removeEventListener('tile-selected', handler);
  }, []);
  useEffect(() => {
    setSelectedTile(current => current ? store.map.find(tile => tile.coord.q === current.coord.q && tile.coord.r === current.coord.r) ?? null : null);
  }, [store.map]);
  useEffect(() => {
    setSelectedTile(null); setShowBuild(false); setShowDiplomacy(false); setShowEconomy(false); setActiveTab('map');
  }, [store.age, store.runtime?.runId]);

  if (store.phase === 'setup') return <><RunSetup onBegin={(perks, guided) => store.startRun(perks, undefined, guided)} /><SaveStatus />{store.commandError && <p className="command-error" role="alert">{store.commandError}</p>}</>;
  const selectedRival = selectedTile?.visible && selectedTile.rivalId ? store.rivals.find(r => r.id === selectedTile.rivalId) : undefined;
  const canDecide = store.phase === 'actions' && !notice;
  const culture = getCultureProfile(store.civ.identity);
  return <div className={`app-shell age-${store.age} culture-${culture.tone}`}>
    <SaveStatus />
    <div className="game-stage">
      <React.Suspense fallback={<div className="map-loading"><span>Drawing the known world…</span></div>}><PhaserGame /></React.Suspense>
      <div className="world-vignette" />
      <GameMenu />
      <HUD onOpenResearch={() => setActiveTab('research')} onOpenEconomy={openEconomy} />
      {activeTab === 'map' && <>
        <TileTooltip />
        <MapControls onSelect={selectDistrict} />
        <CultureBanner onOpen={() => setActiveTab('civ')} />
        <div className={`council-panel ${selectedTile ? 'has-district' : ''}`}>
          <TurnRecap />
          <ObjectivePanel onFood={openEconomy} onResearch={() => setActiveTab('research')} onDistrict={() => { const tile = store.map.find(t => t.coord.q === store.tutorial?.target?.q && t.coord.r === store.tutorial?.target?.r); if (tile) selectDistrict(tile); }} />
          {selectedTile?.visible && <TileInspector tile={selectedTile} onClose={() => setSelectedTile(null)}><DistrictActions tile={selectedTile} onBuild={() => setShowBuild(true)} onDiplomacy={() => setShowDiplomacy(true)} /></TileInspector>}
        </div>
        <div className="action-dock"><div className="turn-prompt"><span>{canDecide ? 'Your council awaits' : 'Resolve the current outcome'}</span><strong>{store.actionPoints} actions remain</strong></div><button className="action-button" onClick={openEconomy}>Food & workers</button><button className="action-button end-turn" disabled={!canDecide} onClick={() => store.dispatch({ type: 'endTurn' })}>End turn →</button></div>
      </>}
      {activeTab === 'civ' && <CivPanel />}
      {activeTab === 'research' && <TechTree key={store.age} onResearch={techId => { if (store.dispatch({ type: 'research', techId })) setActiveTab('map'); }} />}
      {store.commandError && <p className="command-error" role="alert">{store.commandError}</p>}
      {showEconomy && <EconomyPanel onClose={() => setShowEconomy(false)} />}
      {showBuild && selectedTile && <BuildMenu tile={selectedTile} onBuild={buildingId => { if (store.dispatch({ type: 'build', target: selectedTile.coord, buildingId })) setShowBuild(false); }} onClose={() => setShowBuild(false)} />}
      {showDiplomacy && selectedRival && <DiplomacyPanel rival={selectedRival} onChoose={approach => { if (store.dispatch({ type: 'diplomacy', rivalId: selectedRival.id, approach })) setShowDiplomacy(false); }} onClose={() => setShowDiplomacy(false)} />}
      {activeEvent && <EventCard event={activeEvent} onChoice={choice => store.dispatch({ type: 'choose', eventId: activeEvent.id, choiceId: choice.id })} />}
      {notice?.type === 'result' && <EffectSummary key={notice.id} data={{ choiceText: notice.title, outcomeText: notice.text, effects: notice.effects }} onDismiss={dismiss} />}
      {completedTech && <TechCompleted key={notice!.id} tech={completedTech} onDismiss={dismiss} />}
      {notice?.type === 'age' && <AgeIntro key={notice.id} age={notice.age} onContinue={dismiss} />}
      {notice?.type === 'feat' && <FeatUnlocked key={notice.id} featId={notice.featId} onDismiss={dismiss} />}
      {!notice && <GameOver />}
    </div>
    <nav className="tab-bar" aria-label="Game views">{(['map', 'civ', 'research'] as const).map(tab => <button key={tab} aria-current={activeTab === tab ? 'page' : undefined} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}><span>{tab === 'map' ? '⌾' : tab === 'civ' ? '♜' : '⌁'}</span>{tab === 'civ' ? 'Civilization' : tab}</button>)}</nav>
  </div>;
}
