import type { Child } from 'hono/jsx'

export type BadgeVariant =
  | `tier-${'active' | 'as-is' | 'archived' | 'unreviewed'}`
  | `category-${'product' | 'tool' | 'workshop' | 'prototype' | 'fork' | 'uncategorized'}`
  | 'pass'
  | 'warn'
  | 'fail'

export function Badge({
  variant,
  children,
}: {
  variant: BadgeVariant
  children: Child
}) {
  return <span class={`badge badge--${variant}`}>{children}</span>
}
