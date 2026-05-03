import { describe, test, expect } from 'bun:test'
import { loadFeatured } from '../../src/build/featured'

const ROOT = import.meta.dir + '/../..'

describe('loadFeatured', () => {
  test('loads every file in content/featured/ and returns them sorted by order', async () => {
    const labs = await loadFeatured(ROOT)
    expect(labs.map((l) => l.title)).toEqual([
      'Forms Lab',
      'Messaging Lab',
      'Document Extractor Lab',
    ])
  })

  test('Forms Lab has four typed links in document order', async () => {
    const labs = await loadFeatured(ROOT)
    const forms = labs.find((l) => l.title === 'Forms Lab')!
    expect(forms.tagline).toBe(
      'Digitize forms to create modern, accessible experiences for public outreach.',
    )
    expect(forms.order).toBe(1)
    expect(forms.links).toHaveLength(4)
    expect(forms.links.map((l) => l.kind)).toEqual(['demo', 'repo', 'demo', 'repo'])
    expect(forms.links[0]).toEqual({
      label: 'Forms Platform',
      url: 'https://pp4cc7kwbf.us-east-1.awsapprunner.com/',
      kind: 'demo',
    })
  })

  test('Messaging Lab has a single repo link', async () => {
    const labs = await loadFeatured(ROOT)
    const messaging = labs.find((l) => l.title === 'Messaging Lab')!
    expect(messaging.links).toEqual([
      {
        label: 'flexion/flexion-notify',
        url: 'https://github.com/flexion/flexion-notify',
        kind: 'repo',
      },
    ])
  })

  test('Document Extractor Lab has repo and case-study kinds', async () => {
    const labs = await loadFeatured(ROOT)
    const doc = labs.find((l) => l.title === 'Document Extractor Lab')!
    expect(doc.links.map((l) => l.kind)).toEqual(['repo', 'case-study'])
  })
})
