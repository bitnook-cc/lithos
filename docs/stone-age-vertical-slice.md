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

## UI follow-up priorities

The first three priorities below are now implemented. The fourth remains a human/device acceptance check.

1. **Implemented: a compact end-turn ledger.** A persistent recap combines net resource/population changes, food production and feeding needs, research investment/ticks, the event decision, and rival news. Detailed outcomes are available on demand, including from the ending screen. It covers pressing End turn through the following collection, excluding earlier action costs and new-age bonuses. Pending and finished recaps survive reloads; older saves simply start recording on their next turn. Normal rival reports are folded into the recap rather than adding another mandatory dialog; event and discovery outcomes remain explicit.
2. **Implemented: a map legend and clearer frontier signals.** The Key control explains terrain visibility, ownership, workers, networks and story sites. It lists only symbols discovered by surveying. Visible unsurveyed tiles carry question marks. A triangle/exclamation marker and district-local text flag owned land adjacent to a visible aggressive rival whose disposition is below 20, matching the current raid eligibility rules. The legend links directly to those districts. Warnings describe a possibility, not a predicted random outcome; hidden rival borders are not exposed.
3. **Implemented: a research destination preview.** Plan a discovery opens a destination selector, defaulting to the age-defining discovery. It shows deduplicated prerequisites in a valid order, researched/available/in-progress states, the next two remaining discoveries and their benefits, and the other optional branches. Inspecting any item returns to its normal research detail; the planner does not spend resources or queue research. Independent branches can be researched in another order.
4. **Physical-device and first-time-player validation.** Test thumb reach, dialog focus with assistive technology, map gestures and reduced-motion preferences on actual devices. Viewport checks are not substitutes for these tests.

Follow-up verification: 171 tests across 20 files pass, including recap immutability/reload, research completion, starvation and age inheritance, hidden-border filtering, diplomatic warning removal, and every research destination in all three ages. TypeScript/Vite production build passes with the existing Phaser chunk warning. Browser checks exercised the legend, Escape dismissal, destination changes and research selection, a full event-to-collection cycle, exact recap totals, and recap persistence after reload. Layouts were checked at 360×640, 740×360 and 1280×720. Physical-device and screen-reader checks remain outstanding; the visible-threat logic is regression-tested, not a claim that an actual raid was manually replayed.

## Remaining acceptance gates

The September 6 acceptance UI pass adds a persisted Stone conclusion, decision/upgrade previews, a deadline-free turn display, always-visible action counts and building silhouettes. See [the current playtest checklist](stone-age-playtest.md) for implementation details, the latest 205-test verification and the three-session acceptance protocol. The map audit also verified the in-game reduced-motion override; an actual OS preference toggle remains outstanding.

This is an implementation-and-regression milestone, not a claim that alpha usability or balance is fully validated. The assessment's independent new-player checks remain outstanding. No physical touch device or screen-reader pass was performed; reduced motion was checked in CSS, not exercised with an OS preference.

The requested 15–20 minutes per age has not been validated. A practiced player can follow the critical research route quickly, and the tested guided economy became comfortable with only one outlying food district. Timed human sessions should inform optional-branch incentives, competing uses of action points, mid-age challenges and event repetition before raising costs. Two collections per discovery prevents instant research, but does not itself ensure the desired play time.

Broader rival behavior, meaningfully distinct cultural strategies, and later-age balance remain follow-on alpha work. Bronze and Classical benefit from shared UI and inherited-economy fixes but have not received the same manual playthrough depth as Stone in this revision.
