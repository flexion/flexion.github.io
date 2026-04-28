import type { Child } from 'hono/jsx'

export function Select({
  name,
  label,
  children,
}: {
  name: string
  label: string
  children: Child
}) {
  return (
    <label class="select">
      <span class="select__label">{label}</span>
      <select class="select__control" name={name}>
        {children}
      </select>
    </label>
  )
}
