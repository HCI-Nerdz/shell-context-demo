import { wrapDemo } from "./nav";

export interface DecoupledState {
  focus: string;
  sessions: { id: string; title: string; lines: string[] }[];
}

export function defaultDecoupled(): DecoupledState {
  return {
    focus: "s1",
    sessions: [
      { id: "s1", title: "nu · hive", lines: ["~> git fetch", "~> dub build"] },
      { id: "s2", title: "pwsh · deploy", lines: ["PS> pnpm build", "PS> gh pr checks"] },
      { id: "s3", title: "ssh · box", lines: ["$ uptime", "$ journalctl -f"] },
    ],
  };
}

export function renderDecoupled(state: DecoupledState): string {
  const tabs = state.sessions
    .map((s) => {
      const active = s.id === state.focus ? " active" : "";
      return `<button type="button" class="ot-tab${active}" data-focus="${s.id}">${s.title}</button>`;
    })
    .join("");
  const thumbs = state.sessions
    .map((s) => {
      const active = s.id === state.focus ? " active" : "";
      return `<button type="button" class="ot-thumb${active}" data-focus="${s.id}">
  <span class="ot-thumb-title">${s.title}</span>
  <pre class="ot-thumb-preview">${s.lines.join("\n")}</pre>
</button>`;
    })
    .join("");
  const windows = state.sessions
    .map((s) => {
      const active = s.id === state.focus ? " focused" : "";
      return `<div class="ot-os-window${active}" data-win="${s.id}">
  <div class="ot-os-title">${s.title} <span class="ot-muted">HWND</span></div>
  <pre class="ot-cells">${s.lines.join("\n")}</pre>
</div>`;
    })
    .join("");
  return wrapDemo(
    "decoupled",
    `<div class="ot-panel">
  <div class="ot-index-window">
    <div class="ot-os-title">Calling window · session index</div>
    <div class="ot-tabstrip horizontal-strip">${tabs}</div>
    <div class="ot-thumb-grid">${thumbs}</div>
  </div>
  <div class="ot-session-desk">${windows}</div>
  <p class="ot-caption">Decoupled index: tabs/thumbs in the calling window; live sessions are separate OS windows.</p>
</div>`,
  );
}

export function bindDecoupled(root: ParentNode, state: DecoupledState, redraw: () => void): void {
  root.querySelectorAll<HTMLElement>("[data-focus]").forEach((el) => {
    el.addEventListener("click", () => {
      state.focus = el.dataset.focus ?? state.focus;
      redraw();
    });
  });
}
