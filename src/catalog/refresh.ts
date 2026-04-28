import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { GithubSnapshotEntry } from './types'

export type FetchImpl = (input: string, init?: RequestInit) => Promise<Response>
export type FileCheck = (org: string, repo: string, path: string) => Promise<boolean>

export type BuildSnapshotOptions = {
  org: string
  fetch: FetchImpl
  fileCheck: FileCheck
  token?: string
}

type ApiRepo = {
  name: string
  description: string | null
  html_url: string
  homepage: string | null
  language: string | null
  license: { spdx_id?: string } | null
  pushed_at: string
  archived: boolean
  fork: boolean
  stargazers_count: number
  private: boolean
}

export async function buildSnapshot(
  options: BuildSnapshotOptions,
): Promise<GithubSnapshotEntry[]> {
  const repos = await fetchAllRepos(options)
  const snapshot: GithubSnapshotEntry[] = []
  for (const repo of repos) {
    if (repo.private) continue
    const [hasReadme, hasLicenseFile, hasContributing] = await Promise.all([
      options.fileCheck(options.org, repo.name, 'README.md'),
      options.fileCheck(options.org, repo.name, 'LICENSE'),
      options.fileCheck(options.org, repo.name, 'CONTRIBUTING.md'),
    ])
    snapshot.push({
      name: repo.name,
      description: repo.description,
      url: repo.html_url,
      homepage: repo.homepage,
      language: repo.language,
      license: repo.license?.spdx_id ?? null,
      pushedAt: repo.pushed_at,
      archived: repo.archived,
      fork: repo.fork,
      stars: repo.stargazers_count,
      hasReadme,
      hasLicense: Boolean(repo.license?.spdx_id) || hasLicenseFile,
      hasContributing,
    })
  }
  return snapshot
}

async function fetchAllRepos(options: BuildSnapshotOptions): Promise<ApiRepo[]> {
  const headers: Record<string, string> = {
    accept: 'application/vnd.github+json',
    'user-agent': 'flexion-labs-refresh',
  }
  if (options.token) headers.authorization = `Bearer ${options.token}`

  const repos: ApiRepo[] = []
  let page = 1
  while (true) {
    const res = await options.fetch(
      `https://api.github.com/orgs/${options.org}/repos?per_page=100&page=${page}&type=public`,
      { headers },
    )
    if (!res.ok) throw new Error(`GitHub API ${res.status} ${res.statusText}`)
    const batch = (await res.json()) as ApiRepo[]
    repos.push(...batch)
    if (batch.length < 100) break
    page += 1
  }
  return repos
}

export async function writeSnapshot(
  rootDir: string,
  snapshot: GithubSnapshotEntry[],
): Promise<void> {
  const path = join(rootDir, 'data', 'repos.json')
  const sorted = [...snapshot].sort((a, b) => a.name.localeCompare(b.name))
  await writeFile(path, JSON.stringify(sorted, null, 2) + '\n', 'utf8')
}

if (import.meta.main) {
  const token = process.env.GITHUB_TOKEN
  const org = process.env.FLEXION_ORG ?? 'flexion'
  const fileCheck: FileCheck = async (o, r, p) => {
    const res = await fetch(`https://api.github.com/repos/${o}/${r}/contents/${p}`, {
      headers: token ? { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json' } : { accept: 'application/vnd.github+json' },
    })
    return res.ok
  }
  const snapshot = await buildSnapshot({ org, fetch, fileCheck, token })
  await writeSnapshot(process.cwd(), snapshot)
  console.log(`Wrote ${snapshot.length} entries to data/repos.json`)
}
