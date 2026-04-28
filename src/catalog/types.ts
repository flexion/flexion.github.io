export type Tier = 'active' | 'as-is' | 'archived' | 'unreviewed'

export type Category =
  | 'product'
  | 'tool'
  | 'workshop'
  | 'prototype'
  | 'fork'
  | 'uncategorized'

export type GithubSnapshotEntry = {
  name: string
  description: string | null
  url: string
  homepage: string | null
  language: string | null
  license: string | null
  pushedAt: string // ISO 8601
  archived: boolean
  fork: boolean
  stars: number
  hasReadme: boolean
  hasLicense: boolean
  hasContributing: boolean
}

export type OverrideEntry = {
  tier?: Tier
  category?: Category
  featured?: boolean
  hidden?: boolean
}

export type Overlay = {
  title?: string
  summary?: string
  highlights?: string[]
  related?: string[]
  body?: string
}

export type CatalogEntry = GithubSnapshotEntry & {
  tier: Tier
  category: Category
  featured: boolean
  hidden: boolean
  overlay: Overlay | null
}

export type Catalog = ReadonlyArray<CatalogEntry>
