import { describe, test, expect } from 'bun:test'
import { getBasePath } from '../../src/build/config'

describe('build config', () => {
  test('base path defaults to /', () => {
    expect(getBasePath(undefined)).toBe('/')
  })

  test('base path respects SITE_BASE_URL with leading and trailing slashes', () => {
    expect(getBasePath('/preview/feat-x/')).toBe('/preview/feat-x/')
    expect(getBasePath('preview/feat-x')).toBe('/preview/feat-x/')
  })
})
