import { describe, test, expect, beforeAll } from 'bun:test'
import { buildSite } from '../../src/build/entry.tsx'
import { mkdtempSync, readFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

let outDir: string

beforeAll(async () => {
  outDir = mkdtempSync(join(tmpdir(), 'flexion-labs-dist-'))
  await buildSite({
    rootDir: process.cwd(),
    outDir,
    basePath: '/',
    now: new Date('2026-04-27T12:00:00Z'),
  })
})

describe('build smoke', () => {
  const expectedPaths = [
    'index.html',
    'work/index.html',
    'work/health/index.html',
    'commitment/index.html',
    'about/index.html',
  ]

  for (const path of expectedPaths) {
    test(`produces ${path}`, () => {
      const full = join(outDir, path)
      expect(existsSync(full)).toBe(true)
      const content = readFileSync(full, 'utf8')
      expect(content).toContain('<!doctype html>')
      expect(content.length).toBeGreaterThan(100)
    })
  }

  test('produces a work directory', () => {
    const workDir = join(outDir, 'work')
    expect(existsSync(workDir)).toBe(true)
  })
})
