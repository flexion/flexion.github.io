import type { Child } from 'hono/jsx'

export function Link({
  href,
  external,
  children,
}: {
  href: string
  external?: boolean
  children: Child
}) {
  if (external) {
    return (
      <a class="link" data-variant="external" href={href} rel="noopener external">
        {children}
      </a>
    )
  }
  return (
    <a class="link" href={href}>
      {children}
    </a>
  )
}
