import { describe, expect, it } from 'vitest';
import { currentCatalog, validateContent } from '@/logic/contentValidation';

describe('content authoring invariants', () => {
  it('has reachable references, upgrades, and unpaid event fallbacks', () => expect(validateContent()).toEqual([]));
  it('rejects circular research and unknown followups', () => {
    const catalog = structuredClone(currentCatalog());
    catalog.ages[0].techs[0].requires = [catalog.ages[0].techs[0].id];
    catalog.ages[0].events[0].chain = { nextEvents: { flag: 'missing' } };
    expect(validateContent(catalog).join('\n')).toContain('Cyclic');
    expect(validateContent(catalog)).toContain('Unknown chain target: missing');
  });
  it('detects an age-inappropriate tag and an all-paid event', () => {
    const catalog = structuredClone(currentCatalog());
    const event = catalog.ages[0].events[0];
    event.choices[0].requires = { civTags: ['Potters'] };
    for (const c of event.choices) c.cost = { food: 1 };
    const issues = validateContent(catalog).join('\n');
    expect(issues).toContain('Unreachable tag by stone');
    expect(issues).toContain('No unconditional unpaid fallback');
  });
  it('rejects construction methods that unlock before their building age', () => {
    const catalog = structuredClone(currentCatalog());
    catalog.ages[0].techs[0].effects.push({ type: 'unlock_building', buildingId: 'academy' });
    expect(validateContent(catalog)).toContain('Building unlocked before its age: stone/academy');
  });
});
