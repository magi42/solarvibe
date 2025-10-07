# Repository Guidelines

## Project Structure & Module Organization
Use the standard Astro layout so every teammate can find code quickly. Place routable pages in `src/pages/`, shareable view logic in `src/components/`, and cross-page shells in `src/layouts/`. Keep domain-specific utilities under `src/lib/` and keep public-facing static assets in `public/` (images within `public/img/`, fonts under `public/fonts/`). Configuration files such as `astro.config.mjs`, `tsconfig.json`, and `package.json` stay at the project root for predictable tooling discovery.

## Build, Test, and Development Commands
Run `npm install` once per clone to hydrate dependencies. Use `npm run dev` for the hot-reloading development server, `npm run build` to emit the production artifact in `dist/`, and `npm run preview` to validate the built output locally. Execute `npm run lint` before pushing to catch formatting and quality issues early.

## Coding Style & Naming Conventions
We target TypeScript-first Astro components. Stick to two-space indentation, trailing commas, and single quotes, all enforced by Prettier. Components and layouts use PascalCase (`PlanetCard.astro`); utilities and hooks use camelCase (`calculateOrbit.ts`). Co-locate styles with components when scoped, otherwise use `src/styles/` with meaningful filenames. Run ESLint through `npm run lint` to ensure imports, accessibility, and unused code rules stay clean.

## Testing Guidelines
Author unit and component tests with Vitest inside `tests/` mirroring the source tree (`tests/components/PlanetCard.test.ts`). Snapshot tests should be regenerated only when UI changes are intentional. Aim for >80% coverage on critical planetary simulation modules; run `npm run test` locally and include the summary in your PR description. Integration or visual testing can live under `tests/integration/` using Playwright when behavior spans multiple routes.

## Commit & Pull Request Guidelines
Follow Conventional Commits (`feat:`, `fix:`, `refactor:`, etc.) so changelog automation remains accurate. Keep commits focused and include short body bullets when explaining breaking changes or non-obvious decisions. Pull requests need a clear problem statement, a concise walkthrough of the solution, and notes on testing performed; attach screenshots or GIFs when UI updates occur. Link to tracking issues with `Closes #ID` syntax and request review once linting and tests pass.
