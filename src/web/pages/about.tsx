import { ContentPage } from '../common/content-page'
import type { SiteConfig } from '../../build/config'

export function About({ body, config }: { body: string; config: SiteConfig }) {
  return <ContentPage title="About" body={body} config={config} />
}
