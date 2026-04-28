import { describe, test, expect } from 'bun:test'
import { applyDefaults } from '../../src/catalog/defaults'
import type { GithubSnapshotEntry } from '../../src/catalog/types'

const base: GithubSnapshotEntry = {
  name: 'example',
  description: null,
  url: 'https://github.com/flexion/example',
  homepage: null,
  language: null,
  license: null,
  pushedAt: '2026-01-01T00:00:00Z',
  archived: false,
  fork: false,
  stars: 0,
  hasReadme: false,
  hasLicense: false,
  hasContributing: false,
}

describe('applyDefaults', () => {
  test('forks default to category=fork, tier=as-is', () => {
    const result = applyDefaults({ ...base, fork: true }, {})
    expect(result.category).toBe('fork')
    expect(result.tier).toBe('as-is')
  })

  test('archived repos default to tier=archived', () => {
    const result = applyDefaults({ ...base, archived: true }, {})
    expect(result.tier).toBe('archived')
    expect(result.category).toBe('uncategorized')
  })

  test('archived forks keep category=fork and tier=archived', () => {
    const result = applyDefaults({ ...base, fork: true, archived: true }, {})
    expect(result.category).toBe('fork')
    expect(result.tier).toBe('archived')
  })

  test('plain repos default to unreviewed + uncategorized', () => {
    const result = applyDefaults(base, {})
    expect(result.tier).toBe('unreviewed')
    expect(result.category).toBe('uncategorized')
  })

  test('override fields take precedence over defaults', () => {
    const result = applyDefaults(
      { ...base, fork: true, archived: true },
      { tier: 'active', category: 'product', featured: true },
    )
    expect(result.tier).toBe('active')
    expect(result.category).toBe('product')
    expect(result.featured).toBe(true)
  })

  test('featured and hidden default to false', () => {
    const result = applyDefaults(base, {})
    expect(result.featured).toBe(false)
    expect(result.hidden).toBe(false)
  })
})
