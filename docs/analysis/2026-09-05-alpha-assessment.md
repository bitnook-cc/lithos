# Lithos: prototype assessment and playable-alpha plan

Assessment date: 5 September 2026. Code reviewed: `main` at `ea7110e`.

## Assessment

Lithos has a coherent identity and enough implemented systems to support a playable alpha. Its strongest idea is a civilization whose choices become cultural character, historical consequences, and an inheritance for the next run. The three-age structure gives that idea a manageable beginning, middle, and ending.

The current implementation is a functional prototype with important gaps between its systems. More technologies and visual polish will not, by themselves, close those gaps. The alpha should concentrate on reliable rules, understandable decisions, distinct strategies, and a satisfying complete run.

Keep the existing React, Phaser, TypeScript, and Zustand foundation. Keep the alpha to Stone, Bronze, and Classical. Use the later design direction of **15–20 minutes per age**, implying **45–60 minutes for a successful three-age run**, excluding pauses and initial learning. The original design document's approximately 30-minute, seven-to-eight-age target is obsolete for this assessment.

## Evidence and limits

I inspected the domain engines, content definitions, store and persistence, application orchestration, map generation/rendering/input, major UI components, development setup, and relevant tests.

Verification performed:

- All **107 tests across 14 files passed**.
- TypeScript checking and the production build passed. The build reports a large Phaser chunk: approximately 1.21 MB minified / 323 KB gzip; the main JavaScript chunk is approximately 420 KB / 126 KB gzip. These are bundle measurements, not measured device performance.
- In a fresh browser origin on port 5187, I played the opening through turn three: research selection, surveying, expansion, event choices, research completion, constructing a Gathering Site, and reloading. Resources, action points, turn, and cultural state survived that reload.
- I ran direct domain diagnostics for upgrade availability, missing content references, event affordability, culture effects, research duration, and a diplomacy loss edge case.
- I sampled map generation for seeds 1–100 in each age: **300 generated maps**.

This was not a timed full campaign, a large population of simulated complete runs, a physical-phone test, or a cross-browser certification. Successful campaign completion rates, actual minutes per age, and strategy balance remain unmeasured. Passing unit tests should not be read as proof of those outcomes.

## What the game currently contains

| System/content | Stone | Bronze | Classical |
|---|---:|---:|---:|
| Technologies | 14 | 18 | 22 |
| Ordinary story events | 20 | 10 | 10 |
| Map tiles | 37 | 61 | 91 |
| Starting rivals | 1 | 2 | 2 |
| Displayed expected turns | 18 | 17 | 17 |

There are also ten landmark-event definitions, 37 building definitions, seven feats, and seven ancestral perks, with two perk slots. Definition counts overstate usable breadth: some buildings and choices are inaccessible, and not every landmark appears in every run. The README still lists 47 technologies and six feats/perks; current code contains 54 technologies and seven of each.

### Core loop and player fantasy

The implemented rhythm is collection, player actions, a possible story event, rival activity, then the next turn. Collection produces resources, feeds people, handles growth/starvation, and advances research. Surveying reveals a tile's details and surrounding terrain; expansion claims it and reserves population; building improves a worked district. Landmarks offer an additional event encounter. Diplomacy trades resources, improves relations, or demands tribute.

This is a promising compact strategy loop. One person per controlled tile gives population a territorial role. Visible-but-unsurveyed terrain makes exploration more deliberate than simply uncovering darkness. The chronicle and cross-age flags can make a run feel like one people's history.

The central design risk is that the map, story, and research can feel like parallel activities. A story can describe scouts, settlement, or conquest without changing the corresponding geography. A technology can promise an upgrade the new age cannot construct. The alpha should make more of these actions cause visible consequences in the other systems.

### Economy, population, and research

The food loop is understandable once learned: production minus population consumption, with surplus contributing to growth. The initial capital produces less food than its five people consume, creating an immediate reason to expand and improve land. In the browser sample, the Gathering Site moved the food forecast from -1 to +1 per turn; that is useful, legible feedback.

