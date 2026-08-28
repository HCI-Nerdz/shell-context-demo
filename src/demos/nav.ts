/** Shared demo hub chrome — hash routes under Vite base. */

export type DemoRoute =
  | "prompt"
  | "standalone"
  | "decoupled"
  | "manager"
  | "zones"
  | "association";

const DEMOS_INDEX = "https://hci-nerdz.github.io/demos/";
const REPO_URL = "https://github.com/HCI-Nerdz/shell-context-demo";
const ORG_LABEL = "HCI-Nerdz";
const REPO_LABEL = "shell-context-demo";

const SUITE_LEDE =
  "Interactive facsimile of Open Terminal layout modes and shell-context chrome. " +
  "Pick a variant to see how a real workflow would feel: prompt tokens while you type, " +
  "tabs glued to a session, a calling window that indexes separate session windows, " +
  "a project manager beside a DevCentr grid, contained tiling zones, or session re-association. " +
  "These are desk mocks — not a real OS window manager.";


/** Single intro memory-hook (not a gallery) — served from public/. */
const INTRO_ANCHOR_SRC = `${import.meta.env.BASE_URL}intro-anchor.png`;
const INTRO_ANCHOR_ALT =
  "Open Shell facsimile window: host chrome with gcloud/user/host/path context tokens above the command line";

interface RouteMeta {
  id: DemoRoute;
  label: string;
  title: string;
  blurb: string;
}

const ROUTES: RouteMeta[] = [
  {
    id: "prompt",
    label: "Prompt desk",
    title: "Shell context chrome",
    blurb:
      "You type a command; path, user, host, and app tokens sit above the input so you always see which project and machine you are on. " +
      "Left-arrow walks the tokens; paste preview scrolls when you dump a block. This is the everyday CLI desk — context stays visible without leaving the prompt.",
  },
  {
    id: "standalone",
    label: "Standalone",
    title: "Standalone layout",
    blurb:
      "Classic terminal: tabs along the top or left, and the live session surface shares the same window. " +
      "Open several shells for one job without scattering windows across the desktop — Windows Terminal–style.",
  },
  {
    id: "decoupled",
    label: "Decoupled index",
    title: "Decoupled index",
    blurb:
      "A calling window holds the session index (tabs and thumbnails). Each live session is its own facsimile window you can drag, focus, minimize, or close. " +
      "Use this when you want a launcher/controller separate from the panes you are watching.",
  },
  {
    id: "manager",
    label: "Project manager",
    title: "projectGroupedManager",
    blurb:
      "Terminals spawned from DevCentr projects sit in a vertical, project-grouped manager. " +
      "Click a grid cell or a tab: the matching project lights up and the others dull — so you always know which project owns the focused session.",
  },
  {
    id: "zones",
    label: "Nested zones",
    title: "Contained tiling zones",
    blurb:
      "Sessions tile inside zone windows (per-monitor style) that stay inside the app desk. " +
      "Spawn or delete a zone, register a project group into an empty zone, drag and minimize the zone chrome. " +
      "Group membership stays stable when the display moves — this is contained tiling, not replacing the OS window manager.",
  },
  {
    id: "association",
    label: "Association",
    title: "Session association",
    blurb:
      "A session process can register with another UI (decoupled index or project manager) and offer live thumbnails. " +
      "Re-associate when you switch how you want to supervise the same running work — the session keeps running; only the subscriber changes.",
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
 * 1. Identity strip: org / repo
 * 2. VCS / GitHub logo → repo
 * 3. Suite (demo) description + one anchoring screenshot/mockup
 * 4. Variant switcher
 * 5. Variant title + description (UI body follows in wrapDemo)
 */
export function hubHtml(active: DemoRoute): string {
  const links = ROUTES.map((r) => {
    const cls = r.id === active ? "demo-variant-link active" : "demo-variant-link";
    return `<a class="${cls}" href="#/${r.id}" data-route="${r.id}">${r.label}</a>`;
  }).join("");
  const meta = routeMeta(active);
  return `<header class="demo-hub" role="banner">
  <p class="demo-identity">
    <a href="${DEMOS_INDEX}">${ORG_LABEL}</a>
    <span class="demo-hub-sep" aria-hidden="true">/</span>
    <a href="${REPO_URL}">${REPO_LABEL}</a>
    <span class="sim-badge" title="Interactive mock">DEMO</span>
  </p>
  <p class="demo-vcs">
    <a class="vcs-link" href="${REPO_URL}" title="GitHub repository" aria-label="GitHub: ${REPO_LABEL}">${GITHUB_MARK}<span class="vcs-label">GitHub</span></a>
  </p>
  <p class="demo-suite-lede">${SUITE_LEDE}</p>
  <figure class="demo-intro-anchor">
    <img src="${INTRO_ANCHOR_SRC}" width="1122" height="585" alt="${INTRO_ANCHOR_ALT}" loading="eager" decoding="async" />
  </figure>
  <div class="demo-variants" role="navigation" aria-label="Layout variants">${links}</div>
  <h1 class="demo-hub-title">${meta.title}</h1>
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