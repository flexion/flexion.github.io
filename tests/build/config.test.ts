import { describe, test, expect } from 'bun:test'
import { getBasePath, url } from '../../src/build/config'

describe('build config', () => {
  test('base path defaults to /', () => {
    expect(getBasePath(undefined)).toBe('/')
  })

  test('base path respects SITE_BASE_URL with leading and trailing slashes', () => {
    expect(getBasePath('/preview/feat-x/')).toBe('/preview/feat-x/')
    expect(getBasePath('preview/feat-x')).toBe('/preview/feat-x/')
  })

  test('url() prefixes the base path and preserves leading slashes', () => {
    expect(url('/work/', '/preview/x/')).toBe('/preview/x/work/')
    expect(url('/', '/preview/x/')).toBe('/preview/x/')
    expect(url('/work/messaging/', '/')).toBe('/work/messaging/')
  })
})