However, territory permanently reserves population, including dormant districts. Worker allocation is automatic and prioritizes the capital, buildings, and proximity rather than food security. There is no ordinary reassignment or abandonment action. After population losses, a player can own land but lack a clear way to put the remaining people where recovery requires them. Fibonacci growth thresholds also slow expansion sharply as population rises. These are balance and recovery questions requiring full-run testing, not proof that every run becomes trapped.

Research now advances over collections and is not purchased instantly from saved knowledge. But knowledge still accumulates as a resource, and events award or remove it without advancing or reducing current research progress. A choice such as saving a library can therefore advertise knowledge as a reward without helping the discovery the player is pursuing.

No minimum research duration is enforced. A diagnostic state with normal required discoveries inherited from earlier ages, Philosophy completed, and one legally constructed Academy completed Citizenship in one collection: rate 15, cost 14. This was a constructed domain scenario, not a complete browser run. It demonstrates that ordinary development can bypass the intended multi-turn duration.

Research selection is free of AP cost; switching projects discards progress. These can be valid rules, but need explicit presentation and protection against accidental loss. Unused research income while no project is active has no clear player-facing role.

### Pacing and progression

The existing pacing test adds up the costs of selected six-technology routes using assumed research rates. It does not measure the duration of play, decision time, optional research, science-building investment, events, combat, or player confusion. The 18/17/17 turn figures are expectations shown in the HUD, not enforced deadlines.

At roughly 17 turns per age, 15–20 minutes requires approximately 53–71 seconds of active play per turn. That is possible with meaningful decisions, but unlikely if many turns consist of clicking End Turn and dismissing reports. A longer timer or more expensive research alone would risk adding waiting.

Every current advancement route requires a small fixed subset of its age's tree. The Classical ending requires Republic and Theater regardless of the civilization's identity. Ending prose changes with flags and identity, but there are not yet mechanically distinct paths to victory.

Maps regenerate between ages. Resources, population, army, cultural identity, tags, flags, leaders, and persistent effects continue; built geography and rivals do not. The old map does not inform the new map, and developed settlements do not consolidate into a meaningful inherited capital bonus. The food reserve provides a buffer, but the transition can still feel like losing the civilization the player just built.

### Culture and narrative

The cultural banner, color treatments, and transitions provide a useful visual signature. Cross-age memories such as welcoming a tribe and later negotiating citizenship are the game's most distinctive authored material.

The cultural axes themselves currently do not directly change army power, resource collection, research rate, or rival attack logic. Tags and traits can have mechanical effects, and identity gates some choices and influences endings, so culture is not entirely cosmetic. Nevertheless, changing military identity from 0 to 100 left the effective army identical in a diagnostic comparison.

Positive and negative cultural poles are also unevenly supported. Choice identity requirements express minimum values only; they cannot directly express a requirement such as military <= -20. Several traditional or spiritual choices raise the same knowledge axis used to describe an erudite culture. The alpha needs a consistent interpretation of what each axis means and a useful playstyle at both ends.

All 40 ordinary events are non-repeating. Bronze and Classical have ten each before eligibility restrictions, with landmarks providing optional additional encounters. Their content pools do not yet match the ambition of longer, richer later ages. There is no scheduler guaranteeing a narrative arc, a cross-age payoff before its time window expires, or a final question before a fast player finishes.

The `chain.nextEvents` metadata is not consumed by the event engine. Actual follow-ups use flags in triggers. Three old metadata targets do not exist, while some replacement flag-driven events do exist; this is inconsistent authoring infrastructure, not evidence that all cross-age stories fail.

Most Stone events lack titles/categories and appear as “A Turning Point,” including in history. Some outcome prose promises things its effects do not deliver. Event resource costs are not distinguished from unavoidable resource losses.

### Rivals and combat

Rivals establish borders, expand, and sometimes attack; diplomatic actions are a useful starting point. But the system is much smaller than the design describes.

