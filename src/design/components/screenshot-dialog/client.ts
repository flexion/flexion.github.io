class ScreenshotDialogElement extends HTMLElement {
  private dialog: HTMLDialogElement | null = null

  connectedCallback() {
    this.dialog = this.querySelector('dialog')
    if (!this.dialog) return

    this.dialog.addEventListener('click', this.handleBackdropClick)

    this.dialog.querySelector('[data-close-dialog]')
      ?.addEventListener('click', () => this.dialog?.close())

    // Find the button that opens this dialog (outside this element, in the card)
    const dialogId = this.dialog.id
    if (dialogId) {
      const opener = document.querySelector(`[data-open-dialog="${dialogId}"]`)
      opener?.addEventListener('click', () => this.dialog?.showModal())
    }
  }

  disconnectedCallback() {
    this.dialog?.removeEventListener('click', this.handleBackdropClick)
  }

  handleBackdropClick = (e: Event) => {
    if (e.target === this.dialog) {
      this.dialog.close()
    }
  }
}

if (!customElements.get('screenshot-dialog')) {
  customElements.define('screenshot-dialog', ScreenshotDialogElement)
}
