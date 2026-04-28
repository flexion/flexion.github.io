import type { RepoEvaluation } from '../../catalog/repo-checks'

const CHECKS: ReadonlyArray<{ key: keyof Omit<RepoEvaluation, 'overallPass'>; label: string }> = [
  { key: 'readme', label: 'README' },
  { key: 'license', label: 'License' },
  { key: 'contributing', label: 'Contributing guide' },
  { key: 'activity', label: 'Recent activity' },
  { key: 'tierAssigned', label: 'Tier assigned' },
]

export function StandardsList({ evaluation }: { evaluation: RepoEvaluation }) {
  return (
    <ul class="standards-list">
      {CHECKS.map((check) => (
        <li class={`standards-list__item--${evaluation[check.key]}`}>
          <span class="standards-list__label">{check.label}</span>
          <span class="standards-list__result">{evaluation[check.key]}</span>
        </li>
      ))}
    </ul>
  )
}
