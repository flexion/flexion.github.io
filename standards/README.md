# Standards

This directory encodes Flexion's stewardship standards. Every public repo is evaluated against the checks defined here; the results drive `/work/health/`.

## Checks

- **README** — repo has a README.md at the root.
- **License** — repo has a detectable license (GitHub's license field OR a LICENSE file).
- **Contributing** — repo has a CONTRIBUTING.md at the root.
- **Activity** — most recent push is within 6 months (pass), 6–18 months (warn), or older (fail). Archived repos pass by policy — they're not expected to receive updates.
- **Tier assigned** — a human has classified the repo with an explicit tier in `catalog/overrides.yml`. Unclassified repos fail this check.

## Hiding per-repo failures

`SHOW_PER_REPO_FAILURES` in `repo-checks.ts` controls whether `/work/health/` shows specific repo names next to failures. Set it to `false` before launch if leadership prefers aggregate reporting.
