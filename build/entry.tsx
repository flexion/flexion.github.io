import { mkdir, writeFile, copyFile, readdir, stat } from 'node:fs/promises'
import { join, dirname, relative } from 'node:path'
import { renderToHtml } from './render'
import { createConfig, getBasePath } from './config'
import { loadCatalog } from '../catalog/load'
import { loadHero } from './hero'
import { allRoutes } from './routes'
import { Home } from '../views/home'
import { WorkIndex } from '../views/work/index'
import { WorkDetail } from '../views/work/detail'
import { Health } from '../views/work/health'
import { Commitment } from '../views/commitment'
import { About } from '../views/about'
import { SHOW_PER_REPO_FAILURES } from '../standards/repo-checks'

export type BuildOptions = {
  rootDir: string
  outDir: string
  basePath?: string
  now?: Date
}

export async function buildSite(options: BuildOptions): Promise<void> {
  const rootDir = options.rootDir
  const outDir = options.outDir
  const now = options.now ?? new Date()
  const config = {
    basePath: options.basePath
      ? getBasePath(options.basePath)
      : createConfig(process.env).basePath,
    buildTime: now.toISOString(),
  }

  const [catalog, hero] = await Promise.all([
    loadCatalog(rootDir),
    loadHero(rootDir),
  ])
  const commitmentBody = await loadContentBody(
    join(rootDir, 'content', 'commitment.md'),
  )
  const aboutBody = await loadContentBody(join(rootDir, 'content', 'about.md'))

  const routes = allRoutes(catalog)

  for (const route of routes) {
    const html = await render(
      route,
      catalog,
      hero,
      commitmentBody,
      aboutBody,
      config,
      now,
    )
    const outPath = join(
      outDir,
      route.path === '/'
        ? 'index.html'
        : route.path.replace(/^\//, '').replace(/\/$/, '/index.html'),
    )
    await mkdir(dirname(outPath), { recursive: true })
    await writeFile(outPath, html, 'utf8')
  }

  await copyTree(join(rootDir, 'styles'), join(outDir, 'styles'))
  await Bun.build({
    entrypoints: [join(rootDir, 'enhancements', 'register.ts')],
    outdir: join(outDir, 'enhancements'),
    target: 'browser',
    naming: '[name].js',
    minify: true,
    sourcemap: 'linked',
  })
  await copyTree(join(rootDir, 'assets'), join(outDir, 'assets'))
}

async function render(
  route: ReturnType<typeof allRoutes>[number],
  catalog: Awaited<ReturnType<typeof loadCatalog>>,
  hero: Awaited<ReturnType<typeof loadHero>>,
  commitmentBody: string,
  aboutBody: string,
  config: { basePath: string; buildTime: string },
  now: Date,
): Promise<string> {
  switch (route.view) {
    case 'home':
      return renderToHtml(<Home catalog={catalog} hero={hero} config={config} />)
    case 'work-index':
      return renderToHtml(<WorkIndex catalog={catalog} config={config} />)
    case 'health':
      return renderToHtml(
        <Health
          catalog={catalog}
          now={now}
          config={config}
          showPerRepo={SHOW_PER_REPO_FAILURES}
        />,
      )
    case 'commitment':
      return renderToHtml(<Commitment body={commitmentBody} config={config} />)
    case 'about':
      return renderToHtml(<About body={aboutBody} config={config} />)
    case 'work-detail': {
      const entry = catalog.find((e) => e.name === route.slug)!
      return renderToHtml(<WorkDetail entry={entry} now={now} config={config} />)
    }
  }
}

async function loadContentBody(path: string): Promise<string> {
  const raw = await Bun.file(path).text()
  return raw.replace(/^---\n[\s\S]*?\n---\n?/, '').trim()
}

async function copyTree(src: string, dst: string): Promise<void> {
  let entries: string[]
  try {
    entries = await readdir(src)
  } catch {
    return
  }
  await mkdir(dst, { recursive: true })
  for (const entry of entries) {
    const from = join(src, entry)
    const to = join(dst, entry)
    const info = await stat(from)
    if (info.isDirectory()) {
      await copyTree(from, to)
    } else {
      await copyFile(from, to)
    }
  }
}

if (import.meta.main) {
  const outDir = process.env.OUT_DIR ?? join(process.cwd(), 'dist')
  await buildSite({ rootDir: process.cwd(), outDir })
  console.log(`Built site to ${relative(process.cwd(), outDir)}/`)
}
