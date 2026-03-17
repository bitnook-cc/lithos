import { describe, it, expect } from 'vitest';
import { resolveCombat, CombatResult } from '@/logic/combatEngine';
import { ArmyStats } from '@/types/game';

const strongArmy: ArmyStats = {
  strength: 15, toughness: 10, speed: 5, stealth: 3, range: 5, morale: 8, numbers: 10,
};

const weakArmy: ArmyStats = {
  strength: 3, toughness: 2, speed: 2, stealth: 1, range: 0, morale: 3, numbers: 5,
};

describe('combatEngine', () => {
  it('strong army wins against weak enemy', () => {
    const result = resolveCombat(strongArmy, { enemyStrength: 5, enemyToughness: 3 }, () => 0.5);
    expect(result.victory).toBe(true);
  });

  it('weak army can lose to strong enemy', () => {
    const result = resolveCombat(weakArmy, { enemyStrength: 20, enemyToughness: 15 }, () => 0.5);
    expect(result.victory).toBe(false);
  });

  it('always returns casualties', () => {
    const result = resolveCombat(strongArmy, { enemyStrength: 5, enemyToughness: 3 }, () => 0.5);
    expect(result.numbersLost).toBeGreaterThanOrEqual(0);
    expect(result.numbersLost).toBeDefined();
  });

  it('higher range gives pre-combat advantage', () => {
    const rangedArmy = { ...weakArmy, range: 10 };
    const resultWithRange = resolveCombat(rangedArmy, { enemyStrength: 10, enemyToughness: 5 }, () => 0.5);
    const resultWithout = resolveCombat(weakArmy, { enemyStrength: 10, enemyToughness: 5 }, () => 0.5);
    // Ranged army should lose fewer numbers
    expect(resultWithRange.numbersLost).toBeLessThanOrEqual(resultWithout.numbersLost);
  });

  it('result includes descriptive text', () => {
    const result = resolveCombat(strongArmy, { enemyStrength: 5, enemyToughness: 3 }, () => 0.5);
    expect(result.text).toBeTruthy();
    expect(typeof result.text).toBe('string');
  });
});
