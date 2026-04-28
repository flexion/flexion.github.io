class CopyButton extends HTMLElement {
  connectedCallback() {
    this.addEventListener('click', this.handleClick)
  }
  disconnectedCallback() {
    this.removeEventListener('click', this.handleClick)
  }
  private handleClick = async (event: Event) => {
    const button = (event.target as HTMLElement).closest('button')
    if (!button || !this.contains(button)) return
    const source = this.querySelector<HTMLElement>('[data-copy-source]')
    if (!source) return
    await navigator.clipboard.writeText(source.textContent?.trim() ?? '')
    button.dataset.copied = 'true'
  }
}

if (!customElements.get('copy-button')) {
  customElements.define('copy-button', CopyButton)
}