Only aggressive rivals initiate border attacks. A single envoy adds 25 disposition, passing the attack threshold of 20; there is no ordinary relation decay, and defensive victories reduce disposition rather than moving toward settlement. Players can neither conduct a normal territorial attack nor eliminate a rival. Enemy defeat removes population and food but does not capture the district described in the report. `rivalsDefeated` is present in statistics without a corresponding implemented conquest loop.

Combat resolves with player strength, toughness, numbers, morale, and speed. Stealth gates some event options but does not enter the combat resolver. Rival numbers increase but are not passed into ordinary border combat, which uses only enemy strength and toughness. Military numbers have neither the planned recruitment action nor food upkeep. Zero base numbers do not imply zero combat power.

These facts limit a warlike strategy. For alpha, keep combat abstract but give players a small set of purposeful military decisions, predictable consequences, and a way to end a conflict. A tactical unit system would be a major unnecessary expansion.

### Interface, accessibility, and presentation

The setup screen, age cards, dark map palette, cultural banner, and narrative typography already establish an appealing tone. The underlying map uses procedural drawings and text labels, so broad content iteration remains inexpensive. Reduced-motion styling and button focus styling are present.

The first-run experience explains the premise and perks but does not teach the survival loop. It does not make the next concrete objective, starvation horizon, research duration, or survey/claim distinction sufficiently explicit. Research details appeared below the visible tree in the narrow browser layout; the tree requires substantial panning/scrolling as it grows.

Below 560 px, resource names and cultural axes are hidden. Symbols become the only resource identification, and the player loses much of the culture display's explanatory value. Several labels use very small type. Build and menu actions use clickable `div`s; the build choices appeared as plain text in the accessibility tree. Modal semantics, focus management, keyboard map access, and touch controls need a deliberate pass. Map zoom is wired to a wheel and recentering to right click, without equivalent visible mobile controls.

Audio, richer response animations, and additional illustration can improve feel after interaction clarity. They should not precede the functional repairs. The current browser review does not establish physical-phone performance or touch comfort.

## Architecture assessment

The intended dependency direction is sound:

`Content and types -> domain engines -> run/meta stores -> React UI and Phaser map`

Content factories define the current age, pure functions implement much of the rules, Zustand owns serializable state, React presents overlays, and Phaser renders the map. This is an appropriate foundation for a small browser strategy game. There is no need for a backend, engine migration, or generalized space-map renderer to ship the alpha.

The important deviation is orchestration: `App.tsx` drives phase transitions in effects, applies completion effects, manages random draws, records feats, and coordinates multiple local modal states. The store exposes broad setters, while actions and validation are distributed between components, the store, and domain functions. Some actions commit state and AP spending separately, causing separate saves. This makes phase-boundary saves and consistent command validation harder to reason about.

Random functions are injectable in domain code, but the actual session random generator and age-transition seeds derive from `Date.now()`. Their state is not saved. Consequently a seed alone cannot reproduce a player's complete session, and reload does not preserve the future random sequence.

Run saves use a versioned storage key and a structural Zod schema, rather than an explicit versioned save envelope with migrations. Entire technology definitions are saved. Old runs can retain old content while interacting with newer building/tag definitions. Invalid schema saves can be removed silently, storage failures are swallowed, pending consequence text is local UI state, and legacy validation is much weaker than run validation. Basic action-phase reload works; robust upgrade/recovery behavior is not established.

Recommended architectural changes are bounded: one command boundary, explicit phase/outcome state, persisted randomness, persistent discovery/unlock IDs, a shared rule-preview layer, and a migration-capable save format. Refactor around tested behavior rather than rewrite the engines.

## Confirmed issues to prioritize

