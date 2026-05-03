import { describe, test, expect } from 'bun:test'
import { loadHero } from '../../src/build/hero'
import { writeFileSync, mkdtempSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

function makeRoot(home: string): string {
  const root = mkdtempSync(join(tmpdir(), 'flexion-labs-'))
  mkdirSync(join(root, 'content'), { recursive: true })
  writeFileSync(join(root, 'content', 'home.md'), home)
  return root
}

describe('loadHero', () => {
  test('reads title, subtitle, intro (rendered) and learnMore from front-matter', async () => {
    const root = makeRoot(
      [
        '---',
        'title: Site Title',
        'subtitle: The subtitle',
        'intro: |',
        '  First paragraph with a [link](https://example.com/).',
        '',
        '  Second paragraph.',
        'learnMore:',
        '  commitment: Commitment teaser.',
        '  about: About teaser.',
        '---',
        '',
      ].join('\n'),
    )
    const hero = await loadHero(root)
    expect(hero.title).toBe('Site Title')
    expect(hero.subtitle).toBe('The subtitle')
    expect(hero.intro).toContain('<a href="https://example.com/">link</a>')
    expect(hero.intro).toContain('First paragraph')
    expect(hero.intro).toContain('Second paragraph')
    expect(hero.learnMore.commitment).toBe('Commitment teaser.')
    expect(hero.learnMore.about).toBe('About teaser.')
  })

  test('falls back to defaults when front-matter is empty', async () => {
    const root = makeRoot('---\n---\n')
    const hero = await loadHero(root)
    expect(hero.title).toBe('Flexion Labs')
    expect(hero.subtitle).toBe('')
    expect(hero.intro).toBe('')
    expect(hero.learnMore.commitment).toBe('')
    expect(hero.learnMore.about).toBe('')
  })
})
