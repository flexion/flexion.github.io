# Deployment

The site is hosted on GitHub Pages with a custom domain.

## Branch layout

    gh-pages/
      index.html                  # main (production)
      work/, commitment/, about/, work/health/
      preview/
        <branch-a>/
          index.html
          …

- Production: `https://labs.flexion.us/`
- Preview: `https://labs.flexion.us/preview/<sanitized-branch>/`

## Workflow

`.github/workflows/deploy.yml` runs on every push, on branch delete, and on manual `workflow_dispatch`:

1. Installs Bun, runs the test suite, builds the site with `SITE_BASE_URL` set to `/` for `main` or `/preview/<branch>/` for other branches.
2. Runs the axe-core a11y scan against the built output.
3. Checks out `gh-pages`, syncs the build output into the right directory, commits, and pushes.
4. Registers a GitHub Deployment against the `production` environment (for main) or a per-branch `preview/<sanitized-branch>` environment, so every branch's URL appears in the PR "Deployments" panel and the repo's Deployments page can be used to navigate per-branch preview state.

Concurrency is keyed on the acted-on branch name, not `github.ref`. A `delete` event against `feat/foo` and a `push` to `main` run in different concurrency groups, so a branch cleanup cannot cancel a production deploy.

When a branch is deleted, the `cleanup-preview` job runs and does two things:
- Removes `preview/<sanitized-branch>/` from `gh-pages`.
- Marks every deployment in the `preview/<sanitized-branch>` environment as `inactive` so the GitHub UI stops showing them as live.

The environment entry itself persists in the Deployments sidebar. Deleting environments requires repo-admin rights that `GITHUB_TOKEN` cannot be granted via `permissions:`; that step would need a PAT-backed secret and has been deferred.

## Custom domain

`CNAME` at the source repo root contains `labs.flexion.us`. The build driver (`src/build/entry.tsx`) copies it into `dist/` on production builds only — preview subdirectories must not carry a CNAME.

## Base path

`SITE_BASE_URL` is the single knob that changes how internal links and asset URLs are emitted. The default is `/`. Any non-root value is normalized to `/path/`.
