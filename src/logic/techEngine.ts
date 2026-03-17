import { TechNode, TechEffects, Resources } from '@/types/game';

export function canResearch(techId: string, techs: TechNode[], resources: Resources): boolean {
  const tech = techs.find(t => t.id === techId);
  if (!tech || tech.researched) return false;
  if (resources.knowledge < tech.cost) return false;
  return tech.requires.every(reqId => {
    const req = techs.find(t => t.id === reqId);
    return req?.researched === true;
  });
}

export function researchTech(techId: string, techs: TechNode[]): { techs: TechNode[]; effects: TechEffects } {
  const newTechs = techs.map(t =>
    t.id === techId ? { ...t, researched: true } : t
  );
  const tech = newTechs.find(t => t.id === techId)!;
  return { techs: newTechs, effects: tech.effects };
}
