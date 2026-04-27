import { describe, test, expect } from 'bun:test'
import { loadHero } from '../../build/hero'
import { writeFileSync, mkdtempSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

describe('loadHero', () => {
  test('reads hero and intro from content/home.md front-matter', async () => {
    const root = mkdtempSync(join(tmpdir(), 'flexion-labs-'))
    mkdirSync(join(root, 'content'), { recursive: true })
    writeFileSync(
      join(root, 'content', 'home.md'),
      '---\nhero: Test hero.\nintro: Test intro.\n---\n',
    )
    const hero = await loadHero(root)
    expect(hero.hero).toBe('Test hero.')
    expect(hero.intro).toBe('Test intro.')
  })
})
