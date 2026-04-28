import type { Child } from 'hono/jsx'

export type TagVariant =
  | `tier-${'active' | 'as-is' | 'archived' | 'unreviewed'}`
  | `category-${'product' | 'tool' | 'workshop' | 'prototype' | 'fork' | 'uncategorized'}`
  | 'pass' | 'warn' | 'fail'

export function Tag({ variant, children }: { variant: TagVariant; children: Child }) {
  return <span class="tag" data-variant={variant}>{children}</span>
}

// Backward compatibility during migration
export { Tag as Badge }
export type { TagVariant as BadgeVariant }
