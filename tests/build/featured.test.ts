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

  test('Forms Lab carries sub-project groups and typed links', async () => {
    const labs = await loadFeatured(ROOT)
    const forms = labs.find((l) => l.title === 'Forms Lab')!
    expect(forms.tagline).toBe(
      'Digitize forms to create modern, accessible experiences for public outreach.',
    )
    expect(forms.order).toBe(1)
    expect(forms.links).toHaveLength(4)
    expect(forms.links[0]).toEqual({
      label: 'Live demo',
      url: 'https://pp4cc7kwbf.us-east-1.awsapprunner.com/',
      kind: 'demo',
      group: 'Forms Platform',
    })
    // All four links belong to one of two groups
    const groups = new Set(forms.links.map((l) => l.group))
    expect(groups).toEqual(new Set(['Forms Platform', 'Forms Lab (experiment)']))
  })

  test('Messaging Lab has a single typed link, no group', async () => {
    const labs = await loadFeatured(ROOT)
    const messaging = labs.find((l) => l.title === 'Messaging Lab')!
    expect(messaging.links).toEqual([
      {
        label: 'Repository',
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