| Priority | Finding | Consequence |
|---|---|---|
| P1 | Bronze replaces the map and technology list; six upgrades require Stone base buildings no longer available | Primitive Farm, Stone Mine, Lumber Yard, Temple, Harbor, and Fortress cannot be constructed through their normal paths |
| P1 | Event choices do not check resource affordability; negative changes clamp to zero | “Buy their departure” succeeds with zero wealth and food while reporting -5 wealth and -3 food |
| P1 | Research duration has no minimum and event knowledge does not feed research | The multi-turn promise can fail, and knowledge rewards do not do what players are likely to expect |
| P1 | Losing the last person through failed tribute does not immediately set game over | Terminal state handling differs by action and allows an invalid interim state |
| P1 | Map sampling produced no mountain tiles in 300 maps | Mountain-dependent options are effectively unavailable in this sample; thresholds/distribution need repair and broader testing |
| P2 | Required tags Ancestor Blessed, Painted Warriors, and Spirit Walkers have no grant path | Some visible locked choices are impossible, even on another lineage |
| P2 | Stone's pottery drought option requires a tag first granted in Bronze | This choice cannot be reached in the age where it appears |
| P2 | Sand Quarry and Peat Harvester have no unlock source | Content exists without a player route to it |
| P2 | Chain metadata points at three absent IDs and is unused by scheduling | Authoring intent and runtime behavior diverge |
| P2 | Culture has limited direct strategic effects; rivals cannot be defeated | Advertised cultural and military playstyles lack enough agency |
| P2 | Saves silently discard/fail and do not preserve random state | Alpha testers cannot reliably recover or reproduce problems |

P1 denotes work to resolve before inviting an external alpha cohort; it does not imply the application currently crashes on every run. P2 denotes substantial alpha-quality/content work. Save correctness belongs early in the implementation sequence despite its prototype-review priority here.

Map sample details: hills appeared in 24/100 Stone maps, 15/100 Bronze maps, and 10/100 Classical maps. Mountain frequency was 0/100 in each. These measurements establish a distribution concern, not a mathematical proof that mountains are impossible for every seed.

## Proposed alpha scope

An alpha player should be able to open a shared build, learn the first turns without a developer, make a recognizable cultural strategy, reach a coherent victory or understandable defeat, resume later, and start another lineage with a meaningful alternative.

Include:

- The existing three ages, keeping later technology trees broader than Stone.
- A 15–20 minute active-play target for each age, tuned through observed runs.
- Three distinguishable strategic routes: military dominion, exchange/shared government, and knowledge/cultural achievement. These are routes, not three replacements for the six cultural poles; negative poles should offer useful policies and choices too.
- A small abstract military system, legible rival intentions, and conflicts that can conclude.
- Deliberate cross-age inheritance and at least three branching story chains spanning ages.
- A guided opening, clear action previews, reliable saving, readable desktop/mobile layouts, and a restart/legacy loop.
- A reproducible build, automated regression checks, and an exportable feedback/debug record.

Defer additional historical ages, tactical units, multiplayer, accounts/cloud synchronization, mobile-store packaging, a content editor, and large art/audio production. Browser alpha distribution is sufficient. PWA/offline support can follow once update and save migration behavior are reliable, unless offline play becomes an explicit alpha requirement.

## Implementation sequence and acceptance gates

### Milestone 1: trustworthy rules and saves

Introduce a `dispatch(command)` boundary backed by a domain reducer/service returning the next state and structured outcomes. Commands validate phase, AP, affordability, prerequisites, and targets before changing anything. Centralize defeat checks. Persist pending results and random state. Keep React responsible for display and dismissal rather than independently advancing the simulation.

Separate voluntary costs from forced losses. Check the former before granting benefits; apply the latter according to explicit rules. Add content validation for references, reachable tags/buildings, age availability, event fallback choices, and research cycles. Fix the known unreachable content. Add an explicit save version/content version, migration fixtures, retained recovery copies, and a visible save failure state.

Acceptance: the known invalid actions and zero-population case are covered; saving/reloading at every phase does not duplicate or lose effects; identical seeds and command sequences reproduce results; corrupt/old saves have a visible recovery path. Existing tests/build remain green, with new tests targeting failures rather than merely checking content counts.

