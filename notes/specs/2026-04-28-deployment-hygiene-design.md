# Deployment Hygiene

Status: Design approved, awaiting implementation plan
Date: 2026-04-28

## Motivation

The deploy workflow has four rough edges that surfaced right after the first merge to `main`:

1. A `delete` event (branch cleanup) cancelled the `main` deploy triggered by the same merge, leaving `labs.flexion.us` stale.
2. The `CNAME` file is missing from `gh-pages` after main deploys, so `labs.flexion.us` returns 404 while `flexion.github.io` serves the site.
3. All branch previews share a single `preview` environment, so GitHub's Deployments UI can't be used as navigation to per-branch preview state, and there's no per-branch log separation.
4. When a branch is deleted, its `preview` deployments stay marked `success` indefinitely, even though the preview URL has been removed from `gh-pages`.

This spec fixes the bugs, makes GitHub's Deployments UI the canonical way to navigate previews, and keeps deployment status honest.

## Root cause of the missed `main` deploy

The workflow's concurrency group is `deploy-${{ github.ref }}` with `cancel-in-progress: true`. For `delete` events, GitHub reports `github.ref` as the default branch (`refs/heads/main`), because the deleted branch ref no longer exists. When PR #2 merged:

- Run A: `push` to `main` (the merge commit) — concurrency group `deploy-refs/heads/main`.
- Run B: `delete` event for `feat/initial-build` — concurrency group `deploy-refs/heads/main`.

Run B started 3 seconds after Run A and cancelled it. `labs.flexion.us` never got the merged content until a manual redeploy.

## Root cause of the missing `CNAME`

The `publish` job never checks out the source repo — it only checks out `gh-pages` and downloads the `dist/` artifact. The current workflow tries to paper over this at lines 115-117 of `deploy.yml`:

```bash
if [ ! -f CNAME ]; then
  cp ../CNAME . 2>/dev/null || true
fi
```

There is no `../CNAME` because the source-repo checkout never happened. The copy silently fails due to `|| true`. Meanwhile, the main-deploy path wipes the root of `gh-pages` (`find . -mindepth 1 -maxdepth 1 ! -name '.git' ! -name 'preview' -exec rm -rf {} +`) before copying `dist/` in — so `CNAME` is removed on every main deploy and never restored.

Confirmed by inspection: `git ls-tree origin/gh-pages` has no `CNAME` blob; `gh api repos/flexion/flexion.github.io/pages` returns `"cname": null`.

## Design

### 1. Branch-keyed concurrency group

Key the concurrency group on the *branch being acted on*, not on `github.ref`. For `delete` events, that's `github.event.ref` (the deleted branch); for everything else, `github.ref_name`:

```yaml
concurrency:
  group: deploy-${{ github.event_name == 'delete' && github.event.ref || github.ref_name }}
  cancel-in-progress: true
```

Effect per branch:

- `push` to `main` and `workflow_dispatch` on `main` → same group (`deploy-main`) → serialized, preventing two runs from pushing to `gh-pages` at once.
- `push` to `feat/foo` and `delete` of `feat/foo` → same group (`deploy-feat/foo`) → a delete correctly cancels a still-building preview for the same branch.
- `delete` of `feat/foo` and `push` to `main` → different groups → no collision (the bug we hit today).

### 2. Allow `workflow_dispatch` to publish

The `publish` job is gated on `github.event_name == 'push'`. That makes `workflow_dispatch` builds but doesn't publish — a recovery footgun we already hit today. Change the gate to:

```yaml
if: github.event_name == 'push' || github.event_name == 'workflow_dispatch'
```

`workflow_dispatch` works on any branch and will publish to whichever environment the branch's metadata computes (`production` for main, `preview/<branch>` otherwise). The common case is triggering it on main to recover from a failed or cancelled deploy.

### 3. Per-branch preview environments

Non-main pushes deploy to environment `preview/<sanitized-branch>`. Main continues to use `production`. Concretely, in the `publish` job:

```yaml
environment:
  name: ${{ needs.build-and-test.outputs.is_production == 'true' && 'production' || format('preview/{0}', needs.build-and-test.outputs.branch) }}
  url: ${{ needs.build-and-test.outputs.is_production == 'true' && 'https://labs.flexion.us/' || format('https://labs.flexion.us/preview/{0}/', needs.build-and-test.outputs.branch) }}
```

