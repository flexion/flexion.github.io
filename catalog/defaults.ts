import type {
  Category,
  GithubSnapshotEntry,
  OverrideEntry,
  Tier,
} from './types'

type Resolved = {
  tier: Tier
  category: Category
  featured: boolean
  hidden: boolean
}

export function applyDefaults(
  snapshot: GithubSnapshotEntry,
  override: OverrideEntry,
): Resolved {
  let tier: Tier | undefined = override.tier
  let category: Category | undefined = override.category

  // Apply category defaults first
  if (snapshot.fork) {
    category ??= 'fork'
  }
  category ??= 'uncategorized'

  // Apply tier defaults with archived taking precedence
  if (!tier) {
    if (snapshot.archived) {
      tier = 'archived'
    } else if (snapshot.fork) {
      tier = 'as-is'
    } else {
      tier = 'unreviewed'
    }
  }

  return {
    tier,
    category,
    featured: override.featured ?? false,
    hidden: override.hidden ?? false,
  }
}
