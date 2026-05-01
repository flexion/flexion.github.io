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

  test('returns the expected shape for each lab', async () => {
    const labs = await loadFeatured(ROOT)
    const forms = labs.find((l) => l.title === 'Forms Lab')!
    expect(forms.tagline).toBe(
      'Digitize forms to create modern, accessible experiences for public outreach.',
    )
    expect(forms.order).toBe(1)
    expect(forms.links).toHaveLength(4)
    expect(forms.links[0]).toEqual({
      label: 'Demo (Forms Platform)',
      url: 'https://pp4cc7kwbf.us-east-1.awsapprunner.com/',
    })
  })

  test('Messaging Lab has a single link to flexion-notify', async () => {
    const labs = await loadFeatured(ROOT)
    const messaging = labs.find((l) => l.title === 'Messaging Lab')!
    expect(messaging.links).toEqual([
      { label: 'GitHub repository', url: 'https://github.com/flexion/flexion-notify' },
    ])
  })
})
