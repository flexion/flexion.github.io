import { describe, test, expect } from 'bun:test'
import { evaluateRepo } from '../../standards/repo-checks'
import type { CatalogEntry } from '../../catalog/types'

const NOW = new Date('2026-04-27T00:00:00Z')

const base: CatalogEntry = {
  name: 'example',
  description: null,
  url: 'https://github.com/flexion/example',
  homepage: null,
  language: null,
  license: 'Apache-2.0',
  pushedAt: '2026-04-01T00:00:00Z',
  archived: false,
  fork: false,
  stars: 0,
  hasReadme: true,
  hasLicense: true,
  hasContributing: true,
  tier: 'active',
  category: 'product',
  featured: false,
  hidden: false,
  overlay: null,
}

describe('evaluateRepo', () => {
  test('a fully compliant repo passes every check', () => {
    const result = evaluateRepo(base, NOW)
    expect(result.readme).toBe('pass')
    expect(result.license).toBe('pass')
    expect(result.contributing).toBe('pass')
    expect(result.activity).toBe('pass')
    expect(result.tierAssigned).toBe('pass')
    expect(result.overallPass).toBe(true)
  })

  test('missing README fails', () => {
    const result = evaluateRepo({ ...base, hasReadme: false }, NOW)
    expect(result.readme).toBe('fail')
    expect(result.overallPass).toBe(false)
  })

  test('activity between 6 and 18 months ago warns', () => {
    const pushed = new Date('2025-07-01T00:00:00Z').toISOString() // ~10 months ago
    const result = evaluateRepo({ ...base, pushedAt: pushed }, NOW)
    expect(result.activity).toBe('warn')
  })

  test('activity older than 18 months fails', () => {
    const pushed = new Date('2024-08-01T00:00:00Z').toISOString() // ~20 months ago
    const result = evaluateRepo({ ...base, pushedAt: pushed }, NOW)
    expect(result.activity).toBe('fail')
  })

  test('unreviewed tier counts as tier-not-assigned', () => {
    const result = evaluateRepo({ ...base, tier: 'unreviewed' }, NOW)
    expect(result.tierAssigned).toBe('fail')
  })

  test('archived repos skip the activity check (pass by policy)', () => {
    const pushed = new Date('2020-01-01T00:00:00Z').toISOString()
    const result = evaluateRepo(
      { ...base, tier: 'archived', archived: true, pushedAt: pushed },
      NOW,
    )
    expect(result.activity).toBe('pass')
  })
})
