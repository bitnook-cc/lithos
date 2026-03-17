import React, { useEffect, useState, useCallback } from 'react';
import { PhaserGame } from '@/game/PhaserGame';
import { HUD } from '@/ui/HUD';
import { EventCard } from '@/ui/EventCard';
import { TechTree } from '@/ui/TechTree';
import { ArmyPanel } from '@/ui/ArmyPanel';
import { BuildMenu } from '@/ui/BuildMenu';
import { GameOver } from '@/ui/GameOver';
import { useGameStore } from '@/store/gameStore';
import { Tile } from '@/types/map';
import { GameEvent, EventChoice } from '@/types/events';
import { STONE_AGE_EVENTS } from '@/data/events/stoneAge';
import { stoneAgeTechs } from '@/data/techs/stoneAge';
import { getAvailableEvents, pickRandomEvent, resolveOutcome } from '@/logic/eventEngine';
import { processCollectPhase, processExploreAction, processBuildAction } from '@/logic/turnEngine';
import { researchTech } from '@/logic/techEngine';
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

export default function App() {
  const store = useGameStore();
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [activeEvent, setActiveEvent] = useState<GameEvent | null>(null);
  const [showTech, setShowTech] = useState(false);
  const [showBuild, setShowBuild] = useState(false);
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
    if (store.phase !== 'actions' || store.actionPoints <= 0) return;
    const { techs, effects } = researchTech(techId, store.techs);
    store.setState({ techs });
    store.updateResources({ knowledge: -store.techs.find(t => t.id === techId)!.cost });
    if (effects.resourceBonuses) store.updateResources(effects.resourceBonuses);
    if (effects.armyBonuses) store.updateArmy(effects.armyBonuses);
    if (effects.addsCivTag) store.addCivTag(effects.addsCivTag);
    if (effects.addsLeaderTrait) store.addLeaderTrait(effects.addsLeaderTrait);
    if (effects.isAdvance) {
      const newState = transitionAge(store, Date.now());
      store.setState(newState);
    }
    store.spendActionPoint();
  }, [store.phase, store.actionPoints]);

  const handleEventChoice = useCallback((choice: EventChoice) => {
    if (choice.effects.resources) store.updateResources(choice.effects.resources);
    if (choice.effects.identity) store.updateIdentity(choice.effects.identity);
    if (choice.effects.army) store.updateArmy(choice.effects.army);
    if (choice.effects.flags) {
      for (const [k, v] of Object.entries(choice.effects.flags)) store.setFlag(k, v);
    }
    if (choice.effects.addCivTag) store.addCivTag(choice.effects.addCivTag);
    if (choice.effects.addLeaderTrait) store.addLeaderTrait(choice.effects.addLeaderTrait);

    if (choice.effects.outcomes) {
      const outcome = resolveOutcome(choice.effects.outcomes, rand);
      if (outcome.flags) {
        for (const [k, v] of Object.entries(outcome.flags)) store.setFlag(k, v);
      }
      if (outcome.combat) {
        const result = resolveCombat(store.army, outcome.combat, rand);
        store.updateArmy({ numbers: -result.numbersLost });
      }
    }

    setActiveEvent(null);
    store.setState({ currentEvent: null });
    store.nextPhase(); // -> enemy
  }, []);

  const handleEndTurn = useCallback(() => {
    if (store.phase === 'actions') {
      store.nextPhase(); // -> event
    }
  }, [store.phase]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <PhaserGame />
      <HUD />
      <ArmyPanel />

      {/* Action buttons */}
      {store.phase === 'actions' && (
        <div style={{
          position: 'absolute', bottom: 16, right: 16, zIndex: 10,
          display: 'flex', gap: 8,
        }}>
          {selectedTile && !selectedTile.controlled && selectedTile.visible && (
            <button
              style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#4a8a4a', color: '#fff', cursor: 'pointer' }}
              onClick={() => handleExplore(selectedTile)}
            >
              Explore
            </button>
          )}
          {selectedTile && selectedTile.controlled && !selectedTile.building && (
            <button
              style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#4a4a8a', color: '#fff', cursor: 'pointer' }}
              onClick={() => setShowBuild(true)}
            >
              Build
            </button>
          )}
          <button
            style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#6a4a8a', color: '#fff', cursor: 'pointer' }}
            onClick={() => setShowTech(!showTech)}
          >
            Research
          </button>
          <button
            style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#8a4a4a', color: '#fff', cursor: 'pointer' }}
            onClick={handleEndTurn}
          >
            End Turn
          </button>
        </div>
      )}

      {showTech && <TechTree onResearch={handleResearch} />}
      {showBuild && selectedTile && (
        <BuildMenu tile={selectedTile} onBuild={handleBuild} onClose={() => setShowBuild(false)} />
      )}
      {activeEvent && <EventCard event={activeEvent} onChoice={handleEventChoice} />}
      <GameOver />
    </div>
  );
}
