/** Shared demo hub chrome — hash routes under Vite base. */

export type DemoRoute =
  | "prompt"
  | "standalone"
  | "decoupled"
  | "manager"
  | "zones"
  | "association";

const DEMOS_INDEX = "https://hci-nerdz.github.io/demos/";
/** Site home for this demo (Pages / suite root) — identity strip is site nav only. */
const SITE_HOME = import.meta.env.BASE_URL;
const REPO_URL = "https://github.com/HCI-Nerdz/shell-context-demo";
const ORG_LABEL = "HCI-Nerdz";
const REPO_LABEL = "shell-context-demo";

const SUITE_LEDE =
  "Interactive facsimile of Open Terminal layout modes and shell-context chrome. " +
  "Pick a variant to see how a real workflow would feel: prompt tokens while you type, " +
  "tabs glued to a session, a calling window that indexes separate session windows, " +
  "a project manager beside a DevCentr grid, contained tiling zones, or session re-association. " +
  "These are desk mocks — not a real OS window manager.";


import { variantMockHtml } from "./variant-mocks";

interface RouteMeta {
  id: DemoRoute;
  /** Tab label and section heading — keep identical (human-readable). */
  label: string;
  blurb: string;
  /** Short caption under the anchoring mockup for this variant. */
  mockCaption: string;
}

const ROUTES: RouteMeta[] = [
  {
    id: "prompt",
    label: "Prompt desk",
    blurb:
      "You type a command; path, user, host, and app tokens sit above the input so you always see which project and machine you are on. " +
      "Left-arrow walks the tokens; paste preview scrolls when you dump a block. This is the everyday CLI desk — context stays visible without leaving the prompt.",
    mockCaption: "Context tokens above the live command line",
  },
  {
    id: "standalone",
    label: "Standalone",
    blurb:
      "Classic terminal: tabs along the top or left, and the live session surface shares the same window. " +
      "Open several shells for one job without scattering windows across the desktop — Windows Terminal–style.",
    mockCaption: "Tabs and session surface in one window",
  },
  {
    id: "decoupled",
    label: "Decoupled index",
    blurb:
      "A calling window holds the session index (tabs and thumbnails). Each live session is its own facsimile window you can drag, focus, minimize, or close. " +
      "Use this when you want a launcher/controller separate from the panes you are watching.",
    mockCaption: "Index window plus separate session facsimiles",
  },
  {
    id: "manager",
    label: "Project manager",
    blurb:
      "Terminals spawned from DevCentr projects sit in a vertical, project-grouped manager (`projectGroupedManager` in shell-architecture). " +
      "Click a grid cell or a tab: the matching project lights up and the others dull — so you always know which project owns the focused session.",
    mockCaption: "Project-grouped rail beside DevCentr grid highlight",
  },
  {
    id: "zones",
    label: "Nested zones",
    blurb:
      "Sessions tile inside zone windows (per-monitor style) that stay inside the app desk. " +
      "Spawn or delete a zone, register a project group into an empty zone, drag and minimize the zone chrome. " +
      "Group membership stays stable when the display moves — this is contained tiling, not replacing the OS window manager.",
    mockCaption: "Contained tiling zones inside the app desk",
  },
  {
    id: "association",
    label: "Association",
    blurb:
      "A session process can register with another UI (decoupled index or project manager) and offer live thumbnails. " +
      "Re-associate when you switch how you want to supervise the same running work — the session keeps running; only the subscriber changes.",
    mockCaption: "Sessions register with a supervising UI",
  },
];

const GITHUB_MARK =
  `<svg class="vcs-mark" viewBox="0 0 16 16" width="20" height="20" aria-hidden="true" focusable="false">` +
  `<path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>` +
  `</svg>`;

export function parseRoute(hash: string): DemoRoute {
  const raw = (hash.replace(/^#\/?/, "") || "prompt").split("?")[0];
  const hit = ROUTES.find((r) => r.id === raw);
  return hit ? hit.id : "prompt";
}

function routeMeta(id: DemoRoute): RouteMeta {
  return ROUTES.find((r) => r.id === id) ?? ROUTES[0];
}

/**
 * Chrome order:
 * 1. Identity strip: org / repo (site nav only — repo → demo site home)
 * 2. VCS / GitHub logo → repo (only VCS link)
 * 3. Suite (demo) description
 * 4. Variant tab bar
 * 5. One anchoring mockup for the active variant (swaps on tab select)
 * 6. Variant heading + blurb (UI body follows in wrapDemo)
 */
export function hubHtml(active: DemoRoute): string {
  const tabs = ROUTES.map((r) => {
    const selected = r.id === active;
    const cls = selected ? "demo-variant-tab active" : "demo-variant-tab";
    return `<a class="${cls}" href="#/${r.id}" data-route="${r.id}" role="tab" aria-selected="${selected}">${r.label}</a>`;
  }).join("");
  const meta = routeMeta(active);
  return `<header class="demo-hub" role="banner">
  <p class="demo-identity">
    <a href="${DEMOS_INDEX}">${ORG_LABEL}</a>
    <span class="demo-hub-sep" aria-hidden="true">/</span>
    <a href="${SITE_HOME}">${REPO_LABEL}</a>
    <span class="sim-badge" title="Interactive mock">DEMO</span>
  </p>
  <p class="demo-vcs">
    <a class="vcs-link" href="${REPO_URL}" title="GitHub repository" aria-label="GitHub: ${REPO_LABEL}">${GITHUB_MARK}<span class="vcs-label">GitHub</span></a>
  </p>
  <p class="demo-suite-lede">${SUITE_LEDE}</p>
  <nav class="demo-variant-tabs" role="tablist" aria-label="Layout variants">${tabs}</nav>
  <figure class="demo-variant-mock" role="tabpanel" aria-label="${meta.label}">
    ${variantMockHtml(active)}
    <figcaption class="demo-variant-mock-caption">${meta.mockCaption}</figcaption>
  </figure>
  <h1 class="demo-hub-title">${meta.label}</h1>
  <p class="demo-variant-lede">${meta.blurb}</p>
</header>`;
}

/** @deprecated use hubHtml */
export function navHtml(active: DemoRoute): string {
  return hubHtml(active);
}

export function wrapDemo(active: DemoRoute, body: string): string {
  return `${hubHtml(active)}<main class="demo-stage" data-demo="${active}">${body}</main>`;
}