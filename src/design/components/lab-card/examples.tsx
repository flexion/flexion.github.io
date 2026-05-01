import { LabCard } from './index'

const example = {
  title: 'Forms Lab',
  tagline: 'Digitize forms to create modern, accessible experiences for public outreach.',
  order: 1,
  links: [
    { label: 'Demo (Forms Platform)', url: 'https://example.com/demo' },
    { label: 'GitHub repository — Forms Platform', url: 'https://github.com/flexion/forms' },
    { label: 'GitHub repository — Forms Lab (experiment)', url: 'https://github.com/flexion/forms-lab' },
  ],
}

export function LabCardExamples() {
  return (
    <section id="lab-card">
      <h2>Lab card</h2>
      <p>Featured-lab card on the home page. Title is not a link; each link inside the card is an external link.</p>
      <LabCard lab={example} />
    </section>
  )
}
