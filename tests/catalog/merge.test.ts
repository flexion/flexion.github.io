import { describe, test, expect } from 'bun:test'
import { mergeCatalog } from '../../catalog/merge'
import type { GithubSnapshotEntry, OverrideEntry, Overlay } from '../../catalog/types'

const snapshot: GithubSnapshotEntry = {
  name: 'messaging',
  description: 'GOV.UK Notify-style messaging.',
  url: 'https://github.com/flexion/messaging',
  homepage: null,
  language: 'TypeScript',
  license: 'Apache-2.0',
  pushedAt: '2026-04-20T00:00:00Z',
  archived: false,
  fork: false,
  stars: 3,
  hasReadme: true,
  hasLicense: true,
  hasContributing: true,
}

describe('mergeCatalog', () => {
  test('applies defaults when no override exists', () => {
    const catalog = mergeCatalog([snapshot], {}, new Map())
    expect(catalog[0].tier).toBe('unreviewed')
    expect(catalog[0].category).toBe('uncategorized')
  })

  test('applies overrides by repo name', () => {
    const overrides: Record<string, OverrideEntry> = {
      messaging: { tier: 'active', category: 'product', featured: true },
    }
    const catalog = mergeCatalog([snapshot], overrides, new Map())
    expect(catalog[0].tier).toBe('active')
    expect(catalog[0].featured).toBe(true)
  })

  test('attaches overlay keyed by repo name', () => {
    const overlays = new Map<string, Overlay>([
      ['messaging', { title: 'Messaging', body: '…' }],
    ])
    const catalog = mergeCatalog([snapshot], {}, overlays)
    expect(catalog[0].overlay).not.toBeNull()
    expect(catalog[0].overlay!.title).toBe('Messaging')
  })

  test('entries without overlays get overlay=null', () => {
    const catalog = mergeCatalog([snapshot], {}, new Map())
    expect(catalog[0].overlay).toBeNull()
  })

  test('preserves order of the snapshot input', () => {
    const a = { ...snapshot, name: 'a' }
    const b = { ...snapshot, name: 'b' }
    const c = { ...snapshot, name: 'c' }
    const catalog = mergeCatalog([c, a, b], {}, new Map())
    expect(catalog.map((e) => e.name)).toEqual(['c', 'a', 'b'])
  })
})
