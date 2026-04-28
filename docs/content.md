# Content authoring

Prose lives in `content/`. Every file is markdown with optional YAML front-matter.

## Files

- **`content/home.md`** — front-matter only, carrying `hero` and `intro` for the home page.
- **`content/commitment.md`** — the full open source commitment. Front-matter: `title`. Body rendered into `/commitment/`.
- **`content/about.md`** — Flexion Labs' about page. Front-matter: `title`. Body rendered into `/about/`.
- **`content/work/<slug>.md`** — per-repo overlays for detail pages. Front-matter: `title`, `summary`. Body renders into the detail page's main content.

## Voice

Follow Flexion's brand voice: plain, professional, active, humble-not-shy. Use "we" to speak as Flexion; avoid first-person singular. Prefer concrete examples over abstractions. Avoid marketing copy, breathless claims, and undefined acronyms.

## Updating the commitment

The working-draft Google Doc is the source while the commitment is still under review. Once it's ratified, `content/commitment.md` is the canonical text and the Doc should defer to it.
