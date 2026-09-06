# Lithos typography

- **Cinzel Variable, weight 600:** title hierarchy, age/event/discovery headings, civilization identity and settlement name in the HUD. The wordmark uses weight 500. No Cinzel Decorative.
- **Source Sans 3 Variable:** narrative, choices, controls, research lists, resource numbers and map building labels. Normal and real italic faces are included; numerical readouts use tabular figures where useful.
- Body and display stacks are defined once in `src/styles.css`; role overrides live in `src/typography.css`, loaded afterward. Most operational labels use sentence case and normal tracking. Short section eyebrows retain restrained uppercase tracking.
- Both Fontsource packages are pinned at 5.3.0. Vite bundles their WOFF2 assets locally; there are no runtime font-CDN requests. Unicode ranges let the browser request the subsets needed by the text. Upstream OFL notices are distributed in `public/licenses/` and copied into the production output.
- Phaser redraws its cached building text after Source Sans loads. Font loading never blocks gameplay; a failed font request leaves a system fallback. Map glyph markers retain a serif symbol fallback separate from building text.

Verification: production build and 205 game tests pass. Browser review covered desktop and 360×640 research layout, computed font roles, and available primary actions. Font changes do not touch saves, costs or rules.

Dependency installation also reported four existing high-severity audit entries (Vite, PostCSS, nanoid, picomatch), unrelated to the font packages. Their pinned versions were not changed in this typography revision; dependency/security maintenance remains a separate follow-up. The existing large Phaser bundle warning also remains.
