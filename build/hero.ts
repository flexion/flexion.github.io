import { parse as parseYaml } from 'yaml'
import { join } from 'node:path'
import type { HeroContent } from '../views/home'

const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---/

export async function loadHero(rootDir: string): Promise<HeroContent> {
  const file = Bun.file(join(rootDir, 'content', 'home.md'))
  const raw = await file.text()
  const match = raw.match(FRONTMATTER_RE)
  const parsed = match ? (parseYaml(match[1]) as Record<string, unknown>) : {}
  return {
    hero: typeof parsed.hero === 'string' ? parsed.hero : 'Flexion Labs',
    intro: typeof parsed.intro === 'string' ? parsed.intro : '',
  }
}
