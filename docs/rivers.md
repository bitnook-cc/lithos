# Rivers: drainage and rendering

## Generated geography

`riverGeneration.ts` produces complete, directed, non-branching source-to-water paths. Sources are hills or mountains outside the protected opening ring. The generator first searches existing downhill routes; a fallback can incise a shallow channel (at most 0.12 normalized elevation per land tile). Before accepting a path it checks that every step descends, that the water surface is unchanged, and that the destination is water or ice. Dry land boundaries, deep trenches and unfinished paths are rejected. River count is a placement target, not a reason to force invalid drainage.

Connected water touching the original map boundary is classified as ocean; enclosed water is classified as lake. Existing water-body identities survive map expansion. This is a small-map geographic convention, not a global sea-level or flooding simulation. Depressions without an acceptable shallow outlet do not receive a river in this pass.

The generator records `riverDownstream` alongside reciprocal `riverEdges`. New fields are optional in the save schema. Loading a legacy save does not regenerate terrain or reroute old rivers; old dry endpoints can therefore remain. Legacy paths still receive the spline renderer.

Age expansion now installs inherited geography before generating new drainage. Existing districts are excluded from new routes, so their channels, source and mouth positions, and widths remain unchanged. Tributaries joining inherited rivers are deliberately not supported yet.

## Visual geometry

`riverGeometry.ts` traces whole saved paths, independently of visibility. Each shared hex edge has one deterministic crossing point and one shared tangent. Connected cubic Bézier curves bend through offset interior anchors; all controls stay inside the owning convex hex, preventing curves from overshooting into unrelated districts. Highland bends are restrained and lowland bends broader.

`riverRenderer.ts` samples those curves into layered, rounded strokes: a subdued bank, blue-green water and a fine highlight. Channels taper from narrow headwaters to wider downstream sections. Mouths widen and fade into receiving water. Buildings, territory outlines and selection remain above rivers. Hidden-tile masks cover the stroke at fog boundaries; revealing tiles neither changes existing bends nor exposes the hidden channel.

No animation, new dependency, river production bonus, cost change or flood mechanic is included. Tributaries, flow accumulation, deltas and optional reduced-motion-aware current animation are follow-ups.

## Verification

- 213 tests across 24 files pass; TypeScript and production build pass. Existing Phaser bundle-size and Node local-storage warnings remain.
- Drainage invariants checked over 300 seeded maps (37, 61 and 91 tiles).
- Both age transitions checked for 30 lineages, including unchanged inherited spline geometry and no mutation of the previous state.
- Spline controls and samples checked against their owning hexes over 50 seeds; joins checked for matching positions, tangents and widths.
- New save metadata round-trips; legacy terrain and connections survive loading unchanged.
- Browser atlas: seed 42, Stone and inherited Classical worlds, source/lake/ocean endpoints, and fog toggle. Preview and actual game checked at 1280×720 and 360×640; isolated game selection, survey/claim preview and reload exercised. Console checks returned no errors or warnings. This is not a physical-phone or full-campaign playtest.

## Reusable visual check

With the normal development server running, open `/river-preview.html`. Choose a seed and age, or toggle full visibility. The atlas uses the actual map generator, age transitions and renderer but does not read or write game saves. It is a development-only entry, excluded from the standard production build.
