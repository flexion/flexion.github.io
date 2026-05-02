import { LabCard } from './index'
import type { FeaturedLab } from '../../../build/featured'

const multiProject: FeaturedLab = {
  title: 'Forms Lab',
  tagline: 'Digitize forms to create modern, accessible experiences for public outreach.',
  order: 1,
  links: [
    { label: 'Live demo', url: 'https://example.com/demo', kind: 'demo', group: 'Forms Platform' },
    { label: 'Repository', url: 'https://github.com/flexion/forms', kind: 'repo', group: 'Forms Platform' },
    { label: 'Live demo', url: 'https://example.com/lab', kind: 'demo', group: 'Forms Lab (experiment)' },
    { label: 'Repository', url: 'https://github.com/flexion/forms-lab', kind: 'repo', group: 'Forms Lab (experiment)' },
  ],
}

const singleLink: FeaturedLab = {
  title: 'Messaging Lab',
  tagline: 'Text messaging services to deliver critical updates to the people you serve.',
  order: 2,
  links: [
    { label: 'Repository', url: 'https://github.com/flexion/flexion-notify', kind: 'repo' },
  ],
}

const withCaseStudy: FeaturedLab = {
  title: 'Document Extractor Lab',
  tagline: 'Accurately extract data from PDFs and images for faster application processing.',
  order: 3,
  links: [
    { label: 'Repository', url: 'https://github.com/flexion/document-extractor', kind: 'repo' },
    { label: 'Case study', url: 'https://flexion.us/case-study/document-extraction-for-faster-processing/', kind: 'case-study' },
  ],
}

export function LabCardExamples() {
  return (
    <section id="lab-card">
      <h2>Lab card</h2>
      <p>
        Featured-lab card on the home page. Cards read as a horizontal band on wide containers
        and stack vertically on narrow ones. Links are grouped by sub-project when a card has
        more than one, and each link is prefixed with an icon that signals its type (demo,
        repository, or case study).
      </p>
      <div class="l-stack" data-space="md">
        <LabCard lab={multiProject} />
        <LabCard lab={singleLink} />
        <LabCard lab={withCaseStudy} />
      </div>
    </section>
  )
}
