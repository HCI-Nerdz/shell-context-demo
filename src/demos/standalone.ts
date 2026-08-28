import { wrapDemo } from "./nav";

export type TabSide = "top" | "left";

export interface StandaloneState {
  side: TabSide;
  active: string;
  tabs: { id: string; title: string; body: string }[];
}

export function defaultStandalone(): StandaloneState {
  return {
    side: "top",
    active: "nu",
    tabs: [
      { id: "nu", title: "nu", body: "PS Z:\\code> nu\n~> ls\n~> cargo test" },
      { id: "pwsh", title: "pwsh", body: "PS Z:\\code> Get-ChildItem\nPS Z:\\code> git status" },
      { id: "cmd", title: "cmd", body: "C:\\> dir\nC:\\> where git" },
    ],
  };
}

export function renderStandalone(state: StandaloneState): string {
  const tabs = state.tabs
    .map((t) => {
      const active = t.id === state.active ? " active" : "";
      return `<button type="button" class="ot-tab${active}" data-tab="${t.id}">${t.title}</button>`;
    })
    .join("");
  const body = state.tabs.find((t) => t.id === state.active)?.body ?? "";
  const sideClass = state.side === "left" ? "ot-standalone vertical" : "ot-standalone horizontal";
  return wrapDemo(
    "standalone",
    `<div class="ot-panel">
  <div class="ot-toolbar">
    <span class="ot-label">Tab placement</span>
    <button type="button" class="ot-chip${state.side === "top" ? " on" : ""}" data-side="top">Top tabs</button>
    <button type="button" class="ot-chip${state.side === "left" ? " on" : ""}" data-side="left">Vertical tabs</button>
  </div>
  <div class="${sideClass}">
    <div class="ot-tabstrip" role="tablist">${tabs}</div>
    <div class="ot-session" role="tabpanel"><pre class="ot-cells">${escape(body)}</pre></div>
  </div>
  <p class="ot-caption">Toggle top vs vertical tabs; surface stays in the same facsimile window.</p>
</div>`,
  );
}

function escape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
}

export function bindStandalone(root: ParentNode, state: StandaloneState, redraw: () => void): void {
  root.querySelectorAll<HTMLButtonElement>("[data-side]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.side = btn.dataset.side as TabSide;
      redraw();
    });
  });
  root.querySelectorAll<HTMLButtonElement>("[data-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.active = btn.dataset.tab ?? state.active;
      redraw();
    });
  });
}
