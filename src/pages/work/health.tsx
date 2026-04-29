import { Layout } from '../../design/common/layout'
import { evaluateRepo, type CheckResult, type RepoEvaluation } from '../../catalog/repo-checks'
import type { Catalog } from '../../catalog/types'
import type { SiteConfig } from '../../build/config'

declare module 'hono/jsx' {
  namespace JSX {
    interface IntrinsicElements {
      'sortable-table': { children?: any }
    }
  }
}

const CHECK_KEYS: Array<keyof Omit<RepoEvaluation, 'overallPass'>> = [
  'readme',
  'license',
  'contributing',
  'activity',
  'tierAssigned',
]
const CHECK_LABELS: Record<(typeof CHECK_KEYS)[number], string> = {
  readme: 'README',
  license: 'License',
  contributing: 'Contributing',
  activity: 'Activity',
  tierAssigned: 'Tier',
}

export function Health({
  catalog,
  now,
  config,
  showPerRepo,
}: {
  catalog: Catalog
  now: Date
  config: SiteConfig
  showPerRepo: boolean
}) {
  const evaluations = catalog.map((e) => ({ entry: e, evaluation: evaluateRepo(e, now) }))
  const passing = evaluations.filter(({ evaluation }) => evaluation.overallPass).length

  return (
    <Layout title="Repo health" config={config}>
      <h1>Repo health</h1>
      <p class="health-summary">
        <strong>{passing}</strong> of <strong>{catalog.length}</strong> repos meet the documented standards.
      </p>

      {showPerRepo ? (
        <sortable-table>
          <table class="health-table">
            <caption>Every public repository, scored against our stewardship standards.</caption>
            <thead>
              <tr>
                <th scope="col">Repository</th>
                {CHECK_KEYS.map((key) => (
                  <th scope="col">{CHECK_LABELS[key]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {evaluations.map(({ entry, evaluation }) => (
                <tr data-repo={entry.name}>
                  <th scope="row">{entry.name}</th>
                  {CHECK_KEYS.map((key) => (
                    <td
                      class={`health-cell health-cell--${evaluation[key]}`}
                      data-check={key}
                    >
                      {resultIcon(evaluation[key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </sortable-table>
      ) : (
        <p class="health-aggregate">
          Per-repo breakdown is hidden. Showing aggregate counts only.
        </p>
      )}
    </Layout>
  )
}

function resultIcon(result: CheckResult): string {
  if (result === 'pass') return '✓ pass'
  if (result === 'warn') return '○ warn'
  return '✗ fail'
}
