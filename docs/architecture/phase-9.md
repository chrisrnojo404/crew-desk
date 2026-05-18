# Phase 9 - Testing and Optimization

Phase 9 adds the first repeatable quality gate for Crew Desk and extracts high-risk reporting calculations into a testable business logic module.

## Testing Strategy

- `npm run typecheck` validates strict TypeScript contracts and Next.js typed routes.
- `npm run lint` runs the repository ESLint rules.
- `npm run test:run` executes Vitest unit tests.
- `npm run build` verifies the production Next.js bundle.
- `npm run quality` runs the complete local quality gate in sequence.

## Current Automated Coverage

The first unit tests cover reporting analytics because it aggregates data across inventory, Gear Desk, leave, production, and notifications. The calculation layer is now separated from Directus fetching:

- `src/features/reports/lib/analytics.ts` contains deterministic KPI and module health calculations.
- `src/features/reports/lib/analytics.test.ts` validates KPI totals, overdue checkout detection, utilization percentage handling, and module health statuses.

## CI Readiness

GitHub Actions runs the same quality checks on pushes and pull requests to `main`:

1. Install dependencies with `npm ci`.
2. Run TypeScript checks.
3. Run lint.
4. Run Vitest.
5. Run the production build.

## Optimization Notes

- Cross-module report calculations now execute in a pure function, reducing server component complexity and making future caching safer.
- Directus calls in the reporting server remain parallelized with `Promise.all`.
- Report calculations accept an injectable `now` date for deterministic tests and future scheduled KPI snapshots.
- Coverage output is configured for future local reporting through Vitest.

## Security and Dependency Follow-Up

`npm install` currently reports two moderate dependency audit findings. Do not force-upgrade automatically without reviewing the dependency chain and testing Next.js compatibility. Track this as a security maintenance item before production deployment.
