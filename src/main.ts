import { COMMAND_CONTEXT, DEMO_TOKENS, PASTE_SAMPLE } from "./core/session";
import type {
  ArrowMode,
  ChromePlacement,
  ContextToken,
  HistoryEntry,
  LineMode,
  PasteBlock,
  ThemeId,
} from "./core/types";
import { stepFocus, tokenFocusOrder } from "./controller/focus";
import { PASTE_VISIBLE, scrollPaste, visibleLines } from "./controller/paste";
import { nextTheme, THEMES } from "./render/themes";

const TRI = "\u25B6";
const app = document.querySelector<HTMLDivElement>("#app")!;

let focusedToken: string | null = null;
let theme: ThemeId = "default";
let lineMode: LineMode = "2-line";
let arrowMode: ArrowMode = "ephemeral";
/** Simulation of negotiation accept (host) vs reject (overlay). */
let chromePlacement: ChromePlacement = "host";
let pasteOpen = false;
let pasteBlock: PasteBlock = { lines: PASTE_SAMPLE, visibleStart: 0 };
let inputText = "gcloud compute instances list";
let history: HistoryEntry[] = [
  {
    tokens: DEMO_TOKENS.filter((t) => t.zone === "host" || t.id === "gcloud-config"),
    command: "gcloud config get-value project",
    showArrow: false,
  },
];
const order = tokenFocusOrder(DEMO_TOKENS.map((t) => t.id));

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function snapshotTokens(): ContextToken[] {
  const first = inputText.trim().split(/\s+/)[0] ?? "";
  if (!first) return [...DEMO_TOKENS];
  const ids = new Set<string>();
  for (const t of DEMO_TOKENS) if (t.zone === "host") ids.add(t.id);
  for (const [prefix, tokenIds] of Object.entries(COMMAND_CONTEXT)) {
    if (first === prefix || first.startsWith(prefix)) for (const id of tokenIds) ids.add(id);
  }
  return DEMO_TOKENS.filter((t) => ids.has(t.id));
}

function visibleTokens(): ContextToken[] {
  return snapshotTokens();
}

function renderToken(t: ContextToken): string {
  const focused = focusedToken === t.id ? " focused" : "";
  const suffix = t.kind === "enum" || t.kind === "path" ? " ?" : "";
  return `<span class="token ${t.zone}${focused}" data-token="${t.id}" title="${t.label}">${escapeHtml(t.label)}: ${escapeHtml(t.value)}${suffix}</span>`;
}

function tokensHtml(list: ContextToken[]): string {
  return list.map(renderToken).join("");
}

function helpVisible(): boolean {
  const first = inputText.trim().split(/\s+/)[0] ?? "";
  return first.length > 0 && Object.keys(COMMAND_CONTEXT).some((p) => first === p || first.startsWith(p));
}

function liveGutterHtml(): string {
  const help = helpVisible();
  const mark = help ? `?${TRI}` : TRI;
  return `<div class="gutter" title="gutter: ${TRI}"><button type="button" class="gutter-mark${help ? " has-help" : ""}">${mark}</button></div>`;
}

function historyGutterHtml(showArrow: boolean): string {
  if (!showArrow) return `<div class="gutter gutter-empty" aria-hidden="true"></div>`;
  return `<div class="gutter"><span class="gutter-mark">${TRI}</span></div>`;
}

function inputEditorHtml(): string {
  const display = focusedToken ? `[${focusedToken}]` : escapeHtml(inputText);
  return `<div class="prompt-input"><input class="input-field" type="text" value="${escapeHtml(inputText)}" spellcheck="false" aria-label="command" /><span class="input-mock ${focusedToken ? "" : "hidden"}">${display}</span></div>`;
}

function historyBlockHtml(): string {
  return history
    .map((h) => {
      const ctx = tokensHtml(h.tokens);
      if (lineMode === "2-line") {
        return `<div class="history-entry">
  <div class="context-row"><div class="gutter-spacer"></div><div class="tokens">${ctx}</div></div>
  <div class="prompt-row">${historyGutterHtml(h.showArrow)}<div class="prompt-input"><span class="committed">${escapeHtml(h.command)}</span></div></div>
</div>`;
      }
      return `<div class="history-entry"><div class="prompt-row">${historyGutterHtml(h.showArrow)}<div class="tokens">${ctx}</div><div class="prompt-input"><span class="committed">${escapeHtml(h.command)}</span></div></div></div>`;
    })
    .join("");
}

