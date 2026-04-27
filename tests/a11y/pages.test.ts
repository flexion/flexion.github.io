import { describe, test, expect, beforeAll } from 'bun:test'
import { Window } from 'happy-dom'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const DIST = join(process.cwd(), 'dist')

const pages = [
  'index.html',
  'work/index.html',
  'work/health/index.html',
  'commitment/index.html',
  'about/index.html',
]

describe('axe-core a11y scan', () => {
  beforeAll(() => {
    if (!existsSync(join(DIST, 'index.html'))) {
      throw new Error('Run `bun run build` before the a11y suite.')
    }
  })

  for (const page of pages) {
    test(page, async () => {
      const html = readFileSync(join(DIST, page), 'utf8')
      const window = new Window()
      window.document.write(html)
      // axe-core needs globals set up before import
      const origWindow = (globalThis as any).window
      const origDocument = (globalThis as any).document
      globalThis.window = window as any
      globalThis.document = window.document as any
      try {
        // @ts-expect-error axe-core ships CommonJS typings
        const axe = (await import('axe-core')).default
        const result = await axe.run(window.document, { resultTypes: ['violations'] })
        if (result.violations.length > 0) {
          const summary = result.violations
            .map((v) => `${v.id}: ${v.help}\n  nodes: ${v.nodes.length}`)
            .join('\n')
          throw new Error(`axe violations on ${page}:\n${summary}`)
        }
        expect(result.violations.length).toBe(0)
      } finally {
        // Restore globals
        if (origWindow !== undefined) {
          globalThis.window = origWindow
        } else {
          delete (globalThis as any).window
        }
        if (origDocument !== undefined) {
          globalThis.document = origDocument
        } else {
          delete (globalThis as any).document
        }
      }
    })
  }
})
