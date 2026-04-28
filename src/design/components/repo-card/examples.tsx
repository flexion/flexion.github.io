import { RepoCard } from './index'
import type { CatalogEntry } from '../../../catalog/types'

const example: CatalogEntry = {
  name: 'example-project',
  description: 'A demonstration project showing the repo card component.',
  url: 'https://github.com/flexion/example-project',
  homepage: null,
  language: 'TypeScript',
  license: 'Apache-2.0',
  pushedAt: '2026-04-20T00:00:00Z',
  archived: false,
  fork: false,
  stars: 12,
  hasReadme: true,
  hasLicense: true,
  hasContributing: true,
  tier: 'active',
  category: 'product',
  featured: true,
  hidden: false,
  overlay: { title: 'Example Project', summary: 'A demonstration project showing the repo card component.' },
}

export function RepoCardExamples() {
  return (
    <section id="repo-card">
      <h2>Repo card</h2>
      <p>Displays a repository with its name, description, tier and category tags. Links to the repo's detail page.</p>
      <div style="max-inline-size: 24rem;">
        <RepoCard entry={example} basePath="/" />
      </div>
    </section>
  )
}
