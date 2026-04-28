# Deployment Hygiene Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix four deployment issues on `labs.flexion.us`: main-deploy cancellation from branch-delete events, missing `CNAME` on `gh-pages`, shared-preview-environment surfacing problems, and stale preview deployments after branch delete.

**Architecture:** Two coordinated changes. (1) In the build driver (`src/build/entry.tsx`), copy `CNAME` into `dist/` on production builds so the artifact is self-contained. (2) In `.github/workflows/deploy.yml`, rekey concurrency on the acted-on branch, allow `workflow_dispatch` to publish, use per-branch preview environments (`preview/<branch>`), and extend the cleanup job to deactivate deployments and delete the environment on branch delete.

**Tech Stack:** Bun + TypeScript (build driver), GitHub Actions YAML, `gh api` (for deployment status / environment deletion).

**Plan location convention:** Per user preferences, this plan is saved to `notes/plans/` rather than `docs/superpowers/plans/`. Ephemeral planning lives in `notes/`; durable behavioral docs live in `docs/`.

---

## Conventions

- **Every task ends with a commit.** Small, focused commits. Conventional-commit-ish prefixes (`feat`, `fix`, `test`, `ci`, `docs`).
- **TDD order within each task:** write failing test → run it to confirm failure → minimal implementation → run test to confirm pass → commit. Tasks that change only the workflow YAML (no unit-testable surface) skip the failing-test step and are validated end-to-end in Task 7.
- **Test runner:** `bun test`, via `/Users/danielnaab/.bun/bin/bun` if `bun` is not on PATH.
- **File paths are absolute from the worktree root** (the worktree is `/Users/danielnaab/src/flexion.github.io/.worktrees/deployment-hygiene`). Tests reference `src/` paths as in the existing codebase.
- **Never skip hooks.** Never `--no-verify`.

---

## File Structure

```
/
  .github/workflows/
    deploy.yml        # modified in Tasks 2–5
  src/build/
    entry.tsx         # modified in Task 1 (CNAME copy)
  tests/build/
    cname.test.ts     # created in Task 1
  notes/specs/
    2026-04-28-deployment-hygiene-design.md  # already present (committed with spec)
  docs/
    deployment.md     # updated in Task 6
```

One new file (`tests/build/cname.test.ts`). All other changes are modifications.

---

## Task 1: Copy CNAME into dist/ on production builds

**Why:** The `publish` job doesn't check out the source repo, so its `cp ../CNAME .` fallback silently fails. Making `CNAME` part of the build output keeps the deployed artifact self-contained.