### Milestone 2: coherent economy, research, and age inheritance

Separate persistent discovered/unlocked IDs from the current age's research graph. Let later districts construct appropriate base buildings or direct replacements. Define an age-transition inheritance summary: what territory consolidates into the capital, which bonuses continue, what changes scale, and how food/labor reconnects. Preserve meaningful geographical character when generating the next map.

Give players a modest recovery control, such as assigning workers to owned districts or choosing a district production priority. Show starvation timing and production breakdowns. Rebalance terrain generation so intended resource/strategy options appear at useful frequencies; provide fallback strategies rather than identical maps.

Use research income as the single clear progress currency. Convert one-off knowledge rewards into documented project progress or bounded reserve progress. Require at least two collection ticks for ordinary discoveries, with explicit exceptions only if later chosen as a design feature. Preview turns remaining, retain/confirm switched progress, and make research investment valuable through breadth and major projects. Avoid making extra science feel wasted by the duration floor.

Acceptance: all intended building paths work in their ages; a mixed population can recover from a survivable setback; the same milestone can be reached with and without optional science infrastructure; ordinary research remains multi-turn at the strongest attainable rate; transition scenarios do not create unavoidable starvation from an otherwise healthy civilization.

### Milestone 3: a teachable Stone Age

Build a short, skippable opening objective sequence: inspect food, survey a promising tile, claim it, choose research, build food production, resolve a consequential event. Use a controlled first-run setup or constrained seed set while retaining normal procedural runs afterward. Reveal only the help needed for the next decision.

Add a persistent current objective and concise previews of AP, resources, labor, research time, and danger. Replace the narrow-screen research interaction with a readable branch list or tree plus reachable/sticky detail panel. Make the next action available beside the selected tile. Use named event cards, actual buttons, accessible dialogs, readable resource labels, and touch zoom/recenter controls.

Acceptance: at least four of five new testers can complete the opening economy/research loop without spoken help and explain why food changed. Verify a compact phone viewport, landscape layout, desktop, keyboard interaction, and reduced motion; validate on physical touch devices before calling mobile support complete.

### Milestone 4: culture and rivals create different strategies

Define effects and tradeoffs for both poles of each culture axis. Prefer bounded policy thresholds to unrestricted multipliers. For example, a warlike culture could sustain campaigns more effectively at a higher food burden; an erudite culture could exploit discoveries and evidence-based event alternatives; an insular culture could gain self-sufficiency options while sacrificing trade opportunities. These examples require balancing, not adoption as fixed numeric rules.

Add a small military action set: recruit/recover, defend, and conduct an abstract campaign. Make manpower and upkeep explicit. A campaign should have observable territorial or surrender consequences. Let rivals telegraph hostile intent, use relevant army stats consistently, and expose stable treaties with clear conditions. Tie important narrative rivals to actual factions where feasible.

Create different final legacy projects with measurable preparation: military control, durable cooperation/prosperity, and knowledge/public institutions. Endings should acknowledge achieved outcomes and earlier sacrifices, not solely the last selected text flag.

Acceptance: three intentionally different strategies can finish; each changes research priorities, economic decisions, diplomacy, and ending requirements. Every army stat shown has a documented role. A prepared player can identify an approaching threat and choose a useful response. Both peaceful resolution and a finite military conflict work.

### Milestone 5: a complete three-age narrative and pacing pass

Schedule an opening development, rising tension, crisis, and payoff for each age. Reserve opportunities for important chain continuations. Use low-frequency repeatable situations only where state-dependent variation justifies them. Connect narrative promises to actual resources, map changes, rival states, policies, or research.

An initial content budget is the existing 20 Stone events, roughly 20–24 Bronze and 24–28 Classical events, plus the landmark pool. This is a planning allowance, not a quota or a requirement to show all events in one run. Prefer meaningful branches and consequences over increasing raw count. Keep 14/18/22 technologies as a starting breadth and reassess redundancy after strategy testing; completion of an entire tree should not be mandatory.

