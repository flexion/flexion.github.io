# Featured content

The home page showcases three Flexion Solutions offerings as "featured labs". Each lab is one markdown file in `content/featured/`, with curated content independent of the repo catalog.

## Content type

Files in `content/featured/*.md` use front-matter only. The body is ignored.

````markdown
```yaml
---
title: Forms Lab
tagline: Digitize forms to create modern, accessible experiences for public outreach.
order: 1
links:
  - label: Demo (Forms Platform)
    url: https://pp4cc7kwbf.us-east-1.awsapprunner.com/
  - label: GitHub repository — Forms Platform
    url: https://github.com/flexion/forms
---
```
````

### Fields

- `title` — card heading (string, required)
- `tagline` — one-sentence summary (string, required)
- `order` — display order ascending (integer, required)
- `links` — list of `{ label, url }` pairs rendered as external links (array, required)

## Loader

`src/build/featured.ts` exports `loadFeatured(rootDir)` which reads every `.md` file in `content/featured/`, parses front-matter, validates the schema, and returns labs sorted by `order`.

## Rendering

The home page renders one `<LabCard />` per lab. The card shows the title (not linked), the tagline, and a vertical list of external links. Cards stack on narrow viewports and flow into a grid on wider viewports via the existing `.home-featured__list` composition.

## Adding a featured lab

1. Add a new file at `content/featured/<slug>.md` with the required fields.
2. Pick an `order` value that places the lab where you want it.
3. `bun run build` and spot-check the home page.

## Removing or reordering

Delete the file or adjust `order`. No other changes needed.

## Related: the catalog directory

The catalog directory (`/work/` index, per-repo detail pages, `/work/health/` stewardship page) is **temporarily disabled** on the public site. The code, tests, and daily catalog refresh workflow remain intact; only the routes are commented out in `src/build/routes.ts`. See the spec at `notes/specs/2026-05-01-homepage-pare-down-design.md` for the rationale and the plan for restoring the directory.
