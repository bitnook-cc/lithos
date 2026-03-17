import { RivalCiv, ArmyStats, GameState, AgeId } from '@/types/game';
import { HexCoord, Tile } from '@/types/map';
import { hexNeighbors } from '@/game/hex/hexUtils';

const NAMES = ['Wolf Clan', 'River People', 'Hill Tribe', 'Stone Band', 'Fire Walkers'];
const PERSONALITIES: RivalCiv['personality'][] = ['aggressive', 'defensive', 'trader'];

const hexKey = (c: HexCoord) => `${c.q},${c.r}`;

export function createRival(age: AgeId, homeTile: HexCoord, rand: () => number): RivalCiv {
  const baseStrength = age === 'stone' ? 3 : 6;
  return {
    id: `rival_${homeTile.q}_${homeTile.r}`,
    name: NAMES[Math.floor(rand() * NAMES.length)],
    personality: PERSONALITIES[Math.floor(rand() * PERSONALITIES.length)],
    threat: {
      strength: baseStrength + Math.floor(rand() * 3),
      toughness: baseStrength - 1 + Math.floor(rand() * 2),
      speed: 2, stealth: 1, morale: 3,
      numbers: 4 + Math.floor(rand() * 4),
    },
    disposition: 0,
    homeTile,
    controlledTiles: [homeTile],
  };
}

export function processRivalTurn(
  state: GameState,
  rand: () => number
): { rivals: RivalCiv[]; map: Tile[] } {
  const newMap = state.map.map(t => ({ ...t }));
  const mapLookup = new Map(newMap.map(t => [hexKey(t.coord), t]));
  const newRivals = state.rivals.map(r => ({
    ...r,
    threat: { ...r.threat },
    controlledTiles: [...r.controlledTiles],
  }));

  for (const rival of newRivals) {
    // Scale threat slightly each turn
    rival.threat.strength += 1;
    rival.threat.numbers = Math.min(rival.threat.numbers + 1, 15);

    // Aggressive rivals expand
    if (rival.personality === 'aggressive' || (rival.personality === 'trader' && rand() > 0.7)) {
      const candidates: Tile[] = [];
      for (const controlled of rival.controlledTiles) {
        for (const neighbor of hexNeighbors(controlled)) {
          const tile = mapLookup.get(hexKey(neighbor));
          if (tile && !tile.controlled && tile.rivalId === null && tile.type !== 'water') {
            candidates.push(tile);
          }
        }
      }
      if (candidates.length > 0) {
        const target = candidates[Math.floor(rand() * candidates.length)];
        target.rivalId = rival.id;
        rival.controlledTiles.push(target.coord);
      }
    }
  }

  return { rivals: newRivals, map: newMap };
}
