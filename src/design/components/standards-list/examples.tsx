import { StandardsList } from './index'
import type { RepoEvaluation } from '../../../catalog/repo-checks'

const evaluation: RepoEvaluation = {
  readme: 'pass',
  license: 'pass',
  contributing: 'fail',
  activity: 'warn',
  tierAssigned: 'pass',
  overallPass: false,
}

export function StandardsListExamples() {
  return (
    <section id="standards-list">
      <h2>Standards list</h2>
      <p>Stewardship checklist showing pass/warn/fail status for each repository standard. Uses a left border accent to indicate status.</p>
      <div style="max-inline-size: 24rem;">
        <StandardsList evaluation={evaluation} />
      </div>
    </section>
  )
}
