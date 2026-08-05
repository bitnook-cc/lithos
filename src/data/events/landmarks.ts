import { GameEvent } from '@/types/events';

export const LANDMARK_EVENTS: GameEvent[] = [
  {
    id: 'landmark_painted_vault', age: 'stone', title: 'The Painted Vault', category: 'discovery', triggers: {},
    text: 'Torchlight wakes a ceiling crowded with ochre aurochs, running horses, and the hands of people gone for generations. The images form a memory larger than any one storyteller.',
    choices: [
      { id: 'preserve', text: 'Appoint keepers of the painted stories.', requires: {}, effects: { resources: { knowledge: 3 }, identity: { knowledge: 3 }, addCivTag: 'Cave Keepers', chronicle: 'We guarded the painted vault, and memory became a public trust.' } },
      { id: 'imitate', text: 'Teach every family to leave its mark.', requires: {}, effects: { resources: { influence: 2 }, identity: { economy: 1 }, addLeaderTrait: 'Storykeeper', chronicle: 'Every hearth learned to paint its own place in our shared story.' } },
    ],
  },
  {
    id: 'landmark_jungle_temple', age: 'stone', title: 'The Verdant Temple', category: 'discovery', triggers: {},
    text: 'Roots split the stairway, but the inner chamber remains dry. Stone faces watch over bowls of unfamiliar seed and a bronze bell green with age.',
    choices: [
      { id: 'study', text: 'Read the carvings before touching anything.', requires: {}, effects: { resources: { knowledge: 3 }, identity: { knowledge: 2 }, flags: { temple_studied: true }, chronicle: 'We entered the green temple as students, not owners.' } },
      { id: 'claim', text: 'Raise our standard above the canopy.', requires: {}, effects: { resources: { influence: 3 }, identity: { military: 2 }, addCivTag: 'Temple Guardians', chronicle: 'The temple became a far beacon of our authority.' } },
    ],
  },
  {
    id: 'landmark_world_tree', age: 'stone', title: 'Beneath the World Tree', category: 'discovery', triggers: {},
    text: 'The tree is a country unto itself. Fruit, bees, birds, and tiny shrines fill its spreading roots; several wandering clans already call its shade neutral ground.',
    choices: [
      { id: 'commons', text: 'Declare the shade a common sanctuary.', requires: {}, effects: { resources: { food: 3, influence: 2 }, identity: { economy: 2 }, addCivTag: 'Sanctuary Makers', chronicle: 'No blade could be drawn beneath the World Tree.' } },
      { id: 'council', text: 'Gather the wandering clans in council.', requires: {}, effects: { resources: { influence: 4 }, identity: { knowledge: 1 }, chronicle: 'Under one vast crown, strangers learned to deliberate.' } },
      { id: 'hawks', text: 'Climb to the crown and befriend the nesting hawks.', requires: {}, effects: { resources: { food: -1, knowledge: 2 }, grantFeat: 'hawk_tamer', flags: { tamed_hawks: true }, chronicle: 'Our scouts returned from the World Tree with hunters of the open sky.' } },
    ],
  },
  {
    id: 'landmark_obsidian_spire', age: 'stone', title: 'The Black Glass Mountain', category: 'discovery', triggers: {},
    text: 'A sheer fin of obsidian catches the sun. Its fallen shards hold edges sharper than any knapped flint, but the slopes tremble underfoot.',
    choices: [
      { id: 'quarry', text: 'Cut carefully into the glass fall.', requires: {}, effects: { resources: { materials: 4 }, army: { strength: 1 }, identity: { military: 2 }, chronicle: 'Black glass armed our hunters and scarred the hands that shaped it.' } },
      { id: 'observe', text: 'Study the fire that made the stone.', requires: {}, effects: { resources: { knowledge: 3 }, identity: { knowledge: 2 }, chronicle: 'The black spire taught us that stone itself could once have flowed.' } },
    ],
  },
  {
    id: 'landmark_sunken_city', age: 'bronze', title: 'Streets Beneath the Tide', category: 'discovery', triggers: {},
    text: 'When the moon draws the water back, rooftops and a processional road emerge offshore. Sealed jars still rest in the upper rooms.',
    choices: [
      { id: 'salvage', text: 'Race the tide and recover what we can.', requires: {}, effects: { resources: { wealth: 4, materials: 2 }, identity: { economy: 2 }, chronicle: 'We learned the drowned city by the weight of what we carried away.' } },
      { id: 'chart', text: 'Chart every street across many tides.', requires: {}, effects: { resources: { knowledge: 4 }, identity: { knowledge: 2 }, addCivTag: 'Tide Readers', chronicle: 'Patient charts returned a lost city to history.' } },
    ],
  },
  {
    id: 'landmark_oracle_spring', age: 'bronze', title: 'The Speaking Water', category: 'discovery', triggers: {},
    text: 'Warm bubbles rise through a pavement of inscribed questions. Petitioners insist the changing reflections answer those who wait without speaking.',
    choices: [
      { id: 'listen', text: 'Keep a silent vigil at the spring.', requires: {}, effects: { resources: { knowledge: 3 }, identity: { knowledge: 3 }, addLeaderTrait: 'Contemplative', chronicle: 'Our leader listened until uncertainty itself became useful.' } },
      { id: 'open', text: 'Build a public court around the waters.', requires: {}, effects: { resources: { influence: 3, wealth: 1 }, identity: { economy: 2 }, chronicle: 'Questions brought pilgrims, and pilgrims brought a city.' } },
    ],
  },
  {
    id: 'landmark_titan_bones', age: 'stone', title: 'The Titan Bones', category: 'discovery', triggers: {},
    text: 'White ribs rise from the earth like the frame of a colossal ship. No hunter has seen a living beast that could have carried them.',
    choices: [
      { id: 'excavate', text: 'Excavate the bones and compare every fragment.', requires: {}, effects: { resources: { knowledge: 4 }, identity: { knowledge: 2 }, chronicle: 'The titan became evidence, not merely legend.' } },
      { id: 'monument', text: 'Make the great ribs our gathering place.', requires: {}, effects: { resources: { influence: 3 }, army: { morale: 1 }, identity: { military: 2 }, addCivTag: 'Titan Kin', chronicle: 'We met beneath the ribs and called ourselves the heirs of giants.' } },
    ],
  },
  {
    id: 'landmark_sky_stones', age: 'stone', title: 'The Sky Stones', category: 'discovery', triggers: {},
    text: 'Standing stones frame the sunrise exactly. Notches along their inner faces count a cycle far longer than a season.',
    choices: [
      { id: 'measure', text: 'Watch the shadows for a full turning.', requires: {}, effects: { resources: { knowledge: 4 }, identity: { knowledge: 2 }, flags: { sky_calendar: true }, chronicle: 'The stones made the year predictable and time became a tool.' } },
      { id: 'festival', text: 'Call the people to greet the aligned sun.', requires: {}, effects: { resources: { influence: 3, food: -1 }, army: { morale: 1 }, identity: { economy: 1 }, chronicle: 'At sunrise between the stones, a scattered people moved as one.' } },
    ],
  },
  {
    id: 'landmark_lost_library', age: 'bronze', title: 'The Ashen Library', category: 'discovery', triggers: {},
    text: 'Beneath burned beams lie shelves of clay tablets. Most are inventories, lawsuits, school exercises—and proof that an unknown city once ordered the world in words.',
    choices: [
      { id: 'translate', text: 'Found a school to translate the tablets.', requires: {}, effects: { resources: { knowledge: 5 }, identity: { knowledge: 3 }, addCivTag: 'Archivists', chronicle: 'The dead city taught our children to read.' } },
      { id: 'precedent', text: 'Adopt the clearest laws as precedent.', requires: {}, effects: { resources: { influence: 3 }, identity: { economy: 2 }, flags: { inherited_law: true }, chronicle: 'Old judgments found new voices in our courts.' } },
    ],
  },
  {
    id: 'landmark_first_battlefield', age: 'bronze', title: 'The Field of Standards', category: 'war', triggers: {},
    text: 'Burial mounds face one another across a quiet plain. The fallen carried the same pottery and spoke, perhaps, the same tongue.',
    choices: [
      { id: 'honor', text: 'Honor both armies and forbid looting.', requires: {}, effects: { resources: { influence: 3 }, identity: { knowledge: 2 }, army: { morale: 1 }, chronicle: 'We named no victor at the Field of Standards, only the cost.' } },
      { id: 'lessons', text: 'Study the formations and broken weapons.', requires: {}, effects: { resources: { knowledge: 2 }, identity: { military: 3 }, army: { strength: 1 }, chronicle: 'The nameless dead taught our soldiers how battles fail.' } },
    ],
  },
];

export const getLandmarkEvent = (id: string | null) => id ? LANDMARK_EVENTS.find(event => event.id === id) ?? null : null;
