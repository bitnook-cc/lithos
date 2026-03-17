import React, { useEffect, useState, useCallback } from 'react';
import { PhaserGame } from '@/game/PhaserGame';
import { HUD } from '@/ui/HUD';
import { EventCard } from '@/ui/EventCard';
import { TechTree } from '@/ui/TechTree';
// ArmyPanel is now part of CivPanel
import { BuildMenu } from '@/ui/BuildMenu';
import { GameOver } from '@/ui/GameOver';
import { TileTooltip } from '@/ui/TileTooltip';
import { EffectSummary, EffectSummaryData } from '@/ui/EffectSummary';
import { CivPanel } from '@/ui/CivPanel';
import { useGameStore } from '@/store/gameStore';
import { Tile } from '@/types/map';
import { GameEvent, EventChoice } from '@/types/events';
import { STONE_AGE_EVENTS } from '@/data/events/stoneAge';
import { stoneAgeTechs } from '@/data/techs/stoneAge';
import { getAvailableEvents, pickRandomEvent, resolveOutcome } from '@/logic/eventEngine';
import { processCollectPhase, processExploreAction, processBuildAction } from '@/logic/turnEngine';
// researchTech is now called internally by turnEngine during collect phase
import { resolveCombat } from '@/logic/combatEngine';
import { processRivalTurn } from '@/logic/rivalEngine';
import { transitionAge } from '@/logic/ageEngine';
import { generateMap } from '@/logic/mapGenerator';
import { createRival } from '@/logic/rivalEngine';

