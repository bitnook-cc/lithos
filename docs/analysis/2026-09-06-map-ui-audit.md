# Map interaction and motion audit

## Findings and changes

The previous selected-tile outline was nearly the same gold, shape and thickness as the territory perimeter. Selecting foreign or unclaimed land could therefore look like owning it, while selecting owned land visually split a continuous country into individual cells. The guide also reused the selection marker despite not opening an inspector.

The updated visual language separates these meanings:

| State | Visual | Meaning |
| --- | --- | --- |
| Your territory | Continuous gold outer perimeter with dark contrast stroke | Already owned; internal shared edges disappear |
| Rival territory | Red outer perimeter | Another civilization owns this land |
| Selected district | Inset cyan corner brackets and matching inspector label | Inspection only; no resources spent |
| Claim preview | Dashed green inset on the selected tile, plus cost/worker explanation | A legal claim is available now, but has not happened |
| Guide target | Small cream target dot | Suggested next district, separate from selection |
| Unsurveyed terrain | Question mark | Visible, but resources have not been surveyed |

Claim eligibility includes surveying, connection to owned land, spare workers, action points, and the current decision phase. The preview shows district production without inventing unsurveyed resources or treating a worker assignment as population consumption. Rival boundaries do not merge through hidden territory.

Selection previously lived separately in React and Phaser. Closing the inspector cleared only React; recentering/resize cleared only Phaser. Selection now synchronizes explicitly, including when the map finishes loading after a player has already chosen a district. Recenter preserves selection; closing details clears it. The district selector displays the current selection.

The selected district now precedes objectives and the recap. Changes to its survey/claim/build state return its panel to the top. On phones and short landscape screens, descriptions scroll separately from fixed action buttons. Phone focus moves the selected tile into the gap beside the cultural badge and above the inspector. Tooltip production now includes the same building and district bonuses as the inspector.

Native dialogs exposed an older negative-margin icon treatment: discovery/result/feat icons were clipped, and narrow article limits left some content off-center. Icons now sit within the dialog, and articles use its available width.

## Motion implementation

- Newly revealed terrain fades in over 520 ms; a surveyed district has a 700 ms expanding cyan ring.
- A successful claim has an 800 ms green expansion pulse; the actual gold border updates immediately.
- Building completion has a 900 ms rising checkmark/ring and a named production confirmation.
- A discovery enters over 420 ms, with a brief emblem ring and staggered benefit pills. Its dismiss action is never delayed.
- District focus eases over 240 ms; dragging interrupts that movement.
- Survey, claim and build confirmations remain readable as text for 3.8 seconds and are announced through a polite live region.

Map effects are derived from accepted state transitions, held only in the scene, bounded to 80 active effects, and removed when complete. They do not change costs, turns, outcomes or persistence. New runs, age changes, reloads, restoring older states and rejected actions do not replay map celebrations. Scene shutdown removes listeners and pending effects.

The device reduced-motion preference is respected dynamically. The game menu also offers a saved Reduce motion override. Reduced motion disables canvas effects, focus movement and CSS animation while preserving confirmations, selection and ownership cues. Storage failure leaves the preference usable for the current session.

## Verification

- 187 tests across 21 files pass; TypeScript/Vite production build passes. The existing large Phaser bundle warning remains.
- New regression tests cover contiguous perimeter geometry and neighbor directions, hidden borders, claim legality across five seeds, action gating, survey/reveal/claim/build event distinctions, reload/rejection suppression and all animation duration/reduced-motion boundaries.
- Browser play exercised surveying, claiming, constructing a Gathering Site and completing Urbanism, observing the corresponding effects and resource updates.
- Checked 1280×720 desktop, 360×640 portrait and 740×360 landscape. Selection persists on recenter, clears with the inspector, and remains separate from the owned perimeter.
- Enabled the in-game reduced-motion override, surveyed and claimed with static confirmations, and verified CSS animation was disabled. Restored the original motion setting afterward. An actual OS preference toggle and physical touch-device pass remain untested.
- No browser warning/error entries were observed at the final check.

## Remaining polish opportunities

The map still represents buildings primarily through labels rather than distinctive silhouettes. District symbols and terrain art could eventually do more of that work, but changing the asset system was not needed to resolve this interaction audit. Color-vision and screen-reader testing with independent players remains worthwhile even with shape and text redundancies.
