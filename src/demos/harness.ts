/** Shared markup for demo harness (explainer controls) vs product facsimile. */

export function demoHarness(controls: string, label = "Demo controls"): string {
  return `<div class="demo-harness" role="region" aria-label="${label}">
  <span class="demo-harness-label">${label}</span>
  <div class="demo-harness-row">${controls}</div>
</div>`;
}

export function facsimileDesk(inner: string, label = "Product facsimile"): string {
  return `<div class="facsimile-desk" aria-label="${label}">
  <div class="facsimile-bezel">${inner}</div>
</div>`;
}
