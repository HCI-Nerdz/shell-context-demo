import { wrapDemo } from "./nav";
import {
  bindFauxWindows,
  defaultGeom,
  nextZ,
  titleBarHtml,
  winStyle,
  type WinGeom,
} from "./windowing";

export interface ZoneTile {
  sessionId: string;
  groupId: string;
  label: string;
}

export interface ZoneWindow {
  id: string;
  monitor: string;
  faded: boolean;
  tiles: ZoneTile[];
  geom: WinGeom;
}

export interface ZoneState {
  zones: ZoneWindow[];
  groups: { id: string; label: string; sessions: string[] }[];
  selectedGroup: string;
  focus: string;
  zCounter: number;
}

export function defaultZones(): ZoneState {
  return {
    selectedGroup: "g1",
    focus: "z-mon1",
    zCounter: 3,
    groups: [
      { id: "g1", label: "proj-A", sessions: ["s1", "s2"] },
      { id: "g2", label: "proj-B", sessions: ["s3"] },
    ],
    zones: [
      {
        id: "z-mon1",
        monitor: "Monitor 1",
        faded: false,
        tiles: [
          { sessionId: "s1", groupId: "g1", label: "s1 top-right" },
          { sessionId: "s2", groupId: "g1", label: "s2 below" },
        ],
        geom: defaultGeom({ x: 24, y: 28, w: 320, h: 240, z: 2 }),
      },
      {
        id: "z-mon2",
        monitor: "Monitor 2",
        faded: true,
        tiles: [],
        geom: defaultGeom({ x: 380, y: 48, w: 300, h: 220, z: 1 }),
      },
    ],
  };
}

export function renderZones(state: ZoneState): string {
  const zoneCards = state.zones
    .filter((z) => !z.geom.closed)
    .map((z) => {
      const faded = z.faded && z.tiles.length === 0 ? " faded" : "";
      const focused = z.id === state.focus ? " focused" : "";
      const tiles =
        z.geom.minimized
          ? ""
          : z.tiles.length === 0
            ? `<div class="ot-zone-empty">faded · empty until populated</div>`
            : z.tiles
                .map(
                  (t) =>
                    `<div class="ot-tile" data-session="${t.sessionId}"><span class="ot-tile-label">${t.label}</span><span class="ot-muted">${t.groupId}</span></div>`,
                )
                .join("");
      const body = z.geom.minimized
        ? ""
        : `<div class="ot-zone-grid">${tiles}</div>
  <div class="ot-win-resize" data-win-resize="${z.id}" title="Resize"></div>`;
      return `<div class="ot-zone ot-faux-win${faded}${focused}" data-win="${z.id}" data-zone="${z.id}" style="${winStyle(z.geom, z.id === state.focus)}">
  ${titleBarHtml({ title: `${z.monitor} · ${z.id}`, winId: z.id, badge: " zone" })}
  ${body}
</div>`;
    })
    .join("");

  const groups = state.groups
    .map((g) => {
      const on = g.id === state.selectedGroup ? " on" : "";
      return `<button type="button" class="ot-chip${on}" data-group="${g.id}">${g.label} {${g.sessions.join(", ")}}</button>`;
    })
    .join("");

  const closedHint =
    state.zones.some((z) => z.geom.closed)
      ? `<button type="button" class="ot-chip" data-action="restore-zones">Restore closed zones</button>`
      : "";

  return wrapDemo(
    "zones",
    `<div class="ot-panel">
  <div class="ot-toolbar">
    <span class="ot-label">Group (membership stable)</span>
    ${groups}
    <button type="button" class="ot-chip" data-action="spawn-zone">Spawn zone</button>
    <button type="button" class="ot-chip" data-action="register">Register group → empty zone</button>
    <button type="button" class="ot-chip danger" data-action="delete-focus" title="Delete focused zone">Delete zone</button>
    ${closedHint}
  </div>
  <div class="ot-zone-desk ot-faux-desk" aria-label="Contained tiling desk">${zoneCards}</div>
  <p class="ot-caption">Contained tiling: zones as facsimile windows inside the desk. Drag title bars, close/minimize, or Delete zone. Moving a display does not leave the group. Not a real multi-monitor WM.</p>
</div>`,
  );
}

function deleteZone(state: ZoneState, id: string): void {
  const z = state.zones.find((x) => x.id === id);
  if (!z) return;
  z.geom.closed = true;
  z.tiles = [];
  z.faded = true;
  if (state.focus === id) {
    const next = state.zones.find((x) => !x.geom.closed);
    state.focus = next?.id ?? "";
  }
}

export function bindZones(root: ParentNode, state: ZoneState, redraw: () => void): void {
  root.querySelectorAll<HTMLButtonElement>("[data-group]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.selectedGroup = btn.dataset.group ?? state.selectedGroup;
      redraw();
    });
  });
  root.querySelector<HTMLButtonElement>('[data-action="spawn-zone"]')?.addEventListener("click", () => {
    const n = state.zones.length + 1;
    state.zCounter = nextZ(state.zones.map((z) => z.geom));
    const id = `z-mon${n}`;
    state.zones.push({
      id,
      monitor: `Monitor ${n}`,
      faded: true,
      tiles: [],
      geom: defaultGeom({
        x: 40 + (n % 4) * 36,
        y: 36 + (n % 3) * 28,
        w: 300,
        h: 220,
        z: state.zCounter,
      }),
    });
    state.focus = id;
    redraw();
  });
  root.querySelector<HTMLButtonElement>('[data-action="register"]')?.addEventListener("click", () => {
    const empty = state.zones.find((z) => !z.geom.closed && z.tiles.length === 0);
    const group = state.groups.find((g) => g.id === state.selectedGroup);
    if (!empty || !group) return;
    empty.faded = false;
    empty.geom.minimized = false;
    empty.tiles = group.sessions.map((sid, i) => ({
      sessionId: sid,
      groupId: group.id,
      label: `${sid} tile ${i + 1}`,
    }));
    for (const z of state.zones) {
      if (z.id === empty.id) continue;
      z.tiles = z.tiles.filter((t) => t.groupId !== group.id);
      if (z.tiles.length === 0) z.faded = true;
    }
    state.focus = empty.id;
    redraw();
  });
  root.querySelector<HTMLButtonElement>('[data-action="delete-focus"]')?.addEventListener("click", () => {
    if (!state.focus) return;
    deleteZone(state, state.focus);
    redraw();
  });
  root.querySelector<HTMLButtonElement>('[data-action="restore-zones"]')?.addEventListener("click", () => {
    for (const z of state.zones) {
      z.geom.closed = false;
      z.geom.minimized = false;
    }
    if (!state.focus) state.focus = state.zones[0]?.id ?? "";
    redraw();
  });

  bindFauxWindows(root, {
    getGeom: (id) => state.zones.find((z) => z.id === id)?.geom,
    setFocus: (id) => {
      state.focus = id;
    },
    bumpZ: (id) => {
      state.zCounter += 1;
      const z = state.zones.find((x) => x.id === id);
      if (z) z.geom.z = state.zCounter;
    },
    onClose: (id) => {
      deleteZone(state, id);
      redraw();
    },
    onMin: (id) => {
      const z = state.zones.find((x) => x.id === id);
      if (!z) return;
      z.geom.minimized = !z.geom.minimized;
      state.focus = id;
      redraw();
    },
    redraw,
  });
}
