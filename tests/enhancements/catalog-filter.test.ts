import { describe, test, expect, beforeEach } from 'bun:test'
import { Window } from 'happy-dom'

let window: Window

beforeEach(async () => {
  window = new Window()
  ;(globalThis as any).window = window
  ;(globalThis as any).document = window.document
  ;(globalThis as any).HTMLElement = window.HTMLElement
  ;(globalThis as any).customElements = window.customElements
  delete require.cache[require.resolve('../../src/web/components/catalog-filter.ts')]
  await import('../../src/web/components/catalog-filter.ts')
})

describe('<catalog-filter>', () => {
  test('hides list items whose data-tier does not match the selected filter', () => {
    document.body.innerHTML = `
      <catalog-filter>
        <form>
          <select name="tier">
            <option value="">All</option>
            <option value="active">Active</option>
          </select>
          <select name="category">
            <option value="">All</option>
          </select>
          <button type="submit">Apply</button>
        </form>
        <ul>
          <li data-tier="active" data-category="product"><a href="/work/a/">a</a></li>
          <li data-tier="as-is" data-category="tool"><a href="/work/b/">b</a></li>
        </ul>
      </catalog-filter>
    `
    const select = document.querySelector('select[name="tier"]') as any
    select.value = 'active'
    select.dispatchEvent(new window.Event('change', { bubbles: true }))
    const items = document.querySelectorAll('li')
    expect(items[0].getAttribute('hidden')).toBeNull()
    expect(items[1].getAttribute('hidden')).toBe('')
  })

  test('hiding a category filters in addition to tier (logical AND)', () => {
    document.body.innerHTML = `
      <catalog-filter>
        <form>
          <select name="tier"><option value="">All</option><option value="active">Active</option></select>
          <select name="category"><option value="">All</option><option value="tool">Tool</option></select>
        </form>
        <ul>
          <li data-tier="active" data-category="product"><a href="/a/">a</a></li>
          <li data-tier="active" data-category="tool"><a href="/b/">b</a></li>
        </ul>
      </catalog-filter>
    `
    const tier = document.querySelector('select[name="tier"]') as any
    const cat = document.querySelector('select[name="category"]') as any
    tier.value = 'active'
    cat.value = 'tool'
    cat.dispatchEvent(new window.Event('change', { bubbles: true }))
    const items = document.querySelectorAll('li')
    expect(items[0].getAttribute('hidden')).toBe('')
    expect(items[1].getAttribute('hidden')).toBeNull()
  })
})
