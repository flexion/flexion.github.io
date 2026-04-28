import { parse as parseYaml } from 'yaml'
import type { Overlay } from './types'

const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/

export async function loadOverlay(path: string): Promise<Overlay | null> {
  const file = Bun.file(path)
  if (!(await file.exists())) return null
  const raw = await file.text()

  const match = raw.match(FRONTMATTER_RE)
  if (!match) {
    return { body: raw.trim() || undefined }
  }
  const frontMatter = (parseYaml(match[1]) ?? {}) as Record<string, unknown>
  const body = match[2].trim()

  return {
    title: stringOrUndefined(frontMatter.title),
    summary: stringOrUndefined(frontMatter.summary),
    body: body || undefined,
  }
}

function stringOrUndefined(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}
