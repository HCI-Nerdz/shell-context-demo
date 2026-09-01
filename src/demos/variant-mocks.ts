/** Compact CSS facsimile previews — one per layout variant (anchoring visual). */

export type VariantRoute =
  | "prompt"
  | "standalone"
  | "decoupled"
  | "manager"
  | "zones"
  | "association";

export function variantMockHtml(id: VariantRoute): string {
  switch (id) {
    case "prompt":
      return `<div class="scd-mock scd-mock-prompt" aria-hidden="true">
  <div class="scd-mock-bar"><span></span><span></span><span></span></div>
  <div class="scd-mock-host">
    <span class="scd-mock-chip on">gcloud</span>
    <span class="scd-mock-chip">user</span>
    <span class="scd-mock-chip">host</span>
    <span class="scd-mock-chip on">path</span>
  </div>
  <div class="scd-mock-term">
    <span class="scd-mock-gutter">&gt;</span>
    <span class="scd-mock-line">gcloud compute instances list</span>
  </div>
</div>`;
    case "standalone":
      return `<div class="scd-mock scd-mock-standalone" aria-hidden="true">
  <div class="scd-mock-tabs"><span class="on">nu</span><span>pwsh</span><span>cmd</span></div>
  <div class="scd-mock-pane">
    <span class="scd-mock-line dim">PS Z:\\code&gt; nu</span>
    <span class="scd-mock-line">~&gt; cargo test</span>
  </div>
</div>`;
    case "decoupled":
      return `<div class="scd-mock scd-mock-decoupled" aria-hidden="true">
  <div class="scd-mock-index">
    <span class="scd-mock-mini-title">Index</span>
    <span class="scd-mock-thumb on"></span>
    <span class="scd-mock-thumb"></span>
  </div>
  <div class="scd-mock-float a"></div>
  <div class="scd-mock-float b"></div>
</div>`;
    case "manager":
      return `<div class="scd-mock scd-mock-manager" aria-hidden="true">
  <div class="scd-mock-rail">
    <span class="scd-mock-group on">shell-architecture</span>
    <span class="scd-mock-vtab on"></span>
    <span class="scd-mock-vtab"></span>
    <span class="scd-mock-group dull">devcentr</span>
  </div>
  <div class="scd-mock-grid">
    <span class="scd-mock-cell on"></span>
    <span class="scd-mock-cell dull"></span>
  </div>
</div>`;
    case "zones":
      return `<div class="scd-mock scd-mock-zones" aria-hidden="true">
  <div class="scd-mock-zone">
    <span class="scd-mock-zone-title">Monitor 1</span>
    <span class="scd-mock-tile on"></span>
    <span class="scd-mock-tile"></span>
  </div>
  <div class="scd-mock-zone dull">
    <span class="scd-mock-zone-title">Monitor 2</span>
    <span class="scd-mock-tile empty"></span>
  </div>
</div>`;
    case "association":
      return `<div class="scd-mock scd-mock-assoc" aria-hidden="true">
  <div class="scd-mock-card on">
    <span class="scd-mock-card-title">nu · build</span>
    <span class="scd-mock-card-body"></span>
  </div>
  <div class="scd-mock-subs">
    <span class="on">Decoupled index</span>
    <span>Project manager</span>
  </div>
</div>`;
  }
}
