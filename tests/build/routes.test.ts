import { describe, test, expect } from 'bun:test'
import { allRoutes } from '../../src/build/routes'
import { fixtureCatalog } from '../fixtures/catalog'

describe('allRoutes', () => {
  test('produces the expected public routes', () => {
    const paths = allRoutes(fixtureCatalog).map((r) => r.path)
    expect(paths).toContain('/')
    expect(paths).toContain('/commitment/')
    expect(paths).toContain('/design-system/')
    expect(paths).not.toContain('/about/')
  })

  test('does not produce any /work/ routes', () => {
    const paths = allRoutes(fixtureCatalog).map((r) => r.path)
    for (const path of paths) {
      expect(path.startsWith('/work/')).toBe(false)
    }
    expect(paths).not.toContain('/work/')
  })
})
