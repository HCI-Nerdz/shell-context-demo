import { wrapDemo } from "./nav";

export interface ZoneState {
  zones: {
    id: string;
    monitor: string;
    faded: boolean;
    tiles: { sessionId: string; groupId: string; label: string }[];
  }[];
  groups: { id: string; label: string; sessions: string[] }[];
  selectedGroup: string;
}

export function defaultZones(): ZoneState {
  return {
    selectedGroup: "g1",
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
      },
      {
        id: "z-mon2",
        monitor: "Monitor 2",
        faded: true,
        tiles: [],
      },
    ],
  };
}

export function renderZones(state: ZoneState): string {
  const zoneCards = state.zones
    .map((z) => {
      const faded = z.faded && z.tiles.length === 0 ? " faded" : "";
      const tiles =
        z.tiles.length === 0
          ? `<div class="ot-zone-empty">faded · empty until populated</div>`
          : z.tiles
              .map(
                (t) =>
                  `<div class="ot-tile" data-session="${t.sessionId}"><span class="ot-tile-label">${t.label}</span><span class="ot-muted">${t.groupId}</span></div>`,
              )
              .join("");
      return `<div class="ot-zone${faded}" data-zone="${z.id}">
  <div class="ot-zone-head">${z.monitor} · ${z.id}</div>
  <div class="ot-zone-grid">${tiles}</div>
</div>`;
    })
    .join("");

  const groups = state.groups
    .map((g) => {
      const on = g.id === state.selectedGroup ? " on" : "";
      return `<button type="button" class="ot-chip${on}" data-group="${g.id}">${g.label} {${g.sessions.join(", ")}}</button>`;
    })
    .join("");

  return wrapDemo(
    "zones",
    `<div class="ot-panel">
  <div class="ot-toolbar">
    <span class="ot-label">Group (membership stable)</span>
    ${groups}
    <button type="button" class="ot-chip" data-action="spawn-zone">Spawn zone</button>
    <button type="button" class="ot-chip" data-action="register">Register group → empty zone</button>
  </div>
  <div class="ot-zone-desk">${zoneCards}</div>
  <p class="ot-caption">Contained tiling: zones inside app chrome. Moving display does not leave the group.</p>
</div>`,
  );
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
    state.zones.push({
      id: `z-mon${n}`,
      monitor: `Monitor ${n}`,
      faded: true,
      tiles: [],
    });
    redraw();
  });
  root.querySelector<HTMLButtonElement>('[data-action="register"]')?.addEventListener("click", () => {
    const empty = state.zones.find((z) => z.tiles.length === 0);
    const group = state.groups.find((g) => g.id === state.selectedGroup);
    if (!empty || !group) return;
    empty.faded = false;
    empty.tiles = group.sessions.map((sid, i) => ({
      sessionId: sid,
      groupId: group.id,
      label: `${sid} tile ${i + 1}`,
    }));
    // clear from other zones to show re-registration
    for (const z of state.zones) {
      if (z.id === empty.id) continue;
      z.tiles = z.tiles.filter((t) => t.groupId !== group.id);
      if (z.tiles.length === 0) z.faded = true;
    }
    redraw();
  });
}
