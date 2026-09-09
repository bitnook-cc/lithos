# Dependency maintenance — 2026-09-09

## Changes

A fresh npm audit reported six affected packages: Vite, PostCSS, nanoid and picomatch (high), plus Vitest and @vitest/mocker (moderate). Compatible updates using `npm audit fix`, without `--force`, resolved all six reported entries.

- Vite: 8.0.0 → 8.2.2; Vitest: 4.1.0 → 4.1.11. The manifest now requires at least these versions within their existing major versions.
- Patched transitive packages include PostCSS 8.5.28, nanoid 3.3.18 and picomatch 4.0.7. Related build/test dependencies were refreshed in the lockfile.
- Vite and Vitest configs now use `.mts` and URL-based source aliases, removing the CommonJS-to-ES-module warning raised by the newer tooling. The package-wide module type is unchanged.
- No gameplay rules, saves, runtime game packages or font packages were changed.

## Verification

- Clean `npm ci`: successful, with zero reported vulnerabilities at the time of verification. This is an audit result, not a security certification.
- `npm test`: all 205 tests across 22 files pass.
- `npm run build`: TypeScript and the production build pass. The existing large Phaser chunk warning remains; the test environment's existing Node `--localstorage-file` warning also remains.
- Browser smoke test using Vite 8.2.2 at `http://127.0.0.1:5190/`: the map and typography render, Research opens, Food & workers opens and closes with Escape, and reload restores the existing save. No browser warnings or errors were reported by the console check.
- The existing Marad save remained at Bronze turn 3 with food 73, materials 22, wealth 31, influence 22, seven people, one action point and research reserve 10/40. No turn, research, construction or expansion action was taken.

This was a toolchain maintenance smoke test, not a new Stone campaign, Docker verification or physical-device test.

## Next checkpoint

Run the [three independent first-player sessions](stone-age-playtest.md#three-independent-first-player-sessions), including a physical phone, before changing pacing or beginning Milestone 4. The 15–20 active minutes per age target still needs human validation.
