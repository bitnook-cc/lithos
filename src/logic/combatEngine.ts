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
  // Calculate effective attack power
  const rangeBonus = Math.min(army.range, enemy.enemyStrength); // pre-combat damage
  const effectiveStrength = army.strength * (1 + army.numbers / 10) + rangeBonus;
  const effectiveToughness = army.toughness * (1 + army.numbers / 10);

  // Enemy power
  const enemyPower = enemy.enemyStrength * 1.5;
  const enemyDefense = enemy.enemyToughness;

  // Combat score: how much we outclass the enemy
  const attackScore = effectiveStrength - enemyDefense;
  const defenseScore = effectiveToughness - enemyPower;
  const totalScore = attackScore + defenseScore;

  // Add randomness: ±20% swing
  const roll = (rand() - 0.5) * 0.4;
  const finalScore = totalScore * (1 + roll);

  // Morale check: low morale makes defeat more likely
  const moraleFactor = army.morale / 10; // 0.0 to 1.0+

  const victory = (finalScore + moraleFactor * 5) > 0;

  // Casualties: based on enemy strength vs our toughness
  const baseCasualties = Math.max(0, Math.ceil(enemyPower / Math.max(1, effectiveToughness) * 2));
  // Speed helps reduce casualties (fast retreat)
  const speedReduction = Math.floor(army.speed / 5);
  const numbersLost = Math.max(0, baseCasualties - speedReduction - (victory ? 1 : 0));

  const text = victory
    ? `Victory! Your forces prevailed, losing ${numbersLost} warriors.`
    : `Defeat. Your forces were driven back, losing ${numbersLost} warriors.`;

  return { victory, numbersLost, text };
}
