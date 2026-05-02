import { describe, test, expect } from 'bun:test'
import { renderToHtml } from '../../src/build/render'
import { Home } from '../../src/pages/home'
import type { FeaturedLab } from '../../src/build/featured'

const config = { basePath: '/', buildTime: '2026-05-01T12:00:00Z' }

const hero = {
  title: 'Flexion Labs',
  subtitle: 'Solutions for the public, in the open',
  intro: '<p>Flexion is committed to <a href="https://flexion.us/contact-us/">reach out to us</a> excellence.</p>',
  learnMore: {
    commitment: 'Flexion is open by default.',
    about: 'We help organizations stay future-ready.',
  },
}

const featured: FeaturedLab[] = [
  {
    title: 'Forms Lab',
    tagline: 'Digitize forms to create modern, accessible experiences for public outreach.',
    order: 1,
    links: [
      { label: 'Demo (Forms Platform)', url: 'https://pp4cc7kwbf.us-east-1.awsapprunner.com/' },
      { label: 'GitHub repository — Forms Platform', url: 'https://github.com/flexion/forms' },
    ],
  },
  {
    title: 'Messaging Lab',
    tagline: 'Text messaging services to deliver critical updates to the people you serve.',
    order: 2,
    links: [
      { label: 'GitHub repository', url: 'https://github.com/flexion/flexion-notify' },
    ],
  },
  {
    title: 'Document Extractor Lab',
    tagline: 'Accurately extract data from PDFs and images for faster application processing.',
    order: 3,
    links: [
      { label: 'GitHub repository', url: 'https://github.com/flexion/document-extractor' },
    ],
  },
]

describe('Home', () => {
  test('renders the site title as the h1', async () => {
    const html = await renderToHtml(<Home hero={hero} featured={featured} config={config} />)
    expect(html).toMatch(/<h1[^>]*>Flexion Labs<\/h1>/)
  })

  test('renders the subtitle', async () => {
    const html = await renderToHtml(<Home hero={hero} featured={featured} config={config} />)
    expect(html).toContain('Solutions for the public, in the open')
  })

  test('renders the intro markdown as HTML including the reach-out link', async () => {
    const html = await renderToHtml(<Home hero={hero} featured={featured} config={config} />)
    expect(html).toContain('href="https://flexion.us/contact-us/"')
  })

  test('renders one LabCard per featured lab in order', async () => {
    const html = await renderToHtml(<Home hero={hero} featured={featured} config={config} />)
    const indexOf = (s: string) => html.indexOf(s)
    expect(indexOf('Forms Lab')).toBeGreaterThan(-1)
    expect(indexOf('Messaging Lab')).toBeGreaterThan(-1)
    expect(indexOf('Document Extractor Lab')).toBeGreaterThan(-1)
    expect(indexOf('Forms Lab')).toBeLessThan(indexOf('Messaging Lab'))
    expect(indexOf('Messaging Lab')).toBeLessThan(indexOf('Document Extractor Lab'))
  })

  test('renders each labs links inside its card', async () => {
    const html = await renderToHtml(<Home hero={hero} featured={featured} config={config} />)
    expect(html).toContain('href="https://github.com/flexion/forms"')
    expect(html).toContain('href="https://github.com/flexion/flexion-notify"')
    expect(html).toContain('href="https://github.com/flexion/document-extractor"')
  })

  test('renders the Learn more section with commitment and about teasers', async () => {
    const html = await renderToHtml(<Home hero={hero} featured={featured} config={config} />)
    expect(html).toContain('Learn more')
    expect(html).toContain('Our open source commitment')
    expect(html).toContain('About Flexion')
    expect(html).toContain('href="/commitment/"')
    expect(html).toContain('href="https://flexion.us/"')
  })

  test('does not render the stats strip', async () => {
    const html = await renderToHtml(<Home hero={hero} featured={featured} config={config} />)
    expect(html).not.toContain('home-stats')
    expect(html).not.toContain('public projects')
  })
})
