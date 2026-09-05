# Milestone 1: trustworthy rules and saves

Implemented against the acceptance gate in the alpha assessment. This milestone changes correctness and persistence, not the age pacing or overall economy.

## Application boundary

`src/logic/commandEngine.ts` is the pure command boundary. The Zustand store supplies the currently unlocked perks, saves accepted results, and synchronizes legacy progression after the run save succeeds.

- Survey, expand, investigate, build, research, diplomacy, end-turn, and event choices validate their phase and relevant targets, prerequisites, AP, or costs before committing state.
- Rejected commands return the original state without consuming resources, AP, or randomness.
- Event choices identify both the active event and a real choice; dismissals identify the first pending notice. Stale clicks cannot apply rewards or transitions again.
- Automatic collection, event selection, rival turns, and turn changes resolve synchronously until a decision or pending notice is reached.
- Defeat is checked before automatic processing and after actions/rewards. Losing the final person through diplomacy ends the run immediately.
- React owns panel selection and rendering, not simulation advancement. Result, discovery, age-introduction, and feat notices live in the saved run.

The random cursor advances only for accepted commands that draw randomness. Generated worlds and leaders use seeds derived from that cursor. The same starting seed, perks, and commands reproduce the same domain state. Compatibility is scoped to the save's content version.

## Content corrections

No technologies were removed: the trees remain 14 / 18 / 22 discoveries.

- Existing Stone discoveries now grant Painted Warriors, Ancestor Blessed, and Spirit Walkers where appropriate, making their event alternatives reachable.
- Tool Crafting unlocks the sand quarry; Herbalism unlocks peat harvesting.
- The Stone drought alternative uses contemporary Artisans and lined carriers instead of requiring Bronze pottery.
- Landmark tags and leader traits already granted by events now have definitions.
- Obsolete references to missing chain events were removed; existing flag-driven follow-ups remain.
- Researching an upgraded building also unlocks its prerequisite construction methods. This repairs stranded Bronze upgrade paths without introducing Milestone 2's persistent discovery redesign.
- Voluntary payments use positive `choice.cost` values and must be affordable before any benefits are applied. Negative resource effects represent losses, clamp at zero, and report the amount actually lost. The tin-road event has an unpaid fallback.

`validateContent()` checks research cycles/missing prerequisites, building references and age availability, upgrade bases and terrain compatibility, tag reachability by age, tag/trait/perk/feat references, choice IDs, payments, random weights, chain references, and unpaid event fallbacks. These are structural checks, not proof that all mutually exclusive paths can coexist in one playthrough or that terrain is balanced.

## Save format and recovery

| Data | Current key | Migrated key |
| --- | --- | --- |
| Run | `lithos_run_v3` | `lithos_run_v2` |
| Legacy progression | `lithos_legacy_v2` | `lithos_legacy_v1` |

Run envelopes contain `version: 3`, `contentVersion: "2026-09-06-milestone-1"`, and `state`. Legacy envelopes use version 2. Saved state is validated structurally and against relevant content references; current discovery definitions replace serialized definitions without replaying earned effects.

The prior raw v2 run shape is migrated when its discovery IDs still map to current content. Its original storage key remains untouched. Older pending result screens were not saved: migration presents an explicit explanatory notice while retaining the already-applied outcome. Legacy random state was also absent, so deterministic continuation starts at migration; it cannot reproduce the old unsaved random stream.

Each repository retains a `_backup` of the previous valid save. Malformed current bytes are retained under `_recovery` before replacement, including earlier recovery data. A readable backup can be recovered automatically; otherwise setup shows a visible warning without deleting the unreadable save. Unsupported versions/content remain available for export rather than being guessed at or discarded.

Storage denial, quota failures, and validation failures produce a visible banner. The player can export current progress plus retained raw copies, retry saving, or explicitly confirm restoration of the previous run save. Export is also available from the game menu. Exported JSON is a recovery/support artifact; a general file-import UI is not included in this milestone.

Legacy run summaries are deduplicated by persisted run ID, so reloading a finished run or acknowledging its remaining notices does not count another completion. Existing `runRecorded` markers from old saves are honored.

## Verification

- `npm test`: 141 tests pass across 17 files.
- `npm run build`: TypeScript and production build pass. The existing large Phaser chunk warning remains.
- Regression coverage includes invalid commands, payments, final-person diplomacy loss, zero-population collection, hidden/rival landmarks, Bronze base-to-upgrade construction, RNG continuation, every phase, discovery-result turn handling, three age transitions, victory/feat idempotence, migration, corruption, retained backups, unavailable storage, and quota failures.
- Browser smoke test on a separate localhost origin: new lineage, reload during age introduction, research selection, reload during event choice and event result, explicit food payment, and reload during research completion. Resources and pending messages remained consistent; no save warning appeared.

The three-age regression uses constructed phase fixtures; it is not a claim of a full human-paced campaign playthrough. Research duration floors, reward/progress unification, inherited discoveries, terrain balancing, and recovery controls remain Milestone 2.
