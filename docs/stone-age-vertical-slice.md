# Stone Age vertical slice — Milestone 3

## What this revision delivers

The first run now has a guided, skippable opening with a persistent objective on the map. It teaches the actual command loop: inspect food, survey, claim, research Survival over multiple collections, build a Gathering Site, and resolve The First Harvest. Guided generation guarantees the highlighted fertile/grain district and adds eight starting food. Unguided starts retain the normal procedural opening. Existing saves do not unexpectedly enter the tutorial.

The guide survives reloads and does not lock other actions. First Harvest offers generosity, storage, and inquiry choices with resource and cultural consequences. Every Stone Age event now has a descriptive title and category. The technology counts remain 14 Stone, 18 Bronze, and 22 Classical; no technologies were removed for this slice.

Milestone 2's systems are now visible: the food/worker ledger separates district production, global bonuses, consumption and net food; starvation estimates explicitly assume unchanged population and production. Dormant districts explain staffing, and worker priority costs one action. Research shows current income, reserve, costs, retained investment, the two-collection minimum, prerequisites and estimated completion time. The next-age introduction explains what survives and displays inherited outlying districts, buildings, discoveries and total food production.

## UI review and implemented improvements

The main usability problems were hidden economic causes, actions separated from their target, and a research canvas that was difficult to navigate on a phone. The revision addresses these with:

- A persistent next objective beside the selected district, with an explicit next-action button.
- District-local actions showing action/resource costs and reasons construction is unavailable.
- Clickable, labeled resource chips opening a production ledger instead of requiring players to infer the economy.
- A responsive discovery library and detail panel with clickable prerequisites. Detail text scrolls independently of its primary action, keeping research reachable on short screens.
- Native modal dialogs and real buttons for events, construction, diplomacy and outcomes. Optional dialogs support Escape; mandatory decisions cannot be accidentally dismissed. Native dialogs provide focus containment and background inertness.
- Visible zoom/recenter controls and a native visible-district selector as an alternative to pointer-only map navigation.
- Compact phone layouts, a landscape HUD correction, and the existing reduced-motion CSS fallback.

The cultural banner remains prominent. First Harvest makes the relationship between a choice and that evolving identity part of the opening, rather than introducing culture only in the civilization panel.

## Verification performed

- `npm test`: 158 tests passing across 19 files.
- `npm run build`: TypeScript and production bundle pass. The existing large Phaser chunk warning remains.
- Five legal-command guided runs (seeds 11, 37, 71, 99, 137) reach Bronze. Every command is compared with the same command after save/reload. No artificial resource injection is used in these runs.
- Regression coverage includes project switching, high research income, the two-collection floor, both age transitions, worker recovery, starvation timing, 50 map seeds, and legacy/Milestone 1 save migration.
- Actual browser play completed the six-step guide and then reached Bronze on Stone turn 15. The Gathering Site and six discoveries survived; Bronze began with positive net food. Reloading during research and on the Bronze introduction preserved the pending state.
- Browser inspection covered desktop 1280×720, portrait 360×740 and 360×640, and landscape 740×360. Keyboard event choices, notice confirmation, Escape on the ledger, district selection, and zoom/recenter were exercised. The phone research action remained within the viewport without horizontal page overflow. No browser warning/error entries were observed at the final check.

The browser findings led to fixes during implementation: the guide now says to end turns while research is pending; unavailable construction explains missing methods; landscape resources no longer collide; the research action stays outside the scrolling description; selected map districts are centered away from the cultural banner.

## Recommended next UI work, in priority order

1. **A compact end-turn ledger.** Summarize food change, research progress, population change and rival activity together. This would connect cause and effect without asking players to remember several separate notices. Preserve detailed outcomes on demand.
2. **A map legend and clearer frontier signals.** Explain deposits, landmarks, dormant workers and rival borders on first use, and distinguish surveyed from merely visible terrain without relying only on color. Rival intent deserves a visible warning near the affected district.
3. **A research destination preview.** Let players inspect the prerequisite route to Dawn of Bronze and preview the next two useful unlocks. Keep optional branches equally discoverable; avoid presenting the shortest route as the only correct strategy.
4. **Physical-device and first-time-player validation.** Test thumb reach, dialog focus with assistive technology, map gestures and reduced-motion preferences on actual devices. Viewport checks are not substitutes for these tests.

## Remaining acceptance gates

This is an implementation-and-regression milestone, not a claim that alpha usability or balance is fully validated. The assessment's independent new-player checks remain outstanding. No physical touch device or screen-reader pass was performed; reduced motion was checked in CSS, not exercised with an OS preference.

The requested 15–20 minutes per age has not been validated. A practiced player can follow the critical research route quickly, and the tested guided economy became comfortable with only one outlying food district. Timed human sessions should inform optional-branch incentives, competing uses of action points, mid-age challenges and event repetition before raising costs. Two collections per discovery prevents instant research, but does not itself ensure the desired play time.

Broader rival behavior, meaningfully distinct cultural strategies, and later-age balance remain follow-on alpha work. Bronze and Classical benefit from shared UI and inherited-economy fixes but have not received the same manual playthrough depth as Stone in this revision.
