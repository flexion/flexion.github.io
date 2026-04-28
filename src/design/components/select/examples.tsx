import { Select } from './index'

export function SelectExamples() {
  return (
    <section id="select">
      <h2>Select</h2>
      <p>Dropdown selection with label. Wraps a native <code>&lt;select&gt;</code> with custom styling and a chevron indicator.</p>

      <h3>Default</h3>
      <div class="l-cluster">
        <Select name="example-tier" label="Tier">
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="as-is">As-is</option>
          <option value="archived">Archived</option>
        </Select>

        <Select name="example-category" label="Category">
          <option value="">All</option>
          <option value="product">Product</option>
          <option value="tool">Tool</option>
        </Select>
      </div>
    </section>
  )
}
