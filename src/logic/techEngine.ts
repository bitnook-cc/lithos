import { TechNode, Resources } from '@/types/game';
import { Effect } from '@/types/effects';

/** Can this tech be queued for research? (prerequisites met, not already researched) */
export function canQueue(techId: string, techs: TechNode[]): boolean {
  const tech = techs.find(t => t.id === techId);
  if (!tech || tech.researched) return false;
  return tech.requires.every(reqId => {
    const req = techs.find(t => t.id === reqId);
    return req?.researched === true;
  });
}

/** Legacy alias — used by tests and old code */
export function canResearch(techId: string, techs: TechNode[], _resources: Resources): boolean {
  return canQueue(techId, techs);
}

/** Mark a tech as researched and return its effects */
export function researchTech(techId: string, techs: TechNode[]): { techs: TechNode[]; effects: Effect[] } {
  const newTechs = techs.map(t =>
    t.id === techId ? { ...t, researched: true } : t
  );
  const tech = newTechs.find(t => t.id === techId)!;
  return { techs: newTechs, effects: tech.effects };
}

/** Get the cost of a tech */
export function getTechCost(techId: string, techs: TechNode[]): number {
  const tech = techs.find(t => t.id === techId);
  return tech?.cost ?? 0;
}
