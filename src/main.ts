import { parseRoute, type DemoRoute } from "./demos/nav";
import { mountPromptDemo } from "./demos/prompt";
import {
  bindStandalone,
  defaultStandalone,
  renderStandalone,
  type StandaloneState,
} from "./demos/standalone";
import {
  bindDecoupled,
  defaultDecoupled,
  renderDecoupled,
  type DecoupledState,
} from "./demos/decoupled";
import {
  bindManager,
  defaultManager,
  renderManager,
  type ManagerState,
} from "./demos/manager";
import { bindZones, defaultZones, renderZones, type ZoneState } from "./demos/zones";
import {
  bindAssoc,
  defaultAssoc,
  renderAssoc,
  type AssocState,
} from "./demos/association";

const app = document.querySelector<HTMLDivElement>("#app")!;

const standalone = defaultStandalone();
const decoupled = defaultDecoupled();
const manager = defaultManager();
const zones = defaultZones();
const assoc = defaultAssoc();

let unmountPrompt: (() => void) | null = null;
let current: DemoRoute | null = null;

function clearPrompt(): void {
  if (unmountPrompt) {
    unmountPrompt();
    unmountPrompt = null;
  }
}

function mountRoute(route: DemoRoute): void {
  if (route === current && route !== "prompt") {
    // still re-render interactive demos when hash unchanged but state changed via redraw
  }
  if (route !== "prompt") clearPrompt();
  current = route;

  const redraw = () => mountRoute(route);

  switch (route) {
    case "prompt":
      clearPrompt();
      unmountPrompt = mountPromptDemo(app);
      break;
    case "standalone":
      app.innerHTML = renderStandalone(standalone);
      bindStandalone(app, standalone, redraw);
      break;
    case "decoupled":
      app.innerHTML = renderDecoupled(decoupled);
      bindDecoupled(app, decoupled, redraw);
      break;
    case "manager":
      app.innerHTML = renderManager(manager);
      bindManager(app, manager, redraw);
      break;
    case "zones":
      app.innerHTML = renderZones(zones);
      bindZones(app, zones, redraw);
      break;
    case "association":
      app.innerHTML = renderAssoc(assoc);
      bindAssoc(app, assoc, redraw);
      break;
  }
  document.title = `shell-context-demo · ${route}`;
}

function syncFromHash(): void {
  const scrollY = window.scrollY;
  mountRoute(parseRoute(location.hash));
  window.scrollTo({ top: scrollY, left: 0, behavior: "instant" });
}

window.addEventListener("hashchange", syncFromHash);
if (!location.hash) location.hash = "#/prompt";
else syncFromHash();