The `branch` output is already sanitized in the `Determine deploy metadata` step (`tr '/' '-' | tr -cd 'a-zA-Z0-9._-'`). GitHub auto-creates the environment on first use.

Effect: every branch gets its own entry in the repo's Deployments UI and its own "View deployment" button on PRs. No bot comment needed — the native UI is the navigation.

### 4. Deactivate deployments and delete the environment on branch delete

Extend the existing `cleanup-preview` job. After removing the preview directory from `gh-pages`, it also:

1. Lists deployments for `environment=preview/<branch>` via `GET /repos/{owner}/{repo}/deployments`.
2. For each, marks it `inactive` via `POST /repos/{owner}/{repo}/deployments/{id}/statuses` with `state=inactive`. This is the same pattern GitHub's own Pages integration uses, and it removes the stale "active deployment" indicator from the UI.
3. Deletes the environment via `DELETE /repos/{owner}/{repo}/environments/{environment_name}`. URL-encoding note: `/` in the environment name (`preview/foo`) must be encoded as `%2F`.

All calls use `gh api` with the existing `GH_TOKEN`. Requires `deployments: write` (already granted) and `administration: write` (new — needed for the environment delete; added to the job's `permissions:` block). Each step is idempotent.

If the branch had no preview deployments (e.g., deleted before any deploy completed), the list is empty and the environment may not exist — both cases no-op cleanly with `|| true` on the delete.

### 5. Include `CNAME` in the build output, not the workflow

Make `CNAME` part of the build's output, so it travels with the `dist/` artifact and lands in `gh-pages` naturally. Two parts:

1. In `src/build/entry.tsx`, when doing a production build (i.e., `basePath === '/'`), copy `CNAME` from `rootDir` to `outDir`. Previews — which publish to a subdirectory like `gh-pages/preview/<branch>/` — should *never* include a CNAME.
2. In `deploy.yml`, delete the now-dead "copy CNAME if missing" step (lines 115-117).

Why this and not "just check out the source repo in `publish`": putting `CNAME` in `dist/` means "what got built is what gets deployed," which keeps the artifact self-contained and testable locally. The workflow stops having domain-specific knowledge about files that don't originate there.

Unit test: `buildSite` with `basePath: '/'` writes `CNAME` to `outDir`; with `basePath: '/preview/foo/'` it does not.

### 6. Out of scope

- **Node.js 20 action deprecation warnings** (`actions/checkout@v4`, `actions/upload-artifact@v4`, `actions/download-artifact@v4`). The forced Node.js 24 cutover is June 2026; address separately.
- **Bot comments on PRs.** GitHub's native Deployments UI surfaces the preview URL on PRs; a bot comment would be redundant.
- **Changing the `gh-pages` publishing mechanism** (e.g., switching to the GitHub Pages deploy action). Current approach works and is orthogonal to this cleanup.

## Risks and mitigations

- **First delete after this lands may leave behind a stale `preview` environment** (the shared one from before this change). Plan to delete it manually once after merge.
- **Branch names with unusual characters.** Sanitization already strips them; the environment name uses the sanitized form.
- **Racing a push and a delete on the same branch.** Both are in the same group (`deploy-feat/foo`) so the delete will cancel an in-flight preview build — correct, since the branch is going away anyway.
- **Racing a delete and a main push.** Different groups, so both run. `cleanup-preview` removes the preview directory from `gh-pages` while `publish` on main pushes its own commit — the `gh-pages` working tree may race. Mitigated by the existing `git push` which will fail on non-fast-forward; a retry or a job-ordering check can be added if we see flakes, but this is rare (happens only when merging + deleting a branch in the immediate window of a main push already in flight) and out of scope for now.

## Verification

After merge, validate on a throwaway branch:

1. Push the branch → confirm a new `preview/<branch>` environment appears in the repo's Deployments UI with a working URL.
2. Open a PR → confirm the PR page shows a "View deployment" button pointing to the preview.
3. Merge (or delete) the branch → confirm:
   - The preview URL 404s (directory removed from `gh-pages`).
   - Deployments for that environment show `inactive` status.
   - The environment no longer appears in the Deployments sidebar.
4. Confirm a subsequent push to `main` still deploys (no concurrency collision with the cleanup run).
5. Confirm `labs.flexion.us/` serves the site (HTTP 200, not 404); confirm `gh api repos/.../pages` returns `"cname": "labs.flexion.us"`.
6. Confirm preview URLs do not carry `CNAME` into their subdirectory (`dist/CNAME` exists only in production builds).
