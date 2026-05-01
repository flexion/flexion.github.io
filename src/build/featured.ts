import { parse as parseYaml } from 'yaml'
import { readdir } from 'node:fs/promises'
import { join } from 'node:path'

export type FeaturedLink = {
  label: string
  url: string
}

export type FeaturedLab = {
  title: string
  tagline: string
  order: number
  links: FeaturedLink[]
}

const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---/

export async function loadFeatured(rootDir: string): Promise<FeaturedLab[]> {
  const dir = join(rootDir, 'content', 'featured')
  let files: string[]
  try {
    files = await readdir(dir)
  } catch {
    return []
  }

  const labs: FeaturedLab[] = []
  for (const file of files.sort()) {
    if (!file.endsWith('.md')) continue
    const raw = await Bun.file(join(dir, file)).text()
    const match = raw.match(FRONTMATTER_RE)
    if (!match) continue
    const parsed = (parseYaml(match[1]) ?? {}) as Record<string, unknown>
    labs.push(parseLab(file, parsed))
  }
  labs.sort((a, b) => a.order - b.order)
  return labs
}

function parseLab(file: string, raw: Record<string, unknown>): FeaturedLab {
  const title = requireString(file, 'title', raw.title)
  const tagline = requireString(file, 'tagline', raw.tagline)
  const order = typeof raw.order === 'number' ? raw.order : 999
  const links = parseLinks(file, raw.links)
  return { title, tagline, order, links }
}

function parseLinks(file: string, value: unknown): FeaturedLink[] {
  if (!Array.isArray(value)) {
    throw new Error(`content/featured/${file}: "links" must be an array`)
  }
  return value.map((item, i) => {
    if (!item || typeof item !== 'object') {
      throw new Error(`content/featured/${file}: links[${i}] must be an object`)
    }
    const o = item as Record<string, unknown>
    return {
      label: requireString(file, `links[${i}].label`, o.label),
      url: requireString(file, `links[${i}].url`, o.url),
    }
  })
}

function requireString(file: string, field: string, value: unknown): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`content/featured/${file}: "${field}" is required and must be a string`)
  }
  return value
}
