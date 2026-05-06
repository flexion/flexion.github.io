import type {
  FeaturedLab,
  FeaturedLink,
  FeaturedLinkKind,
  FeaturedScreenshotLink,
} from '../../../build/featured'
import { url } from '../../../build/config'

const KIND_HEADING: Record<FeaturedLinkKind, string> = {
  demo: 'Demo',
  screenshot: 'Screenshots',
  repo: 'Repository',
  'case-study': 'Case study',
}

// Column order whenever these kinds are present.
const KIND_ORDER: readonly FeaturedLinkKind[] = ['demo', 'screenshot', 'repo', 'case-study']

type Column = { kind: FeaturedLinkKind; links: FeaturedLink[] }

function groupByKind(links: readonly FeaturedLink[]): Column[] {
  const byKind = new Map<FeaturedLinkKind, FeaturedLink[]>()
  for (const link of links) {
    const bucket = byKind.get(link.kind) ?? []
    bucket.push(link)
    byKind.set(link.kind, bucket)
  }
  return KIND_ORDER.filter((k) => byKind.has(k)).map((kind) => ({
    kind,
    links: byKind.get(kind)!,
  }))
}

function dialogId(labTitle: string, linkIndex: number): string {
  const slug = labTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  return `screenshots-${slug}-${linkIndex}`
}

export function LabCard({ lab, basePath = '/' }: { lab: FeaturedLab; basePath?: string }) {
  const columns = groupByKind(lab.links)
  const maxLinks = columns.reduce((n, c) => Math.max(n, c.links.length), 0)
  // Expose the grid size so subgrid rows can align across columns.
  const style = `--lab-card-rows: ${maxLinks};`

  const screenshotLinks: { link: FeaturedScreenshotLink; id: string }[] = []
  lab.links.forEach((link, i) => {
    if (link.kind === 'screenshot') {
      screenshotLinks.push({ link, id: dialogId(lab.title, i) })
    }
  })

  return (
    <article class="lab-card">
      <div class="lab-card__intro">
        <h3 class="lab-card__title">{lab.title}</h3>
        <p class="lab-card__tagline">{lab.tagline}</p>
      </div>
      <ul class="lab-card__columns" style={style}>
        {columns.map((column) => (
          <li class="lab-card__column">
            <p class="lab-card__column-heading">{KIND_HEADING[column.kind]}</p>
            {column.links.map((link) => {
              if (link.kind === 'screenshot') {
                const id = dialogId(lab.title, lab.links.indexOf(link))
                return (
                  <button
                    class="lab-card__column-link lab-card__column-link--button"
                    data-open-dialog={id}
                    type="button"
                  >
                    <LinkIcon kind="screenshot" />
                    <span>{link.label}</span>
                  </button>
                )
              }
              return (
                <a
                  class="lab-card__column-link"
                  href={link.url}
                  rel="noopener external"
                >
                  <LinkIcon kind={column.kind} />
                  <span>{link.label}</span>
                </a>
              )
            })}
          </li>
        ))}
      </ul>
      {screenshotLinks.map(({ link, id }) => (
        <screenshot-dialog>
          <dialog id={id} class="screenshot-dialog">
            <button class="screenshot-dialog__close" data-close-dialog aria-label="Close" type="button">
              &times;
            </button>
            <div class="screenshot-dialog__images">
              {link.images.map((img) => (
                <img
                  class="screenshot-dialog__img"
                  src={url(img.src, basePath)}
                  alt={img.alt}
                  loading="lazy"
                />
              ))}
            </div>
          </dialog>
        </screenshot-dialog>
      ))}
    </article>
  )
}

function LinkIcon({ kind }: { kind: FeaturedLinkKind }) {
  switch (kind) {
    case 'demo':
      return <DemoIcon />
    case 'screenshot':
      return <ScreenshotIcon />
    case 'repo':
      return <RepoIcon />
    case 'case-study':
      return <CaseStudyIcon />
  }
}

function DemoIcon() {
  // Globe / launch — signals "visit a running thing"
  return (
    <svg
      class="lab-card__icon"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18" />
      <path d="M12 3a14 14 0 0 0 0 18" />
    </svg>
  )
}

function ScreenshotIcon() {
  return (
    <svg
      class="lab-card__icon"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  )
}

function RepoIcon() {
  // GitHub mark
  return (
    <svg
      class="lab-card__icon"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 1.5a10.5 10.5 0 0 0-3.32 20.47c.53.1.72-.23.72-.51v-1.8c-2.93.64-3.55-1.41-3.55-1.41-.48-1.22-1.17-1.55-1.17-1.55-.96-.65.07-.64.07-.64 1.06.07 1.62 1.09 1.62 1.09.94 1.61 2.47 1.14 3.07.87.1-.68.37-1.14.67-1.4-2.34-.27-4.8-1.17-4.8-5.2 0-1.15.41-2.09 1.08-2.82-.11-.27-.47-1.35.1-2.81 0 0 .88-.28 2.89 1.07a10 10 0 0 1 5.26 0c2-1.35 2.88-1.07 2.88-1.07.58 1.46.22 2.54.11 2.81.67.73 1.08 1.67 1.08 2.82 0 4.04-2.47 4.93-4.82 5.19.38.33.72.97.72 1.96v2.91c0 .28.19.62.73.51A10.5 10.5 0 0 0 12 1.5z" />
    </svg>
  )
}

function CaseStudyIcon() {
  // Document with horizontal lines
  return (
    <svg
      class="lab-card__icon"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6" />
      <path d="M9 17h6" />
    </svg>
  )
}
