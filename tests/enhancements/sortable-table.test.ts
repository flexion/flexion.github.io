import { describe, test, expect, beforeEach } from 'bun:test'
import { Window } from 'happy-dom'

let window: Window

beforeEach(async () => {
  window = new Window()
  ;(globalThis as any).window = window
  ;(globalThis as any).document = window.document
  ;(globalThis as any).HTMLElement = window.HTMLElement
  ;(globalThis as any).customElements = window.customElements
  delete require.cache[require.resolve('../../src/design/components/sortable-table/client.ts')]
  await import('../../src/design/components/sortable-table/client.ts')
})

describe('<sortable-table>', () => {
  test('clicking a column header sorts rows ascending by that column', async () => {
    document.body.innerHTML = `
      <sortable-table>
        <table>
          <thead>
            <tr><th scope="col">Name</th><th scope="col">Stars</th></tr>
          </thead>
          <tbody>
            <tr><th scope="row">b</th><td>3</td></tr>
            <tr><th scope="row">a</th><td>10</td></tr>
          </tbody>
        </table>
      </sortable-table>
    `
    // Wait for init() to complete
    await new Promise((r) => setTimeout(r, 0))
    const firstHeader = document.querySelectorAll('thead th')[0] as HTMLElement
    firstHeader.dispatchEvent(new window.Event('click', { bubbles: true }))
    const firstRow = document.querySelector('tbody tr th') as HTMLElement
    expect(firstRow.textContent).toBe('a')
  })
})
