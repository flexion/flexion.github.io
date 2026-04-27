import { describe, test, expect } from 'bun:test'
import { loadOverlay } from '../../catalog/overlays'

describe('loadOverlay', () => {
  test('parses front-matter and body from a markdown file', async () => {
    const overlay = await loadOverlay('tests/fixtures/overlays/messaging.md')
    expect(overlay).not.toBeNull()
    expect(overlay!.title).toBe('Messaging')
    expect(overlay!.summary).toBe('Text-based communication for critical updates.')
    expect(overlay!.body).toContain('Messaging is a platform')
  })

  test('returns null when file does not exist', async () => {
    const overlay = await loadOverlay('tests/fixtures/overlays/does-not-exist.md')
    expect(overlay).toBeNull()
  })
})
