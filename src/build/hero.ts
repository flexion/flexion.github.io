import { parse as parseYaml } from 'yaml'
import { marked } from 'marked'
import { join } from 'node:path'
import type { HeroContent } from '../pages/home'

const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---/

export async function loadHero(rootDir: string): Promise<HeroContent> {
  const file = Bun.file(join(rootDir, 'content', 'home.md'))
  const raw = await file.text()
  const match = raw.match(FRONTMATTER_RE)
  const parsed = match ? ((parseYaml(match[1]) ?? {}) as Record<string, unknown>) : {}

  const title = stringOr(parsed.title, 'Flexion Labs')
  const subtitle = stringOr(parsed.subtitle, '')
  const introMarkdown = stringOr(parsed.intro, '')
  const intro = introMarkdown
    ? (marked.parse(introMarkdown, { async: false }) as string)
    : ''
  const lm = (parsed.learnMore ?? {}) as Record<string, unknown>
  const learnMore = {
    commitment: stringOr(lm.commitment, ''),
    about: stringOr(lm.about, ''),
  }
  return { title, subtitle, intro, learnMore }
}

function stringOr(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback
}
