import type { Catalog, CatalogEntry } from '../../catalog/types'

function entry(overrides: Partial<CatalogEntry>): CatalogEntry {
  return {
    name: overrides.name ?? 'example',
    description: overrides.description ?? null,
    url: overrides.url ?? 'https://github.com/flexion/example',
    homepage: overrides.homepage ?? null,
    language: overrides.language ?? null,
    license: overrides.license ?? null,
    pushedAt: overrides.pushedAt ?? '2026-04-20T00:00:00Z',
    archived: overrides.archived ?? false,
    fork: overrides.fork ?? false,
    stars: overrides.stars ?? 0,
    hasReadme: overrides.hasReadme ?? true,
    hasLicense: overrides.hasLicense ?? true,
    hasContributing: overrides.hasContributing ?? true,
    tier: overrides.tier ?? 'unreviewed',
    category: overrides.category ?? 'uncategorized',
    featured: overrides.featured ?? false,
    hidden: overrides.hidden ?? false,
    overlay: overrides.overlay ?? null,
  }
}

export const fixtureCatalog: Catalog = [
  entry({
    name: 'messaging',
    description: 'Messaging — text-based notifications for critical updates.',
    url: 'https://github.com/flexion/messaging',
    language: 'TypeScript',
    license: 'Apache-2.0',
    tier: 'active',
    category: 'product',
    featured: true,
    overlay: {
      title: 'Messaging',
      summary: 'Text-based communication for critical updates.',
      body: '<p>Messaging body copy.</p>',
    },
  }),
  entry({
    name: 'forms',
    description: 'Accessible form experiences for public agencies.',
    language: 'TypeScript',
    license: 'Apache-2.0',
    tier: 'active',
    category: 'product',
    featured: true,
  }),
  entry({
    name: 'document-extractor',
    description: 'Extract structured data from PDFs and images.',
    language: 'Python',
    license: 'Apache-2.0',
    tier: 'active',
    category: 'product',
    featured: true,
  }),
  entry({
    name: 'old-prototype',
    description: 'An old experiment.',
    pushedAt: '2022-01-01T00:00:00Z',
    tier: 'as-is',
    category: 'prototype',
  }),
  entry({
    name: 'fork-of-thing',
    description: 'A fork we picked up.',
    fork: true,
    tier: 'as-is',
    category: 'fork',
  }),
  entry({
    name: 'archived-thing',
    description: 'An archived repo.',
    archived: true,
    hasLicense: false,
    hasContributing: false,
    tier: 'archived',
    category: 'tool',
  }),
  entry({
    name: 'unreviewed-thing',
    description: null,
    hasReadme: false,
  }),
]

export const fixtureNow = new Date('2026-04-27T00:00:00Z')
