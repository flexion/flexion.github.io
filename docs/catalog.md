# Catalog

The catalog is the inventory of Flexion's open source work. Every view on the site reads from it.

## Sources

1. **`data/repos.json`** — machine-generated snapshot from the GitHub API. Rewritten daily by the refresh workflow. Fields match `GithubSnapshotEntry` in `src/catalog/types.ts`.
2. **`data/overrides.yml`** — hand-authored metadata keyed by repo name. Fields: `tier`, `category`, `featured`, `hidden`. Entries are PR-reviewed.
3. **`content/work/<slug>.md`** — optional rich copy for a repo's detail page. Front-matter supplies `title` and `summary`; the body is rendered into the page.

## Merging

`src/catalog/load.ts` reads all three, merges them through `mergeCatalog`, applies defaults (`applyDefaults`), and returns a `Catalog` array. Every view builds from this value.

## Defaults

When `overrides.yml` has no entry for a repo, defaults are derived per field. Archived takes precedence over fork for tier:

- **Category**: `fork: true` → `'fork'`; otherwise `'uncategorized'`.
- **Tier**: `archived: true` → `'archived'`; else `fork: true` → `'as-is'`; else `'unreviewed'`.

Overrides always win over either rule.

"Unreviewed" is publicly visible. It says "a human has not yet classified this repo," which is honest and actionable.

## Refresh pipeline

The `refresh-catalog` workflow runs daily at 09:00 UTC (and on manual dispatch). It:

1. Paginates `GET /orgs/flexion/repos?type=public`.
2. For each repo, checks for `README.md`, `LICENSE`, and `CONTRIBUTING.md` via the contents API.
3. Writes the result to `data/repos.json`, sorted alphabetically.
4. If the file is unchanged, exits cleanly.
5. Otherwise opens a PR on a `catalog/refresh-YYYY-MM-DD` branch and enables auto-merge. Green CI merges the PR; a human can always review and block.

## Changing overrides

Open a PR that edits `data/overrides.yml`. Typical changes: promoting a repo to `tier: active`, flagging a repo as `featured: true`, or hiding a repo temporarily while its content is being updated.
