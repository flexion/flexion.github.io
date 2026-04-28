class CatalogFilter extends HTMLElement {
  connectedCallback() {
    this.addEventListener('change', this.apply)
  }
  disconnectedCallback() {
    this.removeEventListener('change', this.apply)
  }
  private apply = () => {
    const tier =
      (this.querySelector('select[name="tier"]') as HTMLSelectElement | null)?.value ?? ''
    const category =
      (this.querySelector('select[name="category"]') as HTMLSelectElement | null)?.value ?? ''
    for (const item of this.querySelectorAll<HTMLElement>('li')) {
      const matches =
        (tier === '' || item.dataset.tier === tier) &&
        (category === '' || item.dataset.category === category)
      if (matches) {
        item.removeAttribute('hidden')
      } else {
        item.setAttribute('hidden', '')
      }
    }
  }
}

if (!customElements.get('catalog-filter')) {
  customElements.define('catalog-filter', CatalogFilter)
}
