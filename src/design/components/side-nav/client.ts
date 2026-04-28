class SideNav extends HTMLElement {
  private observer: IntersectionObserver | null = null

  connectedCallback() {
    // Collect the target IDs from the nav links
    const links = this.querySelectorAll<HTMLAnchorElement>('.side-nav__link')
    const ids: string[] = []
    for (const link of links) {
      const hash = new URL(link.href).hash
      if (hash) ids.push(hash.slice(1))
    }

    if (ids.length === 0) return

    // Mark the first link as current initially
    this.setCurrent(ids[0])

    // Observe each target section
    this.observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost visible section
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.setCurrent(entry.target.id)
            break
          }
        }
      },
      { rootMargin: '-10% 0px -80% 0px' },
    )

    for (const id of ids) {
      const target = document.getElementById(id)
      if (target) this.observer.observe(target)
    }
  }

  disconnectedCallback() {
    this.observer?.disconnect()
  }

  private setCurrent(id: string) {
    for (const link of this.querySelectorAll<HTMLAnchorElement>('.side-nav__link')) {
      const linkHash = new URL(link.href).hash
      if (linkHash === `#${id}`) {
        link.setAttribute('aria-current', 'true')
      } else {
        link.removeAttribute('aria-current')
      }
    }
  }
}

if (!customElements.get('side-nav')) {
  customElements.define('side-nav', SideNav)
}
