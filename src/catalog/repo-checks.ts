import type { CatalogEntry } from './types'

export type CheckResult = 'pass' | 'warn' | 'fail'

export type RepoEvaluation = {
  readme: CheckResult
  license: CheckResult
  contributing: CheckResult
  activity: CheckResult
  tierAssigned: CheckResult
  overallPass: boolean
}

const SIX_MONTHS_MS = 1000 * 60 * 60 * 24 * 30 * 6
const EIGHTEEN_MONTHS_MS = SIX_MONTHS_MS * 3

export const SHOW_PER_REPO_FAILURES = true

export function evaluateRepo(entry: CatalogEntry, now: Date): RepoEvaluation {
  const readme = entry.hasReadme ? 'pass' : 'fail'
  const license = entry.hasLicense ? 'pass' : 'fail'
  const contributing = entry.hasContributing ? 'pass' : 'fail'
  const tierAssigned = entry.tier === 'unreviewed' ? 'fail' : 'pass'
  const activity = evaluateActivity(entry, now)

  const overallPass =
    readme === 'pass' &&
    license === 'pass' &&
    contributing === 'pass' &&
    tierAssigned === 'pass' &&
    activity !== 'fail'

  return { readme, license, contributing, activity, tierAssigned, overallPass }
}

function evaluateActivity(entry: CatalogEntry, now: Date): CheckResult {
  if (entry.tier === 'archived') return 'pass'
  const age = now.getTime() - new Date(entry.pushedAt).getTime()
  if (age < SIX_MONTHS_MS) return 'pass'
  if (age < EIGHTEEN_MONTHS_MS) return 'warn'
  return 'fail'
}
