import { ContentPage } from '../common/content-page'
import type { SiteConfig } from '../../build/config'

export function Commitment({
  body,
  config,
}: {
  body: string
  config: SiteConfig
}) {
  return <ContentPage title="Commitment" body={body} config={config} />
}
