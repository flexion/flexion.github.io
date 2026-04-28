import type { HtmlEscapedString } from 'hono/utils/html'

export async function renderToHtml(
  element: HtmlEscapedString | Promise<HtmlEscapedString>,
): Promise<string> {
  const resolved = await Promise.resolve(element)
  return '<!doctype html>\n' + resolved.toString()
}
