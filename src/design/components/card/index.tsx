import type { Child } from 'hono/jsx'

export function Card({ children }: { children: Child }) {
  return (
    <article class="card">
      {children}
    </article>
  )
}
