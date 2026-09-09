# Connected research tree

Research now uses the real prerequisite graph rather than a card list. This is a directed acyclic graph (some discoveries have multiple parents), not an ARIA tree widget with a single-parent hierarchy.

- Columns follow prerequisite depth. Invisible routing slots carry long links through intermediate columns without crossing cards. Every discovery and prerequisite remains present in all three ages.
- Selecting a discovery traces all its ancestors in gold. Solid connectors mean their prerequisite is discovered; dashed connectors still need work. All incoming requirements must be met.
- Nodes distinguish available, locked, researching and discovered states with text as well as colour. Age unlocks have a double border. Existing knowledge, saved project progress and collection estimates are displayed; this is not a research queue.
- Scroll/touch-pan or mouse-drag the background. Zoom buttons change the view, Fit tree gives an overview, and Find selected recentres it. Selecting a node from a small overview returns to readable size. CSS layout zoom keeps node text browser-rendered rather than scaling a canvas texture.
- Native buttons support Tab, Enter and Space. Arrow Left/Right moves to prerequisites/successors; Up/Down moves through peers in the same column. Accessible names include status, progress and named prerequisites. The SVG is decorative to assistive technology.
- Available highlighting dims other nodes without removing graph context. The planner and detail prerequisite buttons select and reveal their target in the graph.
- Phone layouts put the scrollable graph above a compact detail panel with a persistent research action. The graph does not enlarge the page horizontally. Motion preferences govern transitions and smooth recentering.

## Verification

Automated checks cover every node and edge in Stone, Bronze and Classical, non-overlapping cards, long-link routing slots, stable layout after research completion, converging prerequisite paths, invalid graphs and directional keyboard navigation. Browser checks cover the Stone tree, full overview, Dawn of Bronze's five highlighted prerequisite links, keyboard navigation, active research, and usable controls at 1280×720, 360×640 and 740×360. No browser console warnings or errors were reported during the check.

No technologies, prerequisites, costs, effects or research duration rules were changed.
