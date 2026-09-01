# shell-context-demo

Deploy (repo Pages): https://hci-nerdz.github.io/shell-context-demo/

Later org-site catalog card: https://hci-nerdz.github.io/demos/shell-context/

## Line modes (2026-08-28)

Top context bar control: **1-line** / **2-line**.
Preferred product default is 2-line; both stay interactive for compare.
Spec: openshellorg/shell-architecture `prompt-spatial-layout.adoc`.

## Demo chrome (2026-09-01)

Hash-route suite: **variant selector** (scoped separately) drives both a **static PNG mockup** (`public/mock/{variant}.png`, 1122×585) and the interactive desk. Captures from `tools/mocks/*.html` via `pnpm capture-mocks`. Anchoring images are non-interactive (`<img>` only).

Interactive desks split **demo harness** (explainer controls, dashed strip, sans-serif) from **product facsimile** (`.facsimile-bezel`, product palette). Helpers: `src/demos/harness.ts`.

## Top-bar settings

- **Line mode:** `1-line` | `2-line`
- **Arrow mode:** `ephemeral` | `persist` — gutter `▶` lifetime; copy folds in (ephemeral omit / persist include)

## Chrome placement (simulation)

Top-bar control **Host chrome | Overlay** mocks negotiation accept vs reject.
Not a real terminal protocol — for HCI review only.
