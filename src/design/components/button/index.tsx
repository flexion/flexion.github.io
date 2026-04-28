import type { Child } from 'hono/jsx'

export type ButtonVariant = 'secondary' | 'text'

export function Button({
  variant,
  href,
  type = 'button',
  disabled,
  children,
}: {
  variant?: ButtonVariant
  href?: string
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  children: Child
}) {
  if (href && !disabled) {
    return (
      <a class="btn" data-variant={variant} href={href}>
        {children}
      </a>
    )
  }
  return (
    <button class="btn" data-variant={variant} type={type} disabled={disabled}>
      {children}
    </button>
  )
}