function livePromptHtml(): string {
  const tok = tokensHtml(visibleTokens());
  if (lineMode === "2-line") {
    return `<div class="prompt-stack mode-2line live">
  <div class="context-row"><div class="gutter-spacer" aria-hidden="true"></div><div class="tokens">${tok}</div></div>
  <div class="prompt-row">${liveGutterHtml()}${inputEditorHtml()}</div>
</div>`;
  }
  return `<div class="prompt-stack mode-1line live">
  <div class="prompt-row">${liveGutterHtml()}<div class="tokens">${tok}</div>${inputEditorHtml()}</div>
</div>`;
}

function topBarInnerHtml(): string {
  const copyImplication =
    arrowMode === "ephemeral" ? `${TRI} omitted from history/copy` : `${TRI} in history and copy`;
  return `
    <span class="topbar-brand">Open Shell</span>
    <span class="sim-badge" title="Demo only — not a real host protocol">SIM</span>
    <label class="line-mode-switch">
      <span class="topbar-label">Chrome</span>
      <select data-action="chrome-placement" aria-label="Simulate host chrome vs overlay">
        <option value="host"${chromePlacement === "host" ? " selected" : ""}>Host chrome</option>
        <option value="overlay"${chromePlacement === "overlay" ? " selected" : ""}>Overlay</option>
      </select>
    </label>
    <label class="line-mode-switch">
      <span class="topbar-label">Line mode</span>
      <select data-action="line-mode" aria-label="Prompt line mode">
        <option value="2-line"${lineMode === "2-line" ? " selected" : ""}>2-line</option>
        <option value="1-line"${lineMode === "1-line" ? " selected" : ""}>1-line</option>
      </select>
    </label>
    <label class="line-mode-switch">
      <span class="topbar-label">${TRI} mode</span>
      <select data-action="arrow-mode" aria-label="Gutter arrow mode">
        <option value="ephemeral"${arrowMode === "ephemeral" ? " selected" : ""}>ephemeral</option>
        <option value="persist"${arrowMode === "persist" ? " selected" : ""}>persist</option>
      </select>
    </label>
    <button type="button" data-action="theme">Theme: ${THEMES[theme].label}</button>
    <button type="button" data-action="paste-toggle">${pasteOpen ? "Hide" : "Show"} paste</button>
    <span class="hint-bar">${copyImplication}</span>`;
}

function submitCommand(): void {
  const cmd = inputText.trim();
  if (!cmd) return;
  history.push({
    tokens: snapshotTokens(),
    command: cmd,
    showArrow: arrowMode === "persist",
  });
  inputText = "";
  focusedToken = null;
  render();
}

function bindTopBar(root: ParentNode): void {
  root.querySelector<HTMLSelectElement>('[data-action="chrome-placement"]')?.addEventListener("change", (ev) => {
    chromePlacement = (ev.target as HTMLSelectElement).value as ChromePlacement;
    render();
  });
  root.querySelector<HTMLSelectElement>('[data-action="line-mode"]')?.addEventListener("change", (ev) => {
    lineMode = (ev.target as HTMLSelectElement).value as LineMode;
    focusedToken = null;
    render();
  });
  root.querySelector<HTMLSelectElement>('[data-action="arrow-mode"]')?.addEventListener("change", (ev) => {
    arrowMode = (ev.target as HTMLSelectElement).value as ArrowMode;
    history = history.map((h) => ({ ...h, showArrow: arrowMode === "persist" }));
    render();
  });
  root.querySelector<HTMLButtonElement>('[data-action="theme"]')?.addEventListener("click", () => {
    theme = nextTheme(theme);
    render();
  });
  root.querySelector<HTMLButtonElement>('[data-action="paste-toggle"]')?.addEventListener("click", () => {
    pasteOpen = !pasteOpen;
    render();
  });
}