Instrument active time by age, research wait time, unused AP, event eligibility, food crises, selected strategies, cause of death, and ending. Use exported local session records initially. Run scripted policies for mechanical regressions and observe humans for pacing and comprehension. Neither substitutes for the other.

Acceptance: successful runs show a 15–20 minute median of active play per age in the target cohort, or the remaining gap has a specific measured cause. Avoid repeated turns where waiting for research is the only sensible action. Players can name a choice from an earlier age that changed their later experience. Defeat explains its causes and the next run offers a meaningful alternative.

### Milestone 6: external alpha release

Add CI for install/test/build and browser smoke scenarios; publish a versioned browser build after release authorization. Replace the stale hardcoded build label with the real revision. Provide bug-report export including build, seed/random state, recent commands, and save state. Preserve reports locally unless the player deliberately submits them. Add straightforward error/recovery screens and load feedback.

Finish response animations, basic optional audio with volume controls, browser/device performance checks, and the save-update compatibility pass. A production static build is the release artifact; the current Docker configuration is for development.

Acceptance: no known progression or save-loss blockers; a test matrix covers first run, full three-age victory, defeat, restart with perks, event/age-transition reload, and content update migration. A small external cohort completes enough runs to evaluate all three strategies and both success and failure. Record known limitations rather than implying broad mobile or offline support that has not been tested.

## Planning and scope control

Implement Milestones 1 and 2 first, then finish the teachable opening before expanding later-age content. Content authoring for Milestone 5 can overlap once its schemas and outcome rules are stable. Conduct two external observation rounds: after the Stone opening and after the complete three-age experience.

For one experienced developer working substantially full-time, **six to ten focused development weeks plus tester scheduling** is a provisional planning envelope, not a delivery promise. Re-estimate after the first two milestones. The largest uncertainties are narrative production, how much tactical agency the abstract military system needs, and iterations needed to reach the time target without repetitive turns.

If scope must contract, reduce the number of polished narrative variants or defer optional sound. Preserve save reliability, understandable rules, distinct strategy outcomes, and a complete three-age loop. Adding a fourth age should wait until players want to replay the first three.

## First concrete work package

The next implementation package should make the existing promises dependable: capture regression cases for cross-age building access, event costs, research duration/rewards, zero-population diplomacy, and map distribution; establish command/save boundaries; repair those cases; then test one complete Stone-to-Bronze transition and resume sequence. That package should be reviewed before the larger culture/combat/content expansion.

## Primary code references

- `src/App.tsx`: phase orchestration, local modal/result state, session randomness, research selection.
- `src/store/gameStore.ts`, `src/store/saveSchema.ts`, `src/store/metaStore.ts`: persistence and state boundaries.
- `src/logic/turnEngine.ts`, `src/logic/resourceEngine.ts`, `src/logic/populationEngine.ts`: collection, research, production, labor, building validation.
- `src/logic/ageEngine.ts`, `src/logic/runEngine.ts`: inheritance, generated worlds, initial state, final endings.
- `src/logic/eventEngine.ts`, `src/logic/choiceEngine.ts`: eligibility, weighted events, costs/losses, narrative outcomes.
- `src/logic/rivalEngine.ts`, `src/logic/combatEngine.ts`, `src/logic/effectsEngine.ts`: diplomacy, attacks, effective army and bonuses.
- `src/logic/mapGenerator.ts`, `src/game/scenes/HexMapScene.ts`: terrain distribution and map input.
- `src/data/techs/*`, `src/data/events/*`, `src/data/buildings.ts`, `src/data/legacy.ts`: content inventory and reachability.
- `src/ui/HUD.tsx`, `src/ui/TechTree.tsx`, `src/ui/BuildMenu.tsx`, `src/ui/EventCard.tsx`, `src/styles.css`: player feedback and responsive/accessibility issues.
- `tests/logic/contentRegistry.test.ts`: current graph checks and simplified research pacing assumptions.
