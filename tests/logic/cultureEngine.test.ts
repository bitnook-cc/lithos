import { describe, expect, it } from 'vitest';
import { cultureAxisPosition, getCultureProfile } from '@/logic/cultureEngine';

describe('cultureEngine', () => {
  it('keeps a barely formed identity balanced', () => {
    expect(getCultureProfile({ military: 4, economy: 0, knowledge: 0 }).tone).toBe('balanced');
  });

  it.each([
    [{ military: 10, economy: 0, knowledge: 0 }, 'warlike'],
    [{ military: -10, economy: 0, knowledge: 0 }, 'pacifist'],
    [{ military: 0, economy: 10, knowledge: 0 }, 'mercantile'],
    [{ military: 0, economy: -10, knowledge: 0 }, 'insular'],
    [{ military: 0, economy: 0, knowledge: 10 }, 'erudite'],
    [{ military: 0, economy: 0, knowledge: -10 }, 'traditional'],
  ] as const)('maps signed cultural values to a distinct ethos', (identity, tone) => {
    expect(getCultureProfile(identity).tone).toBe(tone);
  });

  it('uses the strongest absolute cultural value', () => {
    expect(getCultureProfile({ military: 10, economy: 15, knowledge: 25 }).tone).toBe('erudite');
    expect(getCultureProfile({ military: -30, economy: 20, knowledge: 25 }).tone).toBe('pacifist');
  });

  it('positions and clamps bipolar axis markers', () => {
    expect(cultureAxisPosition(-100)).toBe(0);
    expect(cultureAxisPosition(0)).toBe(50);
    expect(cultureAxisPosition(100)).toBe(100);
    expect(cultureAxisPosition(500)).toBe(100);
  });
});
