import { ArmyStats } from '@/types/game';

interface EnemyStats {
  enemyStrength: number;
  enemyToughness: number;
}

export interface CombatResult {
  victory: boolean;
  numbersLost: number;
  text: string;
}

export function resolveCombat(
  army: ArmyStats,
  enemy: EnemyStats,
  rand: () => number
): CombatResult {
  // Numbers scale effective combat power
  const numbersFactor = 1 + army.numbers / 10;
  const effectiveStrength = army.strength * numbersFactor;
  const effectiveToughness = army.toughness * numbersFactor;

  const enemyPower = enemy.enemyStrength * 1.5;
  const enemyDefense = enemy.enemyToughness;

  const attackScore = effectiveStrength - enemyDefense;
  const defenseScore = effectiveToughness - enemyPower;
  const totalScore = attackScore + defenseScore;

  // Randomness: ±20% swing
  const roll = (rand() - 0.5) * 0.4;

  // Morale makes defeat less likely
  const moraleFactor = army.morale / 10;
  const victory = (totalScore * (1 + roll) + moraleFactor * 5) > 0;

  // Casualties based on enemy power vs toughness, reduced by speed
  const baseCasualties = Math.max(0, Math.ceil(enemyPower / Math.max(1, effectiveToughness) * 2));
  const speedReduction = Math.floor(army.speed / 5);
  const numbersLost = Math.max(0, baseCasualties - speedReduction - (victory ? 1 : 0));

  const text = victory
    ? `Victory! Your forces prevailed${numbersLost > 0 ? `, losing ${numbersLost} warriors` : ''}.`
    : `Defeat. Your forces were driven back, losing ${numbersLost} warriors.`;

  return { victory, numbersLost, text };
}
