import { demoHarness, facsimileDesk } from "./harness";
import { wrapDemo } from "./nav";
import {
  bindFauxWindows,
  defaultGeom,
  nextZ,
  titleBarHtml,
  winStyle,
  type WinGeom,
} from "./windowing";

export interface DecoupledSession {
  id: string;
  title: string;
  lines: string[];
  geom: WinGeom;
}

export interface DecoupledState {
  focus: string;
  zCounter: number;
  indexGeom: WinGeom;
  sessions: DecoupledSession[];
}

export function defaultDecoupled(): DecoupledState {
  return {
    focus: "s1",
    zCounter: 5,
    indexGeom: defaultGeom({ x: 16, y: 16, w: 420, h: 260, z: 5 }),
    sessions: [
      {
        id: "s1",
        title: "nu · hive",
        lines: ["~> git fetch", "~> dub build"],
        geom: defaultGeom({ x: 460, y: 24, w: 260, h: 180, z: 4 }),
      },
      {
        id: "s2",
        title: "pwsh · deploy",
        lines: ["PS> pnpm build", "PS> gh pr checks"],
        geom: defaultGeom({ x: 480, y: 220, w: 260, h: 180, z: 3 }),
      },
      {
        id: "s3",
        title: "ssh · box",
        lines: ["$ uptime", "$ journalctl -f"],
        geom: defaultGeom({ x: 200, y: 300, w: 260, h: 160, z: 2 }),
      },
    ],
  };
}

export function renderDecoupled(state: DecoupledState): string {
  const tabs = state.sessions
    .filter((s) => !s.geom.closed)
    .map((s) => {
      const active = s.id === state.focus ? " active" : "";
      return `<button type="button" class="ot-tab${active}" data-focus="${s.id}">${s.title}</button>`;
    })
    .join("");
  const thumbs = state.sessions
    .filter((s) => !s.geom.closed)
    .map((s) => {
      const active = s.id === state.focus ? " active" : "";
      return `<button type="button" class="ot-thumb${active}" data-focus="${s.id}">
  <span class="ot-thumb-title">${s.title}</span>
  <pre class="ot-thumb-preview">${s.lines.join("\n")}</pre>
</button>`;
    })
    .join("");

  const indexFocused = state.focus === "index";
  const indexBody = state.indexGeom.minimized
    ? ""
    : `<div class="ot-tabstrip horizontal-strip">${tabs}</div>
    <div class="ot-thumb-grid">${thumbs}</div>
    <div class="ot-win-resize" data-win-resize="index" title="Resize"></div>`;

  const indexWin = state.indexGeom.closed
    ? ""
    : `<div class="ot-index-window ot-faux-win${indexFocused ? " focused" : ""}" data-win="index" style="${winStyle(state.indexGeom, indexFocused)}">
  ${titleBarHtml({ title: "Calling window · session index", winId: "index", badge: " index" })}
  ${indexBody}
</div>`;

  const windows = state.sessions
    .filter((s) => !s.geom.closed)
    .map((s) => {
      const active = s.id === state.focus ? " focused" : "";
      const body = s.geom.minimized
        ? ""
        : `<pre class="ot-cells">${s.lines.join("\n")}</pre>
  <div class="ot-win-resize" data-win-resize="${s.id}" title="Resize"></div>`;
      return `<div class="ot-os-window ot-faux-win${active}" data-win="${s.id}" style="${winStyle(s.geom, s.id === state.focus)}">
  ${titleBarHtml({ title: s.title, winId: s.id, badge: " HWND" })}
  ${body}
</div>`;
    })
    .join("");

  const restore =
    state.sessions.some((s) => s.geom.closed) || state.indexGeom.closed
      ? `<button type="button" class="ot-chip" data-action="restore-wins">Restore closed windows</button>`
      : "";

  return wrapDemo(
    "decoupled",
    `${demoHarness(`<span class="ot-label">Facsimile desk</span>${restore}`)}
${facsimileDesk(`<div class="ot-session-desk ot-faux-desk" aria-label="Decoupled session desk">${indexWin}${windows}</div>`)}
  <p class="ot-caption">Decoupled index: tabs/thumbs in the calling window; live sessions are separate facsimile windows. Drag, focus (z-order), minimize, close. Real OS HWNDs live in open-terminal / dew — not in this page.</p>`,
  );
}

function geomFor(state: DecoupledState, id: string): WinGeom | undefined {
  if (id === "index") return state.indexGeom;
  return state.sessions.find((s) => s.id === id)?.geom;
}

export function bindDecoupled(root: ParentNode, state: DecoupledState, redraw: () => void): void {
  root.querySelectorAll<HTMLElement>("[data-focus]").forEach((el) => {
    el.addEventListener("click", () => {
      const id = el.dataset.focus ?? state.focus;
      state.focus = id;
      const g = geomFor(state, id);
      if (g) {
        state.zCounter = nextZ([state.indexGeom, ...state.sessions.map((s) => s.geom)]);
        g.z = state.zCounter;
        g.minimized = false;
        g.closed = false;
      }
      redraw();
    });
  });

  root.querySelector<HTMLButtonElement>('[data-action="restore-wins"]')?.addEventListener("click", () => {
    state.indexGeom.closed = false;
    state.indexGeom.minimized = false;
    for (const s of state.sessions) {
      s.geom.closed = false;
      s.geom.minimized = false;
    }
    redraw();
  });

  bindFauxWindows(root, {
    getGeom: (id) => geomFor(state, id),
    setFocus: (id) => {
      state.focus = id;
    },
    bumpZ: (id) => {
      state.zCounter += 1;
      const g = geomFor(state, id);
      if (g) g.z = state.zCounter;
    },
    onClose: (id) => {
      const g = geomFor(state, id);
      if (!g) return;
      g.closed = true;
      if (state.focus === id) {
        const next = state.sessions.find((s) => !s.geom.closed);
        state.focus = !state.indexGeom.closed ? "index" : (next?.id ?? "");
      }
      redraw();
    },
    onMin: (id) => {
      const g = geomFor(state, id);
      if (!g) return;
      g.minimized = !g.minimized;
      state.focus = id;
      redraw();
    },
    redraw,
  });
}
