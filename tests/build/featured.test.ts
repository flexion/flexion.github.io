import { describe, test, expect } from 'bun:test'
import { loadFeatured } from '../../src/build/featured'

const ROOT = import.meta.dir + '/../..'

describe('loadFeatured', () => {
  test('all content/featured/ files load without error', async () => {
    const labs = await loadFeatured(ROOT)
    expect(labs.length).toBeGreaterThan(0)
  })

  test('every lab has required fields', async () => {
    const labs = await loadFeatured(ROOT)
    for (const lab of labs) {
      expect(typeof lab.title).toBe('string')
      expect(lab.title.length).toBeGreaterThan(0)
      expect(typeof lab.tagline).toBe('string')
      expect(lab.tagline.length).toBeGreaterThan(0)
      expect(typeof lab.order).toBe('number')
      expect(lab.links.length).toBeGreaterThan(0)
    }
  })

  test('every link has a valid kind and required fields', async () => {
    const labs = await loadFeatured(ROOT)
    const validKinds = new Set(['demo', 'repo', 'case-study', 'screenshot'])
    for (const lab of labs) {
      for (const link of lab.links) {
        expect(typeof link.label).toBe('string')
        expect(validKinds.has(link.kind)).toBe(true)
      }
    }
  })

  test('labs are sorted by order', async () => {
    const labs = await loadFeatured(ROOT)
    const orders = labs.map((l) => l.order)
    expect(orders).toEqual([...orders].sort((a, b) => a - b))
  })
})
