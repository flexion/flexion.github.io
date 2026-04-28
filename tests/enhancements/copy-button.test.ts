import { describe, test, expect, beforeEach } from 'bun:test'
import { Window } from 'happy-dom'

let window: Window

beforeEach(async () => {
  window = new Window()
  ;(globalThis as any).window = window
  ;(globalThis as any).document = window.document
  ;(globalThis as any).HTMLElement = window.HTMLElement
  ;(globalThis as any).customElements = window.customElements
  ;(globalThis as any).navigator = window.navigator
  delete require.cache[require.resolve('../../src/design/components/copy-button/client.ts')]
  await import('../../src/design/components/copy-button/client.ts')
})

describe('<copy-button>', () => {
  test('writes the target text to the clipboard when the button is clicked', async () => {
    let copied: string | null = null
    Object.defineProperty((globalThis as any).navigator, 'clipboard', {
      value: {
        writeText: async (t: string) => { copied = t },
      },
      writable: true,
      configurable: true,
    })
    document.body.innerHTML = `
      <copy-button>
        <pre data-copy-source>echo hello</pre>
        <button type="button">Copy</button>
      </copy-button>
    `
    const btn = document.querySelector('button')!
    btn.dispatchEvent(new window.Event('click', { bubbles: true }))
    await new Promise((r) => setTimeout(r, 0))
    expect(copied).toBe('echo hello')
  })
})
