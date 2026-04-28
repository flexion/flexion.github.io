class SortableTable extends HTMLElement {
  connectedCallback() {
    // Wait for children to be parsed
    setTimeout(() => this.init(), 0)
  }
  private init() {
    const headers = this.querySelectorAll<HTMLElement>('thead th')
    headers.forEach((header, index) => {
      header.setAttribute('role', 'button')
      header.setAttribute('tabindex', '0')
      header.addEventListener('click', () => this.sortBy(index))
      header.addEventListener('keydown', (event) => {
        if ((event as KeyboardEvent).key === 'Enter' || (event as KeyboardEvent).key === ' ') {
          event.preventDefault()
          this.sortBy(index)
        }
      })
    })
  }
  private sortBy(columnIndex: number) {
    const tbody = this.querySelector('tbody')
    if (!tbody) return
    const rows = Array.from(tbody.querySelectorAll('tr'))
    rows.sort((a, b) => cellText(a, columnIndex).localeCompare(cellText(b, columnIndex)))
    for (const row of rows) tbody.appendChild(row)
  }
}

function cellText(row: HTMLTableRowElement, index: number): string {
  const cell = row.children[index] as HTMLElement | undefined
  return cell?.textContent?.trim() ?? ''
}

if (!customElements.get('sortable-table')) {
  customElements.define('sortable-table', SortableTable)
}
