# Stewardship

The site reports, publicly, how each repo measures up to Flexion's stewardship standards.

## Tiers

- **Active** — Flexion commits to security patch management and defined response times. Bug reports are triaged; pull requests are reviewed on a predictable cadence.
- **As-is** — Available without promised maintenance. Future updates are not guaranteed.
- **Archived** — No longer maintained. GitHub's archive flag is set. Listed for transparency.
- **Unreviewed** — A human has not yet classified this repo. Defaults to this state.

## Checks

Defined in `standards/repo-checks.ts`. Every public repo is evaluated against:

1. **README** — `README.md` at the root.
2. **License** — a detectable license (GitHub's license field or a LICENSE file).
3. **Contributing** — `CONTRIBUTING.md` at the root.
4. **Activity** — most recent push within 6 months (pass), 6–18 months (warn), older (fail). Archived repos pass by policy.
5. **Tier assigned** — tier is anything other than `unreviewed`.

## Hiding per-repo failures

Before launch, leadership may decide to show aggregate counts only. Set `SHOW_PER_REPO_FAILURES` to `false` in `standards/repo-checks.ts` and redeploy; the health view will hide the per-repo table and display a short aggregate instead.
