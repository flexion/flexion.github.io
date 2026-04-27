import { parse as parseYaml } from 'yaml'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { mergeCatalog } from './merge'
import { loadOverlay } from './overlays'
import type { Catalog, GithubSnapshotEntry, OverrideEntry, Overlay } from './types'

export async function loadCatalog(rootDir: string): Promise<Catalog> {
  const snapshot = await readSnapshot(join(rootDir, 'catalog', 'repos.json'))
  const overrides = await readOverrides(join(rootDir, 'catalog', 'overrides.yml'))
  const overlays = await readOverlays(join(rootDir, 'content', 'work'))
  return mergeCatalog(snapshot, overrides, overlays)
}

async function readSnapshot(path: string): Promise<GithubSnapshotEntry[]> {
  const file = Bun.file(path)
  if (!(await file.exists())) return []
  return (await file.json()) as GithubSnapshotEntry[]
}

async function readOverrides(
  path: string,
): Promise<Record<string, OverrideEntry>> {
  const file = Bun.file(path)
  if (!(await file.exists())) return {}
  const parsed = parseYaml(await file.text())
  return (parsed ?? {}) as Record<string, OverrideEntry>
}

async function readOverlays(dir: string): Promise<Map<string, Overlay>> {
  const overlays = new Map<string, Overlay>()
  let files: string[] = []
  try {
    files = readdirSync(dir).filter((f) => f.endsWith('.md'))
  } catch {
    return overlays
  }
  for (const file of files) {
    const slug = file.replace(/\.md$/, '')
    const overlay = await loadOverlay(join(dir, file))
    if (overlay) overlays.set(slug, overlay)
  }
  return overlays
}
