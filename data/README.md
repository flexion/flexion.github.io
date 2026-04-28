# Catalog

The catalog is the inventory of Flexion's open source work. It drives every view on `labs.flexion.us`.

## Files

- `repos.json` — a machine-generated snapshot from the GitHub API. Rewritten daily by the `refresh-catalog` workflow.
- `overrides.yml` — hand-authored metadata keyed by repo name. Each entry may set `tier`, `category`, `featured`, and `hidden`.

## Fields

See `src/catalog/types.ts` for the canonical type. The fields that humans set are described in `docs/catalog.md`.

## Refresh cadence

The `refresh-catalog` workflow runs daily at 09:00 UTC. If the resulting snapshot differs from the committed one, it opens a PR. If CI is green, the PR auto-merges.
