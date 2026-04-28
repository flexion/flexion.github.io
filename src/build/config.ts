export function getBasePath(raw: string | undefined): string {
  if (!raw || raw === '' || raw === '/') return '/'
  const trimmed = raw.replace(/^\/+/, '').replace(/\/+$/, '')
  return `/${trimmed}/`
}

export type SiteConfig = {
  basePath: string
  buildTime: string
}

export function createConfig(env: NodeJS.ProcessEnv = process.env): SiteConfig {
  return {
    basePath: getBasePath(env.SITE_BASE_URL),
    buildTime: new Date().toISOString(),
  }
}
