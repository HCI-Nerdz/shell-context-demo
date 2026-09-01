import { wrapDemo } from "./nav";

export interface AssocState {
  sessions: {
    id: string;
    title: string;
    groupId: string;
    thumb: string;
    subscribers: string[];
  }[];
  subscribers: { id: string; label: string }[];
  log: string[];
}

export function defaultAssoc(): AssocState {
  return {
    subscribers: [
      { id: "sub-index", label: "Decoupled index" },
      { id: "sub-mgr", label: "Project manager" },
    ],
    sessions: [
      {
        id: "sess-a",
        title: "nu · build",
        groupId: "g-standalone",
        thumb: "~> dub test",
        subscribers: ["sub-index"],
      },
      {
        id: "sess-b",
        title: "pwsh · docs",
        groupId: "g-standalone",
        thumb: "PS> antora",
        subscribers: [],
      },
    ],
    log: ["v0: in-process registry (IPC stub later)"],
  };
}

export function renderAssoc(state: AssocState): string {
  const cards = state.sessions
    .map((s) => {
      const subs = s.subscribers.length ? s.subscribers.join(", ") : "(none)";
      return `<div class="ot-assoc-card" data-session="${s.id}">
  <div class="ot-os-title">${s.title}</div>
  <pre class="ot-thumb-preview">${s.thumb}</pre>
  <div class="ot-assoc-meta">group=${s.groupId}</div>
  <div class="ot-assoc-meta">subscribers: ${subs}</div>
  <div class="ot-toolbar tight">
    <button type="button" class="ot-chip" data-reg="${s.id}" data-sub="sub-index">Register → index</button>
    <button type="button" class="ot-chip" data-reg="${s.id}" data-sub="sub-mgr">Register → manager</button>
    <button type="button" class="ot-chip" data-unsub="${s.id}">Unsubscribe all</button>
  </div>
</div>`;
    })
    .join("");
  const subList = state.subscribers
    .map((s) => `<li><strong>${s.label}</strong> <span class="ot-muted">${s.id}</span></li>`)
    .join("");
  const log = state.log.map((l) => `<li>${l}</li>`).join("");
  return wrapDemo(
    "association",
    `<div class="ot-panel assoc-layout">
  <div>
    <h2 class="ot-h2">Session processes (thumb producers)</h2>
    <div class="ot-assoc-grid">${cards}</div>
  </div>
  <aside class="ot-assoc-side">
    <h2 class="ot-h2">Subscribers</h2>
    <ul class="ot-list">${subList}</ul>
    <h2 class="ot-h2">Handshake log</h2>
    <ul class="ot-list log">${log}</ul>
    <p class="ot-caption">Sessions stay taskbar-visible. Multiple subscribers allowed in v0.</p>
  </aside>
</div>`,
  );
}

export function bindAssoc(root: ParentNode, state: AssocState, redraw: () => void): void {
  root.querySelectorAll<HTMLButtonElement>("[data-reg]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const sid = btn.dataset.reg!;
      const sub = btn.dataset.sub!;
      const sess = state.sessions.find((s) => s.id === sid);
      if (!sess) return;
      if (!sess.subscribers.includes(sub)) sess.subscribers.push(sub);
      state.log = [`register ${sid} → ${sub}`, ...state.log].slice(0, 8);
      redraw();
    });
  });
  root.querySelectorAll<HTMLButtonElement>("[data-unsub]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const sid = btn.dataset.unsub!;
      const sess = state.sessions.find((s) => s.id === sid);
      if (!sess) return;
      sess.subscribers = [];
      state.log = [`unsubscribe all from ${sid}`, ...state.log].slice(0, 8);
      redraw();
    });
  });
}
