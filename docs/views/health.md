# Repo health (`/work/health/`)

## Purpose

Transparency surface. Publicly reports how each repo measures up to Flexion's stewardship standards.

## Inputs

- `catalog` — the merged catalog.
- `now` — current time, for the activity check.
- `config` — base path, build time.
- `showPerRepo` — `SHOW_PER_REPO_FAILURES` from `standards/repo-checks.ts`.

## Behavior

- **When the page loads, then** the summary line reads `N of M repos meet the documented standards`, where `M` is the number of non-hidden repos and `N` is the count passing every check.
- **When `showPerRepo` is true, then** a table renders with one row per non-hidden repo and one column per check. Each cell carries a `health-cell--<result>` class reflecting `pass`, `warn`, or `fail`.
- **When `showPerRepo` is false, then** the table is absent and a short paragraph explains that per-repo details are hidden.
- **When a repo has `tier: archived`, then** the activity check passes regardless of `pushedAt`.
- **When a repo has `tier: unreviewed`, then** the tier-assigned check fails.

## Fallbacks

- No JavaScript → the table renders in the default server-side sort (snapshot order). With JavaScript, the `<sortable-table>` component turns column headers into sort controls.

## Tests

`tests/views/health.test.tsx` and `tests/enhancements/sortable-table.test.ts`.
