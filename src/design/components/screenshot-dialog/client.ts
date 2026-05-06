class ScreenshotDialogElement extends HTMLElement {
  private dialog: HTMLDialogElement | null = null
  private images: HTMLImageElement[] = []
  private current = 0

  connectedCallback() {
    this.dialog = this.querySelector('dialog')
    if (!this.dialog) return

    this.images = Array.from(this.dialog.querySelectorAll('.screenshot-dialog__img'))
    this.dialog.addEventListener('click', this.handleBackdropClick)

    this.dialog.querySelector('[data-close-dialog]')
      ?.addEventListener('click', () => this.dialog?.close())

    this.dialog.querySelector('[data-prev]')
      ?.addEventListener('click', () => this.show(this.current - 1))

    this.dialog.querySelector('[data-next]')
      ?.addEventListener('click', () => this.show(this.current + 1))

    // Find the button that opens this dialog (outside this element, in the card)
    const dialogId = this.dialog.id
    if (dialogId) {
      const opener = document.querySelector(`[data-open-dialog="${dialogId}"]`)
      opener?.addEventListener('click', () => {
        this.show(0)
        this.dialog?.showModal()
      })
    }
  }

  disconnectedCallback() {
    this.dialog?.removeEventListener('click', this.handleBackdropClick)
  }

  private show(index: number) {
    if (index < 0 || index >= this.images.length) return
    this.current = index

    for (const img of this.images) {
      img.hidden = true
    }
    this.images[index].hidden = false

    const counter = this.dialog?.querySelector('.screenshot-dialog__counter')
    if (counter && this.images.length > 1) {
      counter.textContent = `${index + 1} of ${this.images.length}`
    }

    const prev = this.dialog?.querySelector('[data-prev]') as HTMLButtonElement | null
    const next = this.dialog?.querySelector('[data-next]') as HTMLButtonElement | null
    if (prev) prev.disabled = index === 0
    if (next) next.disabled = index === this.images.length - 1
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