**Files:**
- Test (create): `tests/build/cname.test.ts`
- Modify: `src/build/entry.tsx` (add CNAME copy after line 75's `copyTree` call)

- [ ] **Step 1.1: Write the failing test**

Create `tests/build/cname.test.ts`:

```typescript
import { describe, test, expect, beforeAll } from 'bun:test'
import { buildSite } from '../../src/build/entry.tsx'
import { mkdtempSync, existsSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

describe('CNAME handling in build output', () => {
  test('production build (basePath /) copies CNAME into outDir', async () => {
    const outDir = mkdtempSync(join(tmpdir(), 'flexion-labs-cname-prod-'))
    await buildSite({
      rootDir: process.cwd(),
      outDir,
      basePath: '/',
      now: new Date('2026-04-28T12:00:00Z'),
    })

    const cnamePath = join(outDir, 'CNAME')
    expect(existsSync(cnamePath)).toBe(true)
    expect(readFileSync(cnamePath, 'utf8').trim()).toBe('labs.flexion.us')
  })

  test('preview build (basePath /preview/<branch>/) does NOT include CNAME', async () => {
    const outDir = mkdtempSync(join(tmpdir(), 'flexion-labs-cname-preview-'))
    await buildSite({
      rootDir: process.cwd(),
      outDir,
      basePath: '/preview/fix-deployment-hygiene/',
      now: new Date('2026-04-28T12:00:00Z'),
    })

    expect(existsSync(join(outDir, 'CNAME'))).toBe(false)
  })
})
```

- [ ] **Step 1.2: Run the test to verify it fails**

```bash
/Users/danielnaab/.bun/bin/bun test tests/build/cname.test.ts
```

Expected: the `production build` test fails with `expect(existsSync(cnamePath)).toBe(true)` — actual `false`. The preview test passes trivially (CNAME isn't copied today).

- [ ] **Step 1.3: Implement CNAME copy**

Open `src/build/entry.tsx`. Find the block ending with `copyTree(join(rootDir, 'src', 'design', 'assets'), join(outDir, 'assets'))` (currently around line 75, inside `buildSite`). Append a CNAME copy that only runs for production:

```typescript
  await copyTree(join(rootDir, 'src', 'design', 'assets'), join(outDir, 'assets'))

  if (config.basePath === '/') {
    await copyFile(join(rootDir, 'CNAME'), join(outDir, 'CNAME'))
  }
}
```

`copyFile` is already imported at the top of the file. The check `config.basePath === '/'` is exact — production is the only build with an empty base path, and `getBasePath` normalizes all non-root values to `/path/`.

- [ ] **Step 1.4: Run the test to verify it passes**

```bash
/Users/danielnaab/.bun/bin/bun test tests/build/cname.test.ts
```

Expected: both tests pass.

- [ ] **Step 1.5: Run the whole CI test subset to confirm no regression**

```bash
/Users/danielnaab/.bun/bin/bun test tests/catalog tests/standards tests/views tests/enhancements tests/build
```

Expected: all tests pass (65 → 67 tests).

- [ ] **Step 1.6: Commit**

```bash
git add src/build/entry.tsx tests/build/cname.test.ts
git commit -m "fix: copy CNAME into dist on production builds

The publish job does not check out the source repo, so its CNAME
fallback silently fails and labs.flexion.us returns 404 after every
main deploy. Include CNAME in the build output instead — the artifact
then carries everything it needs to be deployed."
```

---

## Task 2: Rekey concurrency group on the acted-on branch

**Why:** `delete` events report `github.ref = refs/heads/main`, so branch-delete runs cancel in-flight main deploys.

**Files:**
- Modify: `.github/workflows/deploy.yml` (lines 13-15)

- [ ] **Step 2.1: Replace the concurrency block**

Open `.github/workflows/deploy.yml`. Find the current concurrency block:

```yaml
concurrency:
  group: deploy-${{ github.ref }}
  cancel-in-progress: true
```

Replace it with:

```yaml
concurrency:
  group: deploy-${{ github.event_name == 'delete' && github.event.ref || github.ref_name }}
  cancel-in-progress: true
```

- [ ] **Step 2.2: Verify YAML parses**

```bash
/Users/danielnaab/.bun/bin/bun -e "console.log(require('yaml').parse(require('fs').readFileSync('.github/workflows/deploy.yml','utf8')).concurrency)"
```

Expected: prints the new group and `cancelInProgress: true` without error.

- [ ] **Step 2.3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "fix(ci): key deploy concurrency on branch, not github.ref

delete events report github.ref as refs/heads/main, so a branch-delete
run was sharing a concurrency group with the main-deploy run it
triggered — cancelling it. Keying on github.event.ref for delete and
github.ref_name otherwise scopes cancellation correctly per branch."
```

---

## Task 3: Allow workflow_dispatch to publish

**Why:** `workflow_dispatch` builds but the `publish` job is gated on `github.event_name == 'push'`, so manual recovery is impossible without pushing a dummy commit.

**Files:**
- Modify: `.github/workflows/deploy.yml` (line 69)

- [ ] **Step 3.1: Update the publish job gate**

Find line 69:

```yaml
  publish:
    if: github.event_name == 'push'
```

Replace with:

```yaml
  publish:
    if: github.event_name == 'push' || github.event_name == 'workflow_dispatch'
```

- [ ] **Step 3.2: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "fix(ci): let workflow_dispatch publish, not just build

Previously a manual run would build and test successfully but skip
the publish job, which means workflow_dispatch could not be used for
recovery. Allow it to take the same publish path as a push."
```

---

## Task 4: Use per-branch preview environments

**Why:** Sharing one `preview` environment across all branches hides which branch is where in GitHub's Deployments UI and PR surface.

**Files:**
- Modify: `.github/workflows/deploy.yml` (lines 72-74 — the `environment:` block in the `publish` job)

- [ ] **Step 4.1: Update the environment expression**

Find the `environment:` block in the `publish` job (currently lines 72-74):

```yaml
    environment:
      name: ${{ needs.build-and-test.outputs.is_production == 'true' && 'production' || 'preview' }}
      url: ${{ needs.build-and-test.outputs.is_production == 'true' && 'https://labs.flexion.us/' || format('https://labs.flexion.us/preview/{0}/', needs.build-and-test.outputs.branch) }}
```

Replace with:

```yaml
    environment:
      name: ${{ needs.build-and-test.outputs.is_production == 'true' && 'production' || format('preview/{0}', needs.build-and-test.outputs.branch) }}
      url: ${{ needs.build-and-test.outputs.is_production == 'true' && 'https://labs.flexion.us/' || format('https://labs.flexion.us/preview/{0}/', needs.build-and-test.outputs.branch) }}
```

Only the `name:` expression changes. The URL expression already uses the sanitized branch name.

- [ ] **Step 4.2: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "feat(ci): give each branch its own preview environment

Previously every branch landed in a shared 'preview' environment, so
the GitHub Deployments UI could not be used to navigate per-branch
state. Deploy previews to 'preview/<sanitized-branch>' so every branch
gets its own entry and its own 'View deployment' button on PRs."
```

---

## Task 5: Deactivate deployments and delete environment on branch delete

**Why:** After a branch is deleted, its preview deployments stay marked `success` forever even though the URL 404s, and the environment clutters the Deployments sidebar.

**Files:**
- Modify: `.github/workflows/deploy.yml` (the `cleanup-preview` job, starting line 131)

The `cleanup-preview` job already removes the directory from `gh-pages`. We extend it with two new steps after the existing "Remove preview directory" step.

- [ ] **Step 5.1: Extend permissions for the cleanup-preview job**

Find the `cleanup-preview` job's `permissions:` block:

```yaml
  cleanup-preview:
    if: github.event_name == 'delete' && github.event.ref_type == 'branch'
    runs-on: ubuntu-latest
    permissions:
      contents: write
```

Change to:

```yaml
  cleanup-preview:
    if: github.event_name == 'delete' && github.event.ref_type == 'branch'
    runs-on: ubuntu-latest
    permissions:
      contents: write
      deployments: write
      administration: write
```

`deployments: write` is needed for the status transition; `administration: write` is needed to delete the environment.

- [ ] **Step 5.2: Add a "Deactivate preview deployments" step**

Append the step below immediately after the existing "Remove preview directory" step (whose last line today is `git push origin gh-pages`). Make sure you're adding it at the same indentation as the other `- name:` step blocks inside `cleanup-preview`:

```yaml
      - name: Deactivate preview deployments for the deleted branch
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          set -euo pipefail
          SANITIZED="$(echo "${{ github.event.ref }}" | tr '/' '-' | tr -cd 'a-zA-Z0-9._-')"
          ENV_NAME="preview/$SANITIZED"
          # List all deployments for this environment. Paginate to be safe.
          deployment_ids="$(gh api \
            --method GET \
            -H 'Accept: application/vnd.github+json' \
            "/repos/${GITHUB_REPOSITORY}/deployments?environment=${ENV_NAME}&per_page=100" \
            --paginate \
            --jq '.[].id' || true)"
          if [ -z "$deployment_ids" ]; then
            echo "No deployments found for environment $ENV_NAME."
            exit 0
          fi
          echo "$deployment_ids" | while read -r id; do
            [ -z "$id" ] && continue
            echo "Marking deployment $id inactive."
            gh api \
              --method POST \
              -H 'Accept: application/vnd.github+json' \
              "/repos/${GITHUB_REPOSITORY}/deployments/${id}/statuses" \
              -f state=inactive \
              -f description='Branch deleted; preview removed.' || true
          done
```

- [ ] **Step 5.3: Add a "Delete preview environment" step**

Immediately after the deactivation step, append:

```yaml
      - name: Delete preview environment
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          set -euo pipefail
          SANITIZED="$(echo "${{ github.event.ref }}" | tr '/' '-' | tr -cd 'a-zA-Z0-9._-')"
          ENV_NAME="preview/$SANITIZED"
          # URL-encode the forward slash.
          ENCODED="$(printf %s "$ENV_NAME" | sed 's|/|%2F|g')"
          echo "Deleting environment $ENV_NAME (encoded: $ENCODED)."
          gh api \
            --method DELETE \
            -H 'Accept: application/vnd.github+json' \
            "/repos/${GITHUB_REPOSITORY}/environments/${ENCODED}" || true
```

The `|| true` swallows 404s (environment may have already been deleted or never created for branches that never produced a deploy).

- [ ] **Step 5.4: Verify YAML still parses**

```bash
/Users/danielnaab/.bun/bin/bun -e "console.log(Object.keys(require('yaml').parse(require('fs').readFileSync('.github/workflows/deploy.yml','utf8')).jobs['cleanup-preview'].steps.map(s=>s.name||s.uses).join('\n')))"
```

Or simply:

```bash
/Users/danielnaab/.bun/bin/bun -e "const y=require('yaml').parse(require('fs').readFileSync('.github/workflows/deploy.yml','utf8')); console.log(y.jobs['cleanup-preview'].steps.map(s => s.name || s.uses))"
```

Expected: prints an array of step names including the existing two and the two new ones. No parse error.

- [ ] **Step 5.5: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "feat(ci): deactivate deployments and delete env on branch delete

When a branch is deleted, mark each of its preview deployments inactive
so the GitHub UI stops showing them as live, and delete the per-branch
environment so it drops out of the Deployments sidebar. Both calls use
the existing GH_TOKEN and are idempotent."
```

---

## Task 6: Update deployment docs

**Why:** `docs/deployment.md` describes a single `preview` environment and a CNAME copy step that we're removing. Keep durable docs accurate.

**Files:**
- Modify: `docs/deployment.md`

- [ ] **Step 6.1: Update the Workflow and Custom domain sections**

Open `docs/deployment.md`. Replace the entire "Workflow" section (between `## Workflow` and the next `##` heading) with:

```markdown
## Workflow

`.github/workflows/deploy.yml` runs on every push, on branch delete, and on manual `workflow_dispatch`:

1. Installs Bun, runs the test suite, builds the site with `SITE_BASE_URL` set to `/` for `main` or `/preview/<branch>/` for other branches.
2. Runs the axe-core a11y scan against the built output.
3. Checks out `gh-pages`, syncs the build output into the right directory, commits, and pushes.
4. Registers a GitHub Deployment against the `production` environment (for main) or a per-branch `preview/<sanitized-branch>` environment, so every branch's URL appears in the PR "Deployments" panel and the repo's Deployments page can be used to navigate per-branch preview state.

Concurrency is keyed on the acted-on branch name, not `github.ref`. A `delete` event against `feat/foo` and a `push` to `main` run in different concurrency groups, so a branch cleanup cannot cancel a production deploy.

When a branch is deleted, the `cleanup-preview` job runs and does three things:
- Removes `preview/<sanitized-branch>/` from `gh-pages`.
- Marks every deployment in the `preview/<sanitized-branch>` environment as `inactive`.
- Deletes the per-branch environment via the REST API so it drops out of the Deployments sidebar.
```

Replace the "Custom domain" section with:

```markdown
## Custom domain

`CNAME` at the source repo root contains `labs.flexion.us`. The build driver (`src/build/entry.tsx`) copies it into `dist/` on production builds only — preview subdirectories must not carry a CNAME.
```

- [ ] **Step 6.2: Commit**

```bash
git add docs/deployment.md
git commit -m "docs: document per-branch preview envs and build-time CNAME

Bring docs/deployment.md in line with the updated workflow: per-branch
preview environments, branch-keyed concurrency, inactive-then-delete
cleanup, and the fact that CNAME is now part of the build output."
```

---

## Task 7: End-to-end verification

**Why:** Several changes (environment name, cleanup-on-delete) are only observable against the real GitHub API; confirm the whole system works.

Do these steps **after pushing the branch** and opening the PR. The PR itself will produce the first real preview under a per-branch environment and is the most convenient test subject.

- [ ] **Step 7.1: Push the branch and open a PR**

```bash
git push -u origin fix/deployment-hygiene
gh pr create --title "fix: deployment hygiene — concurrency, CNAME, per-branch previews" --body "$(cat <<'EOF'
## Summary
- Rekey deploy concurrency on the acted-on branch so branch deletes do not cancel main deploys.
- Allow `workflow_dispatch` to publish, for recovery.
- Give each branch its own `preview/<branch>` environment so the Deployments UI is useful.
- On branch delete, mark preview deployments `inactive` and delete the environment.
- Copy `CNAME` into `dist/` in the build driver so production deploys do not lose the custom domain.

## Test plan
- [ ] New `tests/build/cname.test.ts` passes (CNAME only in production builds).
- [ ] Opening this PR produces a preview at `https://labs.flexion.us/preview/fix-deployment-hygiene/` under environment `preview/fix-deployment-hygiene`.
- [ ] After merge, `https://labs.flexion.us/` serves the site (not 404) and `gh api repos/flexion/flexion.github.io/pages` reports `"cname": "labs.flexion.us"`.
- [ ] After the branch is deleted, `labs.flexion.us/preview/fix-deployment-hygiene/` returns 404, the deployments for that environment are marked `inactive`, and the environment disappears from the Deployments sidebar.
EOF
)"
```

- [ ] **Step 7.2: Verify the preview deploy and per-branch environment**

```bash
# Wait for the run, then confirm the deployment environment name.
gh run watch --exit-status
gh api "/repos/flexion/flexion.github.io/deployments?environment=preview/fix-deployment-hygiene" --jq '.[] | {id, environment, ref, created_at}' | head -5
curl -sI https://labs.flexion.us/preview/fix-deployment-hygiene/ | head -3
```

Expected: the API returns at least one deployment in environment `preview/fix-deployment-hygiene`; the curl returns HTTP 200.

- [ ] **Step 7.3: Merge the PR, then verify production**

After merging the PR on GitHub:

```bash
gh run watch --exit-status
curl -sI https://labs.flexion.us/ | head -3
gh api repos/flexion/flexion.github.io/pages --jq '{status, cname}'
```

Expected: curl returns HTTP 200; API response has `cname: "labs.flexion.us"` and `status: "built"`.

- [ ] **Step 7.4: Confirm the cleanup ran after branch delete**

GitHub's default "delete branch on merge" setting (or your manual delete) will fire the `delete` event.

```bash
gh run list --workflow=deploy.yml --limit 3
# Wait for the cleanup-preview run to finish successfully.
curl -sI https://labs.flexion.us/preview/fix-deployment-hygiene/ | head -3
gh api "/repos/flexion/flexion.github.io/deployments?environment=preview/fix-deployment-hygiene" --jq '.[0].id' \
  | xargs -I{} gh api "/repos/flexion/flexion.github.io/deployments/{}/statuses" --jq '.[0].state'
gh api "/repos/flexion/flexion.github.io/environments" --jq '.environments[].name' | grep -c '^preview/fix-deployment-hygiene$' || echo 'environment deleted (as expected)'
```

Expected:
- curl returns HTTP 404.
- Most recent status for the deployment is `inactive`.
- `grep -c` returns `0` (or the `|| echo` branch fires) — the environment is gone.

- [ ] **Step 7.5: One-off manual cleanup of the legacy shared `preview` environment**

Because older deployments used the single shared environment, it still exists. Delete it once:

```bash
gh api --method DELETE -H 'Accept: application/vnd.github+json' /repos/flexion/flexion.github.io/environments/preview
```

Expected: 204 No Content. Future runs will not recreate this environment.

---

## Self-review

**Spec coverage:**
- Motivation 1 (cancel collision) → Task 2.
- Motivation 2 (missing CNAME) → Task 1 + doc in Task 6.
- Motivation 3 (shared preview env) → Task 4.
- Motivation 4 (stale deployments after delete) → Task 5.
- Spec Design §1 (branch-keyed concurrency) → Task 2.
- Spec Design §2 (`workflow_dispatch` publishes) → Task 3.
- Spec Design §3 (per-branch envs) → Task 4.
- Spec Design §4 (deactivate + delete) → Task 5.
- Spec Design §5 (CNAME in build) → Task 1.
- Spec Verification → Task 7.
- Risks §"stale `preview` environment" → Task 7.5.

**Type/name consistency:** Workflow uses sanitized branch name (`tr '/' '-' | tr -cd ...`) in every step that touches preview paths; environment name format (`preview/<sanitized>`) matches across Tasks 4 and 5. Build test uses real `CNAME` at the repo root whose contents are `labs.flexion.us` (verified).

**Placeholders:** none.

No gaps.