function mulberry32(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Build human-readable strings for event choice effects */
function buildEffectStrings(choice: EventChoice, outcomeText?: string): string[] {
  const effects: string[] = [];
  const eff = choice.effects;

  if (eff.resources) {
    for (const [key, val] of Object.entries(eff.resources)) {
      if (val && val !== 0) {
        effects.push(`${val > 0 ? '+' : ''}${val} ${key}`);
      }
    }
  }

  if (eff.identity) {
    for (const [axis, val] of Object.entries(eff.identity)) {
      if (val && val !== 0) {
        const label = axis.charAt(0).toUpperCase() + axis.slice(1);
        effects.push(`${label} ${val > 0 ? '+' : ''}${val}`);
      }
    }
  }

  if (eff.army) {
    for (const [stat, val] of Object.entries(eff.army)) {
      if (val && val !== 0) {
        const label = stat.charAt(0).toUpperCase() + stat.slice(1);
        effects.push(`${label} ${val > 0 ? '+' : ''}${val}`);
      }
    }
  }

  if (eff.addCivTag) {
    effects.push(`New tag: ${eff.addCivTag}`);
  }

  if (eff.addLeaderTrait) {
    effects.push(`New trait: ${eff.addLeaderTrait}`);
  }

  return effects;
}

export default function App() {
  const store = useGameStore();
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [activeEvent, setActiveEvent] = useState<GameEvent | null>(null);
  const [showBuild, setShowBuild] = useState(false);
  const [effectSummary, setEffectSummary] = useState<EffectSummaryData | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'civ' | 'research'>('map');
  const randRef = React.useRef(mulberry32(Date.now()));
  const rand = randRef.current;

  // Initialize game on first mount
  useEffect(() => {
    if (store.map.length === 0) {
      const seed = Date.now();
      const map = generateMap({ targetTiles: 15, seed });
      const techs = stoneAgeTechs();
      // Place a rival
      const farTile = map.find(t => !t.controlled && !t.visible && t.type !== 'water');
      const rivals = farTile ? [createRival('stone', farTile.coord, mulberry32(seed + 1))] : [];
      if (farTile && rivals[0]) {
        const rivalTile = map.find(t =>
          t.coord.q === farTile.coord.q && t.coord.r === farTile.coord.r
        );
        if (rivalTile) rivalTile.rivalId = rivals[0].id;
      }
      store.setState({ map, techs, rivals });
      store.addLeader({ name: 'Kara', traits: ['Bold'] });
    }
  }, []);

  // Listen for tile selection from Phaser
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setSelectedTile(detail.tile);
    };
    window.addEventListener('tile-selected', handler);
    return () => window.removeEventListener('tile-selected', handler);
  }, []);

  // Process phases
  useEffect(() => {
    if (store.phase === 'collect') {
      const updates = processCollectPhase(store);
      store.setState(updates);
      // Handle completed tech effects
      if (updates.completedTechEffects) {
        const effects = updates.completedTechEffects;
        if (effects.armyBonuses) store.updateArmy(effects.armyBonuses);
        if (effects.addsCivTag) store.addCivTag(effects.addsCivTag);
        if (effects.addsLeaderTrait) store.addLeaderTrait(effects.addsLeaderTrait);
        if (effects.isAdvance) {
          const newState = transitionAge(store, Date.now());
          store.setState(newState);
          return; // age transition handles phase
        }
      }
      if (!updates.gameOver) store.nextPhase(); // -> actions
    } else if (store.phase === 'event') {
      const available = getAvailableEvents(STONE_AGE_EVENTS, store);
      const event = pickRandomEvent(available, rand);
      if (event) {
        setActiveEvent(event);
        store.setState({ currentEvent: event.id });
      } else {
        store.nextPhase(); // skip to enemy
      }
    } else if (store.phase === 'enemy') {
      const result = processRivalTurn(store, rand);
      store.setState(result);
      store.nextPhase(); // -> collect (new turn)
    }
  }, [store.phase, store.turn]);

  const handleExplore = useCallback((tile: Tile) => {
    if (store.phase !== 'actions' || store.actionPoints <= 0) return;
    const updates = processExploreAction(store, tile.coord);
    store.setState(updates);
    store.spendActionPoint();
    // Update selectedTile from new map state so UI reflects the change
    const newMap = updates.map ?? store.map;
    const updatedTile = newMap.find(t =>
      t.coord.q === tile.coord.q && t.coord.r === tile.coord.r && t.coord.s === tile.coord.s
    );
    setSelectedTile(updatedTile ?? null);
  }, [store.phase, store.actionPoints]);

  const handleBuild = useCallback((buildingId: string) => {
    if (!selectedTile || store.phase !== 'actions' || store.actionPoints <= 0) return;
    const updates = processBuildAction(store, selectedTile.coord, buildingId);
    store.setState(updates);
    store.spendActionPoint();
    setShowBuild(false);
    setSelectedTile(null);
  }, [selectedTile, store.phase, store.actionPoints]);

  const handleResearch = useCallback((techId: string) => {
    // Queue this tech for research — no AP cost, progress accumulates per turn
    store.setState({ activeResearch: techId, researchProgress: 0 });
  }, []);

  const handleEventChoice = useCallback((choice: EventChoice) => {
    // Apply effects
    if (choice.effects.resources) store.updateResources(choice.effects.resources);
    if (choice.effects.identity) store.updateIdentity(choice.effects.identity);
    if (choice.effects.army) store.updateArmy(choice.effects.army);
    if (choice.effects.flags) {
      for (const [k, v] of Object.entries(choice.effects.flags)) store.setFlag(k, v);
    }
    if (choice.effects.addCivTag) store.addCivTag(choice.effects.addCivTag);
    if (choice.effects.addLeaderTrait) store.addLeaderTrait(choice.effects.addLeaderTrait);

    let outcomeText: string | undefined;
    if (choice.effects.outcomes) {
      const outcome = resolveOutcome(choice.effects.outcomes, rand);
      outcomeText = outcome.text;
      if (outcome.flags) {
        for (const [k, v] of Object.entries(outcome.flags)) store.setFlag(k, v);
      }
      if (outcome.combat) {
        const combatResult = resolveCombat(store.army, outcome.combat, rand);
        if (combatResult.numbersLost > 0) {
          store.updateArmy({ numbers: -combatResult.numbersLost });
        }
      }
    }

    // Build effect summary and show it instead of immediately advancing
    const effects = buildEffectStrings(choice, outcomeText);
    setEffectSummary({
      choiceText: choice.text,
      outcomeText,
      effects,
    });
    setActiveEvent(null);
    store.setState({ currentEvent: null });
  }, []);

  const handleDismissEffectSummary = useCallback(() => {
    setEffectSummary(null);
    store.nextPhase(); // -> enemy
  }, []);

  const handleEndTurn = useCallback(() => {
    if (store.phase === 'actions') {
      store.nextPhase(); // -> event
    }
  }, [store.phase]);

  const tabStyle = (tab: string): React.CSSProperties => ({
    flex: 1, padding: '10px 0', border: 'none',
    background: activeTab === tab ? '#2a2a4a' : 'transparent',
    color: activeTab === tab ? '#fff' : '#888',
    fontSize: 12, cursor: 'pointer', textTransform: 'uppercase',
    letterSpacing: 1, borderTop: activeTab === tab ? '2px solid #6a6aff' : '2px solid transparent',
  });

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <PhaserGame />
        <HUD />
        <TileTooltip />

        {/* Map tab content */}
        {activeTab === 'map' && (
          <>
            {/* Action buttons */}
            {store.phase === 'actions' && (
              <div style={{
                position: 'absolute', bottom: 8, right: 8, zIndex: 10,
                display: 'flex', gap: 6,
              }}>
                {selectedTile && !selectedTile.controlled && selectedTile.visible && (
                  <button
                    style={{ padding: '8px 14px', borderRadius: 6, border: 'none', background: '#4a8a4a', color: '#fff', cursor: 'pointer', fontSize: 12 }}
                    onClick={() => handleExplore(selectedTile)}
                  >
                    Explore
                  </button>
                )}
                {selectedTile && selectedTile.controlled && !selectedTile.building && (
                  <button
                    style={{ padding: '8px 14px', borderRadius: 6, border: 'none', background: '#4a4a8a', color: '#fff', cursor: 'pointer', fontSize: 12 }}
                    onClick={() => setShowBuild(true)}
                  >
                    Build
                  </button>
                )}
                <button
                  style={{ padding: '8px 14px', borderRadius: 6, border: 'none', background: '#8a4a4a', color: '#fff', cursor: 'pointer', fontSize: 12 }}
                  onClick={handleEndTurn}
                >
                  End Turn
                </button>
              </div>
            )}
          </>
        )}

        {/* Civ tab content */}
        {activeTab === 'civ' && <CivPanel />}

        {/* Research tab content */}
        {activeTab === 'research' && (
          <TechTree onResearch={(techId) => { handleResearch(techId); }} />
        )}

        {/* Overlays (always available) */}
        {showBuild && selectedTile && (
          <BuildMenu tile={selectedTile} onBuild={handleBuild} onClose={() => setShowBuild(false)} />
        )}
        {activeEvent && <EventCard event={activeEvent} onChoice={handleEventChoice} />}
        {effectSummary && (
          <EffectSummary data={effectSummary} onDismiss={handleDismissEffectSummary} />
        )}
        <GameOver />
      </div>

      {/* Bottom tab bar */}
      <div style={{
        display: 'flex', background: '#111', borderTop: '1px solid #333',
        zIndex: 20,
      }}>
        <button style={tabStyle('map')} onClick={() => setActiveTab('map')}>Map</button>
        <button style={tabStyle('civ')} onClick={() => setActiveTab('civ')}>Civilization</button>
        <button style={tabStyle('research')} onClick={() => setActiveTab('research')}>Research</button>
      </div>
    </div>
  );
}
