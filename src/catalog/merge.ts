import { applyDefaults } from './defaults'
import type {
  CatalogEntry,
  GithubSnapshotEntry,
  OverrideEntry,
  Overlay,
} from './types'

export function mergeCatalog(
  snapshot: ReadonlyArray<GithubSnapshotEntry>,
  overrides: Record<string, OverrideEntry>,
  overlays: ReadonlyMap<string, Overlay>,
): CatalogEntry[] {
  return snapshot.map((entry) => {
    const override = overrides[entry.name] ?? {}
    const resolved = applyDefaults(entry, override)
    return {
      ...entry,
      ...resolved,
      overlay: overlays.get(entry.name) ?? null,
    }
  })
}
