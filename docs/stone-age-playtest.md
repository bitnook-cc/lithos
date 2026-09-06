# Stone Age slice: acceptance playtest

## Delivered in this pass

- The HUD shows the actual turn, without the unenforced `/18` deadline. The action dock keeps an explicit action count on portrait and short-landscape screens.
- Dawn of Bronze opens a Stone conclusion with actual population, land, buildings, discoveries, cultural values and recorded decisions. Details scroll independently of Continue / Play again.
- The conclusion reuses the persisted advancement notice. Reloading remains at the conclusion; continuing uses the existing deterministic Bronze transition. Replay requires confirmation, offers an export first, and explains that it replaces this lineage without recording a full-campaign victory.
- Choice previews show base resource changes after costs/caps, cultural direction, army changes and named rewards. Costs remain separate. Random outcomes are marked uncertain without revealing or rolling their results. Known fatal choices warn explicitly.
- Construction shows old → new staffed district production and the incremental army change, including bonuses lost when replacing a building. Unaffordable options name the missing resources.
- Map buildings have geometric silhouettes by role. Selected-building and settlement labels take priority; other names appear on zoom-in only where they fit. Exact names remain in district details. Surveyed features remain visible alongside the building symbol.
- Decision/production text is larger, and map controls have taller hit targets. These are improvements, not an accessibility certification.

## Verification

205 tests across 22 files pass. TypeScript and production build pass; the existing large Phaser bundle warning remains. The new tests cover deterministic previews, caps/floors, uncertainty, fatal losses, upgrade deltas, summary accuracy, persisted transition/reload and exactly-once continuation.

An isolated browser origin on port 5191 kept the existing port-5190 save untouched. A fresh guided run reached the conclusion at Stone turn 14, with six people, two owned districts, two buildings including the capital, six discoveries, and +2 net food per turn. All actions used the normal interface; no resources or research progress were injected. The conclusion and subsequent Bronze introduction both survived reload. Bronze inherited the outlying Gathering Site and six discoveries. Replay confirmation and cancellation were exercised; destructive confirmation was not manually clicked.

Browser layouts checked: 360×640, 740×360, 1280×720. Event and construction previews were inspected on portrait; ending actions remained within the viewport on portrait and landscape; the landscape action count remained visible; the phone map had no horizontal page overflow. These checks do not replace real touch, screen-reader or OS reduced-motion testing.

The run again suggests that one outlying food district can sustain the guided middle game. It is not evidence that every seed is safe, nor a timed first-player pacing measurement. Costs and event balance were deliberately unchanged.

## Three independent first-player sessions

Use three people who have not watched development. At least one should use a physical phone. Let them use the guide, but do not coach unless they have been stuck for two minutes; record every intervention. Start timing when entering Stone and stop at its conclusion. Record pauses separately. Do not enforce a 20-minute cutoff.

| Session | Device/browser | Guided? | Active minutes to conclusion or loss | Ending turn | Help needed | Turns with no meaningful action beyond research waiting |
| --- | --- | --- | --- | --- | --- | --- |
| A | | Yes | | | | |
| B | | Yes | | | | |
| C | | Player choice | | | | |

Observe these tasks without supplying the answer:

1. Explain whether the opening food economy is sustainable and what to do next.
2. Select, survey and claim a district. Explain which outline means ownership and what a claim costs.
3. Choose and complete research; explain why a fully funded discovery may still need a collection.
4. Compare two available event choices using costs, culture and risk. If an upgrade is available, explain its net benefit.
5. Decide what to do after building the first food district. Record why optional research, another settlement or exploration was chosen—or ignored.
6. Reload during research and at the conclusion. Continue into Bronze, or deliberately choose replay after reading the warning.

Afterward ask: When did you feel you had a real choice? When did you just press End turn? What kind of people did you create? What did you think `Turn N` meant? Did the Stone conclusion feel like an ending?

## Acceptance and follow-up decisions

- No save loss, softlock, accidental replay, or unreachable primary action.
- Players distinguish selection from ownership and can explain their food balance without intervention after the guide.
- Target 15–20 active minutes per age; record both shorter and longer sessions and their causes. Do not use artificial delays to hit the target.
- If at least two sessions report an empty middle, prototype one mid-age dilemma with competing uses of surplus, AP and exploration. Compare against these sessions before increasing research costs or adding more technologies.
- If longer sessions are mainly spent searching for controls or reading unclear rules, fix that friction before adding more decisions.

## Physical-device and accessibility checklist

- Portrait/landscape rotation: action count, chosen tile, inspector and modal primary buttons stay usable.
- Tap versus drag: a deliberate drag does not claim/select accidentally; releasing outside the canvas stops dragging. Test zoom buttons and native district selector, not just a mouse wheel.
- Text remains readable at normal distance; inspect large-text/browser zoom separately from viewport resizing.
- Keyboard: clear focus, no background interaction while a dialog is open, optional dialogs close with Escape, mandatory outcomes remain until acknowledged.
- Screen reader: resource totals, chosen district, costs, disabled reasons, outcome uncertainty, completion status and replay warning are understandable without the canvas.
- OS reduced motion, both on load and toggled while playing: no movement required to understand success, no blocked controls. Also exercise the in-game override.
- Color-vision check: identify borders, selection, claim preview and dormant districts using shape and text as well as color.

Record failures with device, viewport/orientation, visible turn, steps and an exported save when useful. No independent-player, physical-phone, screen-reader or OS preference pass has been claimed for this revision.
