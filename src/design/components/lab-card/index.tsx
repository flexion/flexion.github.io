import { Link } from '../link'
import type { FeaturedLab } from '../../../build/featured'

export function LabCard({ lab }: { lab: FeaturedLab }) {
  return (
    <article class="lab-card">
      <h3 class="lab-card__title">{lab.title}</h3>
      <p class="lab-card__tagline">{lab.tagline}</p>
      <ul class="lab-card__links">
        {lab.links.map((link) => (
          <li class="lab-card__link">
            <Link href={link.url} external>{link.label}</Link>
          </li>
        ))}
      </ul>
    </article>
  )
}
