import { ArmyStats } from '@/types/game';

interface EnemyStats {
  enemyStrength: number;
  enemyToughness: number;
}

export interface CombatResult {
  victory: boolean;
  text: string;
}

export function resolveCombat(
  army: ArmyStats,
  enemy: EnemyStats,
  rand: () => number
): CombatResult {
  const effectiveStrength = army.strength;
  const effectiveToughness = army.toughness;

  // Enemy power
  const enemyPower = enemy.enemyStrength * 1.5;
  const enemyDefense = enemy.enemyToughness;

  // Combat score: how much we outclass the enemy
  const attackScore = effectiveStrength - enemyDefense;
  const defenseScore = effectiveToughness - enemyPower;

  // Add randomness: ±20% swing
  const roll = (rand() - 0.5) * 0.4;

  const victory = (attackScore + defenseScore) * (1 + roll) > 0;

  const text = victory
    ? 'Victory! Your forces prevailed.'
    : 'Defeat. Your forces were driven back.';

  return { victory, text };
}
