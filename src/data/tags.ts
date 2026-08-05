import { TagDef } from '@/types/effects';

export const CIV_TAGS: TagDef[] = [
  // ══════════ SURVIVAL TREE TAGS ══════════
  { id: 'Foragers', name: 'Foragers', description: 'Your people know how to find edible plants and safe water in the wild.' },
  { id: 'Fire Keepers', name: 'Fire Keepers', description: 'Masters of flame — fire improves cooking, warmth, and safety.',
    effects: [{ type: 'tile_bonus', tileType: 'plains', resource: 'food', amount: 1 }] },
  { id: 'Tool Makers', name: 'Tool Makers', description: 'Skilled at shaping stone and bone into useful implements.' },
  { id: 'Potters', name: 'Potters', description: 'Crafters of clay vessels for storage and trade.' },
  { id: 'Artisans', name: 'Artisans', description: 'Weavers and crafters who create useful goods from natural materials.' },
  { id: 'Farmers', name: 'Farmers', description: 'Your people have learned to cultivate the land and grow crops.' },
  { id: 'Masons', name: 'Masons', description: 'Expert stonecutters who can shape rock with precision.' },
  { id: 'Fishers', name: 'Fishers', description: 'Experienced at harvesting food from rivers and coastlines.',
    effects: [{ type: 'tile_bonus', tileType: 'water', resource: 'food', amount: 1 }] },
  { id: 'Settlers', name: 'Settlers', description: 'Builders of permanent shelters and settlements.' },

  // ══════════ WARFARE TREE TAGS ══════════
  { id: 'Warriors', name: 'Warriors', description: 'Trained fighters who know basic combat techniques.' },
  { id: 'Spear Carriers', name: 'Spear Carriers', description: 'Hunters and fighters skilled with the spear.' },
  { id: 'Shadow Stalkers', name: 'Shadow Stalkers', description: 'Masters of ambush and stealth warfare.' },
  { id: 'Painted Warriors', name: 'Painted Warriors', description: 'War-painted fighters whose appearance intimidates enemies.' },
  { id: 'Pack Hunters', name: 'Pack Hunters', description: 'Coordinated group hunters who bring down large prey together.' },
  { id: 'Fortifiers', name: 'Fortifiers', description: 'Builders of defensive positions and fortifications.',
    effects: [{ type: 'army_bonus', stat: 'toughness', amount: 1 }] },
  { id: 'Raiders', name: 'Raiders', description: 'Swift and cunning raiders who strike fast and vanish.' },

  // ══════════ MYSTICISM TREE TAGS ══════════
  { id: 'Oral Tradition', name: 'Oral Tradition', description: 'Keepers of stories and knowledge passed down through generations.' },
  { id: 'Ancestor Blessed', name: 'Ancestor Blessed', description: 'A people who honor and commune with the spirits of their ancestors.' },
  { id: 'Spirit Walkers', name: 'Spirit Walkers', description: 'Shamans who journey into the spirit world for visions and guidance.' },
  { id: 'Healers', name: 'Healers', description: 'Herbalists and medicine-makers who tend to the sick and wounded.',
    effects: [{ type: 'resource_per_turn', resource: 'population', amount: 1 }] },
  { id: 'Stargazers', name: 'Stargazers', description: 'Watchers of the night sky who navigate by stars and predict seasons.' },

  // ══════════ EVENT-GRANTED TAGS ══════════
  { id: 'Conservators', name: 'Conservators', description: 'Careful stewards of nature who gather sustainably.' },
  { id: 'Diplomats', name: 'Diplomats', description: 'Skilled negotiators who build bridges between peoples.' },
  { id: 'Beast Slayers', name: 'Beast Slayers', description: 'Hunters who have proven themselves against mighty beasts.' },
  { id: 'Lore Keepers', name: 'Lore Keepers', description: 'Scholars who study ancient markings and preserve lost knowledge.' },
  { id: 'River People', name: 'River People', description: 'A people who have mastered river crossings and waterways.' },
  { id: 'Mammoth Hunters', name: 'Mammoth Hunters', description: 'Hunters bold enough to bring down the great woolly mammoth.' },
  { id: 'Naturalists', name: 'Naturalists', description: 'Careful observers of the natural world and its plants.' },
  { id: 'Sky Readers', name: 'Sky Readers', description: 'Interpreters of celestial patterns and star maps.' },
  { id: 'Cave Dwellers', name: 'Cave Dwellers', description: 'A people who have made caves their home and shelter.' },
  { id: 'Nomadic', name: 'Nomadic', description: 'Wanderers who move with the seasons, never settling in one place.' },
  { id: 'Traders', name: 'Traders', description: 'Merchants and traders who exchange goods for mutual benefit.' },

  // Bronze and Classical legacies
  { id: 'Flame Proven', name: 'Flame Proven', description: 'Your people faced the dark and carried fire through it.' },
  { id: 'Trusted Traders', name: 'Trusted Traders', description: 'Distant communities know your weights, marks, and promises.' },
  { id: 'Sky Scouts', name: 'Sky Scouts', description: 'Hawk keepers and pathfinders who read the country from above.' },
  { id: 'City Builders', name: 'City Builders', description: 'Skilled organizers of streets, storage, and civic labor.' },
  { id: 'Scribes', name: 'Scribes', description: 'Keepers of marks that allow memory to outlive a ruler.' },
  { id: 'Bronze Forged', name: 'Bronze Forged', description: 'Smiths and soldiers shaped by the first great alloy.' },
  { id: 'Caravan People', name: 'Caravan People', description: 'Your roads carry goods, news, and influence.' },
  { id: 'Law Keepers', name: 'Law Keepers', description: 'Public law constrains both citizen and ruler.' },
  { id: 'Epic Tradition', name: 'Epic Tradition', description: 'Shared heroes bind generations together.' },
  { id: 'Monument Makers', name: 'Monument Makers', description: 'Your public works speak across centuries.' },
  { id: 'Sacred Script', name: 'Sacred Script', description: 'Writing is guarded as a holy mystery.' },
  { id: 'God-King Tradition', name: 'God-King Tradition', description: 'Sacred authority and royal power are one.' },
  { id: 'Philosophers', name: 'Philosophers', description: 'Public argument is treated as a path to truth.' },
  { id: 'Citizens', name: 'Citizens', description: 'Belonging carries rights as well as duties.' },
  { id: 'Legionaries', name: 'Legionaries', description: 'Standard drill turns citizens into a disciplined army.' },
  { id: 'Orators', name: 'Orators', description: 'Public speech can move a city.' },
  { id: 'Republic', name: 'Republic', description: 'Offices and laws stand above any single ruler.' },
  { id: 'Free Inquiry', name: 'Free Inquiry', description: 'No idea is protected from honest questions.' },
  { id: 'River Commonwealth', name: 'River Commonwealth', description: 'Old allies now share one civic identity.' },
  { id: 'Patrons of Art', name: 'Patrons of Art', description: 'Beauty and drama are civic achievements.' },
  { id: 'Ancestor Respect', name: 'Ancestor Respect', description: 'Public works bend around the remembered dead.' },
  { id: 'Oathbound', name: 'Oathbound', description: 'Authority is understood as a promise to citizens.' },
];

export const LEADER_TRAITS: TagDef[] = [
  { id: 'Bold', name: 'Bold', description: 'A fearless leader who takes decisive action.' },
  { id: 'Cautious', name: 'Cautious', description: 'A careful leader who weighs every option before acting.' },
  { id: 'Devout', name: 'Devout', description: 'A spiritual leader guided by faith and ritual.' },
  { id: 'Cunning', name: 'Cunning', description: 'A shrewd leader who outmaneuvers rivals through wit.' },
  { id: 'Visionary', name: 'Visionary', description: 'A forward-thinking leader who sees beyond the horizon.',
    effects: [{ type: 'resource_per_turn', resource: 'knowledge', amount: 1 }] },
  { id: 'Ruthless', name: 'Ruthless', description: 'A merciless leader who stops at nothing to achieve goals.' },
];

export function getCivTag(id: string): TagDef | undefined {
  return CIV_TAGS.find(t => t.id === id);
}

export function getLeaderTrait(id: string): TagDef | undefined {
  return LEADER_TRAITS.find(t => t.id === id);
}
