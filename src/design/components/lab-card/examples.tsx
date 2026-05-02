import { LabCard } from './index'
import type { FeaturedLab } from '../../../build/featured'

const multiProject: FeaturedLab = {
  title: 'Forms Lab',
  tagline: 'Digitize forms to create modern, accessible experiences for public outreach.',
  order: 1,
  links: [
    { label: 'Forms Platform', url: 'https://example.com/platform', kind: 'demo' },
    { label: 'flexion/forms', url: 'https://github.com/flexion/forms', kind: 'repo' },
    { label: 'Forms Lab (experiment)', url: 'https://example.com/lab', kind: 'demo' },
    { label: 'flexion/forms-lab', url: 'https://github.com/flexion/forms-lab', kind: 'repo' },
  ],
}

const singleLink: FeaturedLab = {
  title: 'Messaging Lab',
  tagline: 'Text messaging services to deliver critical updates to the people you serve.',
  order: 2,
  links: [
    { label: 'flexion/flexion-notify', url: 'https://github.com/flexion/flexion-notify', kind: 'repo' },
  ],
}

const withCaseStudy: FeaturedLab = {
  title: 'Document Extractor Lab',
  tagline: 'Accurately extract data from PDFs and images for faster application processing.',
  order: 3,
  links: [
    { label: 'flexion/document-extractor', url: 'https://github.com/flexion/document-extractor', kind: 'repo' },
    { label: 'Flexion case study', url: 'https://flexion.us/case-study/document-extraction-for-faster-processing/', kind: 'case-study' },
  ],
}

export function LabCardExamples() {
  return (
    <section id="lab-card">
      <h2>Lab card</h2>
      <p>
        Featured-lab card on the home page. Title and tagline sit on top; each link becomes
        its own column below, titled with the link kind (Demo, Repository, or Case study).
        Columns flow from 1 → 2 → 4 based on card width.
      </p>
      <div class="l-stack" data-space="md">
        <LabCard lab={multiProject} />
        <LabCard lab={singleLink} />
        <LabCard lab={withCaseStudy} />
      </div>
    </section>
  )
}
