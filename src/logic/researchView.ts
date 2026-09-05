import { TechNode } from '@/types/game';

/** A prerequisite ordering, not an automatically queued or recommended strategy. */
export function researchRoute(techs: TechNode[], destination: string): TechNode[] {
  const byId = new Map(techs.map(tech => [tech.id, tech]));
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const ordered: TechNode[] = [];
  const visit = (id: string) => {
    if (visited.has(id)) return;
    const tech = byId.get(id);
    if (!tech || visiting.has(id)) throw new Error('Invalid research prerequisites');
    visiting.add(id);
    tech.requires.forEach(visit);
    visiting.delete(id); visited.add(id); ordered.push(tech);
  };
  visit(destination);
  return ordered;
}
