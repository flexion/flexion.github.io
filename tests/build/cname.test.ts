import { describe, test, expect } from 'bun:test'
import { buildSite } from '../../src/build/entry.tsx'
import { mkdtempSync, existsSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

describe('CNAME handling in build output', () => {
  test('production build (basePath /) copies CNAME into outDir', async () => {
    const outDir = mkdtempSync(join(tmpdir(), 'flexion-labs-cname-prod-'))
    await buildSite({
      rootDir: process.cwd(),
      outDir,
      basePath: '/',
      now: new Date('2026-04-28T12:00:00Z'),
    })

    const cnamePath = join(outDir, 'CNAME')
    expect(existsSync(cnamePath)).toBe(true)
    expect(readFileSync(cnamePath, 'utf8').trim()).toBe('labs.flexion.us')
  })

  test('preview build (basePath /preview/<branch>/) does NOT include CNAME', async () => {
    const outDir = mkdtempSync(join(tmpdir(), 'flexion-labs-cname-preview-'))
    await buildSite({
      rootDir: process.cwd(),
      outDir,
      basePath: '/preview/fix-deployment-hygiene/',
      now: new Date('2026-04-28T12:00:00Z'),
    })

    expect(existsSync(join(outDir, 'CNAME'))).toBe(false)
  })
})
