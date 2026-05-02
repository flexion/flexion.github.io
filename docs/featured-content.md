# Featured content

The home page showcases three Flexion Solutions offerings as "featured labs". Each lab is one markdown file in `content/featured/`, with curated content independent of the repo catalog.

## Content type

Files in `content/featured/*.md` use front-matter only. The body is ignored.

```yaml
---
title: Forms Lab
tagline: Digitize forms to create modern, accessible experiences for public outreach.
order: 1
links:
  - label: Forms Platform
    url: https://pp4cc7kwbf.us-east-1.awsapprunner.com/
    kind: demo
  - label: flexion/forms
    url: https://github.com/flexion/forms
    kind: repo
---
```

### Fields

- `title` — card heading (string, required)
- `tagline` — one-sentence summary (string, required)
- `order` — display order ascending (integer, required)
- `links` — list of link objects (array, required). Each link has:
  - `label` — visible link text (string, required). This is the identifier of what you're linking to — a repo name, a project name, or the target resource.
  - `url` — destination URL (string, required)
  - `kind` — one of `demo`, `repo`, or `case-study` (required). Drives the column heading ("Demo", "Repository", or "Case study") and the icon shown before the label.

## Loader

`src/build/featured.ts` exports `loadFeatured(rootDir)` which reads every `.md` file in `content/featured/`, parses front-matter, validates the schema, and returns labs sorted by `order`.

## Rendering

The home page renders one `<LabCard />` per lab. Each card places the title and tagline on top, with a horizontal row of columns below it — one column per link. Each column has a small uppercase kind heading ("Demo", "Repository", or "Case study") and the link itself, prefixed with an icon (globe for `demo`, GitHub mark for `repo`, document for `case-study`). Columns flow from 1 → 2 → 4 based on card width via container queries at 32rem and 56rem. The home page's featured list is constrained to `72rem` to keep cards at a readable width on wide displays.

## Adding a featured lab

1. Add a new file at `content/featured/<slug>.md` with the required fields.
2. Pick an `order` value that places the lab where you want it.
3. `bun run build` and spot-check the home page.

## Removing or reordering

Delete the file or adjust `order`. No other changes needed.

## Related: the catalog directory

The catalog directory (`/work/` index, per-repo detail pages, `/work/health/` stewardship page) is **temporarily disabled** on the public site. The code, tests, and daily catalog refresh workflow remain intact; only the routes are commented out in `src/build/routes.ts`. See the spec at `notes/specs/2026-05-01-homepage-pare-down-design.md` for the rationale and the plan for restoring the directory.
