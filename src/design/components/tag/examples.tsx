import { Tag } from './index'

export function TagExamples() {
  return (
    <>
      <section id="tag">
        <h2>Tag</h2>
        <p>Small inline labels for status, tier, and category. Renders a <code>&lt;span class="tag"&gt;</code> with a <code>data-variant</code> attribute.</p>

        <h3>Tier variants</h3>
        <div class="l-cluster">
          <Tag variant="tier-active">Active</Tag>
          <Tag variant="tier-as-is">As-is</Tag>
          <Tag variant="tier-archived">Archived</Tag>
          <Tag variant="tier-unreviewed">Unreviewed</Tag>
        </div>

        <h3>Category variants</h3>
        <div class="l-cluster">
          <Tag variant="category-product">Product</Tag>
          <Tag variant="category-tool">Tool</Tag>
          <Tag variant="category-workshop">Workshop</Tag>
          <Tag variant="category-prototype">Prototype</Tag>
          <Tag variant="category-fork">Fork</Tag>
          <Tag variant="category-uncategorized">Uncategorized</Tag>
        </div>

        <h3>Status variants</h3>
        <div class="l-cluster">
          <Tag variant="pass">Pass</Tag>
          <Tag variant="warn">Warn</Tag>
          <Tag variant="fail">Fail</Tag>
        </div>
      </section>
    </>
  )
}
