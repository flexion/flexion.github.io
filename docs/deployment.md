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

`.github/workflows/deploy.yml` runs on every push:

1. Installs Bun, runs the test suite, builds the site with `SITE_BASE_URL` set to `/` for `main` or `/preview/<branch>/` for other branches.
2. Runs the axe-core a11y scan against the built output.
3. Checks out `gh-pages`, syncs the build output into the right directory, commits, and pushes.
4. Registers a GitHub Deployment against the `production` or `preview` environment so the URL appears in the PR "Deployments" panel.

When a branch is deleted, a cleanup job removes `preview/<sanitized-branch>/` from `gh-pages`.

## Custom domain

`CNAME` at the source repo root contains `labs.flexion.us`. The workflow copies it to `gh-pages` if absent.

## Base path

`SITE_BASE_URL` is the single knob that changes how internal links and asset URLs are emitted. The default is `/`. Any non-root value is normalized to `/path/`.
