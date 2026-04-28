import { describe, test, expect } from 'bun:test'
import { buildSnapshot } from '../../src/catalog/refresh'

const apiRepo = (overrides: Record<string, unknown>) => ({
  name: 'example',
  description: null,
  html_url: 'https://github.com/flexion/example',
  homepage: null,
  language: null,
  license: null,
  pushed_at: '2026-01-01T00:00:00Z',
  archived: false,
  fork: false,
  stargazers_count: 0,
  private: false,
  ...overrides,
})

describe('buildSnapshot', () => {
  test('skips private repos', async () => {
    const fetchImpl = async () => new Response(JSON.stringify([apiRepo({ private: true })]), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
    const snapshot = await buildSnapshot({ org: 'flexion', fetch: fetchImpl, fileCheck: async () => true })
    expect(snapshot.length).toBe(0)
  })

  test('maps API fields onto GithubSnapshotEntry', async () => {
    const fetchImpl = async () => new Response(JSON.stringify([
      apiRepo({
        name: 'messaging',
        description: 'Messaging',
        homepage: 'https://messaging.example/',
        language: 'TypeScript',
        license: { spdx_id: 'Apache-2.0' },
        stargazers_count: 3,
        pushed_at: '2026-04-20T00:00:00Z',
      }),
    ]), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
    const fileCheck = async (_org: string, _repo: string, path: string) =>
      path !== 'CONTRIBUTING.md'
    const snapshot = await buildSnapshot({ org: 'flexion', fetch: fetchImpl, fileCheck })
    expect(snapshot[0].name).toBe('messaging')
    expect(snapshot[0].license).toBe('Apache-2.0')
    expect(snapshot[0].stars).toBe(3)
    expect(snapshot[0].hasReadme).toBe(true)
    expect(snapshot[0].hasContributing).toBe(false)
  })
})
