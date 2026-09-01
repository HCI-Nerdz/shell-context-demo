import { demoHarness, facsimileDesk } from "./harness";
import { wrapDemo } from "./nav";

export interface ManagerState {
  activeSession: string;
  projects: {
    id: string;
    name: string;
    sessions: { id: string; title: string; icon: string }[];
  }[];
}

export function defaultManager(): ManagerState {
  return {
    activeSession: "a1",
    projects: [
      {
        id: "proj-a",
        name: "shell-architecture",
        sessions: [
          { id: "a1", title: "nu build", icon: "nu" },
          { id: "a2", title: "docs preview", icon: "adoc" },
        ],
      },
      {
        id: "proj-b",
        name: "devcentr",
        sessions: [
          { id: "b1", title: "app run", icon: "d" },
          { id: "b2", title: "tests", icon: "ut" },
        ],
      },
    ],
  };
}

function activeProject(state: ManagerState): string {
  for (const p of state.projects) {
    if (p.sessions.some((s) => s.id === state.activeSession)) return p.id;
  }
  return state.projects[0]?.id ?? "";
}

export function renderManager(state: ManagerState): string {
  const activeProj = activeProject(state);
  const rail = state.projects
    .map((p) => {
      const tabs = p.sessions
        .map((s) => {
          const on = s.id === state.activeSession ? " active" : "";
          return `<button type="button" class="ot-vtab${on}" data-session="${s.id}">
  <span class="ot-cli-icon" title="CLI icon">${s.icon}</span>
  <span>${s.title}</span>
</button>`;
        })
        .join("");
      return `<div class="ot-vgroup">
  <div class="ot-vgroup-label">${p.name}</div>
  ${tabs}
</div>`;
    })
    .join("");

  const grid = state.projects
    .map((p) => {
      const dull = p.id === activeProj ? " highlight" : " dull";
      return `<button type="button" class="dc-cell${dull}" data-project="${p.id}">
  <span class="dc-cell-name">${p.name}</span>
  <span class="dc-cell-meta">${p.sessions.length} sessions</span>
</button>`;
    })
    .join("");

  const sess = state.projects.flatMap((p) => p.sessions).find((s) => s.id === state.activeSession);
  return wrapDemo(
    "manager",
    `${facsimileDesk(`<div class="ot-panel manager-layout">
  <div class="ot-mgr-window">
    <div class="ot-os-title">Open Terminal · Project manager</div>
    <div class="ot-mgr-body">
      <aside class="ot-vrail">${rail}</aside>
      <section class="ot-session">
        <pre class="ot-cells">focused: ${sess?.title ?? "—"}
group: ${activeProj}
(session HWND / co-located pane)</pre>
      </section>
    </div>
  </div>
  <div class="dc-grid-panel">
    <div class="ot-os-title">DevCentr · project grid</div>
    <div class="dc-grid">${grid}</div>
    <p class="ot-caption">Highlight + dull (default). Click a grid cell or a vertical tab to swap focus.</p>
  </div>
</div>`)}`,
  );
}

export function bindManager(root: ParentNode, state: ManagerState, redraw: () => void): void {
  root.querySelectorAll<HTMLButtonElement>("[data-session]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.activeSession = btn.dataset.session ?? state.activeSession;
      redraw();
    });
  });
  root.querySelectorAll<HTMLButtonElement>("[data-project]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const pid = btn.dataset.project;
      const proj = state.projects.find((p) => p.id === pid);
      if (proj?.sessions[0]) {
        state.activeSession = proj.sessions[0].id;
        redraw();
      }
    });
  });
}
