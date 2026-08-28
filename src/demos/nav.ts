/** Shared demo hub chrome - hash routes under Vite base. */

export type DemoRoute =
  | "prompt"
  | "standalone"
  | "decoupled"
  | "manager"
  | "zones"
  | "association";

const ROUTES: { id: DemoRoute; label: string; title: string }[] = [
  { id: "prompt", label: "Prompt desk", title: "Shell context chrome" },
  { id: "standalone", label: "Standalone", title: "Standalone layout" },
  { id: "decoupled", label: "Decoupled index", title: "Decoupled index" },
  { id: "manager", label: "Project manager", title: "projectGroupedManager" },
  { id: "zones", label: "Nested zones", title: "Contained tiling zones" },
  { id: "association", label: "Association", title: "Session association" },
];

export function parseRoute(hash: string): DemoRoute {
  const raw = (hash.replace(/^#\/?/, "") || "prompt").split("?")[0];
  const hit = ROUTES.find((r) => r.id === raw);
  return hit ? hit.id : "prompt";
}

export function navHtml(active: DemoRoute): string {
  const links = ROUTES.map((r) => {
    const cls = r.id === active ? "demo-nav-link active" : "demo-nav-link";
    return `<a class="${cls}" href="#/${r.id}" data-route="${r.id}">${r.label}</a>`;
  }).join("");
  const title = ROUTES.find((r) => r.id === active)?.title ?? "Demo";
  return `<header class="demo-hub" role="banner">
  <div class="demo-hub-brand">
    <strong>HCI-Nerdz</strong>
    <span class="demo-hub-sep">/</span>
    <span>shell-context-demo</span>
    <span class="sim-badge" title="Interactive mock">DEMO</span>
  </div>
  <nav class="demo-nav" aria-label="Layout demos">${links}</nav>
  <p class="demo-hub-title">${title}</p>
</header>`;
}

export function wrapDemo(active: DemoRoute, body: string): string {
  return `${navHtml(active)}<main class="demo-stage" data-demo="${active}">${body}</main>`;
}
