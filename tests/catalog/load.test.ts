import { describe, test, expect } from 'bun:test'
import { loadCatalog } from '../../src/catalog/load'
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

function seed() {
  const dir = mkdtempSync(join(tmpdir(), 'flexion-labs-'))
  mkdirSync(join(dir, 'data'), { recursive: true })
  mkdirSync(join(dir, 'content', 'work'), { recursive: true })
  writeFileSync(
    join(dir, 'data', 'repos.json'),
    JSON.stringify([
      {
        name: 'messaging',
        description: null,
        url: 'https://github.com/flexion/messaging',
        homepage: null,
        language: 'TypeScript',
        license: 'Apache-2.0',
        pushedAt: '2026-04-20T00:00:00Z',
        archived: false,
        fork: false,
        stars: 0,
        hasReadme: true,
        hasLicense: true,
        hasContributing: false,
      },
    ]),
  )
  writeFileSync(
    join(dir, 'data', 'overrides.yml'),
    'messaging:\n  tier: active\n  category: product\n  featured: true\n',
  )
  writeFileSync(
    join(dir, 'content', 'work', 'messaging.md'),
    '---\ntitle: Messaging\n---\n\nBody copy.\n',
  )
  return dir
}

describe('loadCatalog', () => {
  test('combines repos.json + overrides.yml + content/work overlays', async () => {
    const root = seed()
    const catalog = await loadCatalog(root)
    expect(catalog.length).toBe(1)
    expect(catalog[0].name).toBe('messaging')
    expect(catalog[0].tier).toBe('active')
    expect(catalog[0].featured).toBe(true)
    expect(catalog[0].overlay?.title).toBe('Messaging')
  })
})