function render(): void {
  const pasteLines = visibleLines(pasteBlock);
  const scrollHint =
    pasteBlock.lines.length > PASTE_VISIBLE
      ? "PgUp/PgDn scroll · Enter accept · Esc dismiss"
      : "Enter accept · Esc dismiss";

  const bar = topBarInnerHtml();
  const hostChrome = chromePlacement === "host";
  const placementNote = hostChrome
    ? "SIM: negotiation accepted — bar in native host chrome (outside terminal pane)"
    : "SIM: negotiation rejected/unsupported — bar on display-overlay inside shell";

  app.innerHTML = `<div class="desk ${THEMES[theme].rootClass} chrome-${chromePlacement}">
  ${
    hostChrome
      ? `<div class="host-frame">
    <div class="host-title">OpenShellOrg terminal <span class="host-muted">(simulated host chrome)</span></div>
    <div class="tui-topbar host-native" role="toolbar" aria-label="Native host top context bar">${bar}</div>
    <div class="terminal-pane">`
      : ""
  }
  ${
    !hostChrome
      ? `<div class="tui-topbar overlay-sim" role="toolbar" aria-label="Overlay top context bar">${bar}</div>`
      : ""
  }
  <div class="terminal" tabindex="0">
    <div class="placement-banner">${placementNote}</div>
    <div class="paste-overlay ${pasteOpen ? "" : "hidden"}">
      <div class="paste-title">PASTE PREVIEW (${PASTE_VISIBLE} lines)</div>
      ${pasteLines.map((l) => `<div class="paste-line">${escapeHtml(l)}</div>`).join("")}
      <div class="paste-hint">${scrollHint}</div>
    </div>
    <div class="scrollback">${historyBlockHtml()}</div>
    ${livePromptHtml()}
    <div class="output">chrome=<strong>${chromePlacement}</strong> · line=<strong>${lineMode}</strong> · arrow=<strong>${arrowMode}</strong></div>
  </div>
  ${hostChrome ? `</div></div>` : ""}
</div>`;

  bindTopBar(app);

  const field = app.querySelector<HTMLInputElement>(".input-field");
  const mock = app.querySelector<HTMLSpanElement>(".input-mock");
  if (field) {
    if (focusedToken) {
      field.classList.add("hidden");
      mock?.classList.remove("hidden");
    } else {
      field.classList.remove("hidden");
      mock?.classList.add("hidden");
      field.addEventListener("input", () => {
        inputText = field.value;
        const tokenHost = app.querySelector(".live .tokens");
        if (tokenHost) tokenHost.innerHTML = tokensHtml(visibleTokens());
        const mark = app.querySelector(".live .gutter-mark");
        if (mark) {
          const help = helpVisible();
          mark.textContent = help ? `?${TRI}` : TRI;
          mark.classList.toggle("has-help", help);
        }
      });
      field.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter") {
          ev.preventDefault();
          submitCommand();
        }
      });
    }
  }

  app.querySelectorAll<HTMLSpanElement>(".live [data-token]").forEach((el) => {
    el.addEventListener("click", () => {
      focusedToken = el.dataset.token ?? null;
      render();
    });
  });

  app.querySelector<HTMLDivElement>(".terminal")?.focus();
}

document.addEventListener("keydown", (ev) => {
  const tag = (ev.target as HTMLElement)?.tagName;
  if (tag === "INPUT" || tag === "SELECT") {
    if (ev.key === "ArrowLeft" && tag === "INPUT" && (ev.target as HTMLInputElement).selectionStart === 0 && !focusedToken) {
      focusedToken = stepFocus(order, null, -1);
      ev.preventDefault();
      render();
    }
    return;
  }
  if (ev.key === "ArrowLeft") {
    focusedToken = stepFocus(order, focusedToken, -1);
    ev.preventDefault();
    render();
    return;
  }
  if (ev.key === "ArrowRight" && focusedToken) {
    focusedToken = stepFocus(order, focusedToken, 1);
    ev.preventDefault();
    render();
    return;
  }
  if (ev.key === "Enter" && focusedToken) {
    focusedToken = null;
    ev.preventDefault();
    render();
    return;
  }
  if (ev.key === "Escape" && pasteOpen) {
    pasteOpen = false;
    ev.preventDefault();
    render();
    return;
  }
  if (pasteOpen && ev.key === "PageUp") {
    pasteBlock = scrollPaste(pasteBlock, -1);
    ev.preventDefault();
    render();
    return;
  }
  if (pasteOpen && ev.key === "PageDown") {
    pasteBlock = scrollPaste(pasteBlock, 1);
    ev.preventDefault();
    render();
  }
});

render();
