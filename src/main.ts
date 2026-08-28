import { DEMO_TOKENS, PASTE_SAMPLE } from "./core/session";
import type { PasteBlock, ThemeId } from "./core/types";
import { stepFocus, tokenFocusOrder } from "./controller/focus";
import { PASTE_VISIBLE, scrollPaste, visibleLines } from "./controller/paste";
import { nextTheme, THEMES } from "./render/themes";

const app = document.querySelector<HTMLDivElement>("#app")!;
let focusedToken: string | null = null;
let theme: ThemeId = "default";
let pasteOpen = true;
let pasteBlock: PasteBlock = { lines: PASTE_SAMPLE, visibleStart: 0 };
const order = tokenFocusOrder(DEMO_TOKENS.map((t) => t.id));

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderToken(t: (typeof DEMO_TOKENS)[number]): string {
  const focused = focusedToken === t.id ? " focused" : "";
  const suffix = t.kind === "enum" || t.kind === "path" ? " ?" : "";
  return `<span class="token ${t.zone}${focused}" title="${t.label}">${t.label}: ${escapeHtml(t.value)}${suffix}</span>`;
}

function render(): void {
  const pasteLines = visibleLines(pasteBlock);
  const scrollHint = pasteBlock.lines.length > PASTE_VISIBLE
    ? `PgUp/PgDn scroll ? Enter accept ? Esc dismiss`
    : "Enter accept ? Esc dismiss";
  app.innerHTML = `<div class="desk ${THEMES[theme].rootClass}"><div class="toolbar"><button type="button" data-action="theme">Theme: ${THEMES[theme].label}</button><button type="button" data-action="paste-toggle">${pasteOpen ? "Hide" : "Show"} paste preview</button><span class="hint-bar">Left-arrow cycles token focus ? ? gutter placeholder</span></div><div class="terminal" tabindex="0"><div class="paste-overlay ${pasteOpen ? "" : "hidden"}"><div class="paste-title">PASTE PREVIEW (${PASTE_VISIBLE} lines)</div>${pasteLines.map((l)=>`<div class="paste-line">${escapeHtml(l)}</div>`).join("")}<div class="paste-hint">${scrollHint}</div></div><div class="prompt-row"><div class="gutter"><button type="button" class="gutter-help" disabled>?</button></div><div class="tokens">${DEMO_TOKENS.map(renderToken).join("")}</div><div class="prompt-input"><span class="chevron">?</span><span class="input-mock">${focusedToken ? `[${focusedToken}]` : "gcloud compute instances list"}</span></div></div><div class="output">Mock scrollback</div></div></div>`;
  app.querySelector<HTMLButtonElement>('[data-action="theme"]')?.addEventListener("click", () => { theme = nextTheme(theme); render(); });
  app.querySelector<HTMLButtonElement>('[data-action="paste-toggle"]')?.addEventListener("click", () => { pasteOpen = !pasteOpen; render(); });
  app.querySelector<HTMLDivElement>(".terminal")?.focus();
}

document.addEventListener("keydown", (ev) => {
  if (ev.key === "ArrowLeft") { focusedToken = stepFocus(order, focusedToken, -1); ev.preventDefault(); render(); return; }
  if (ev.key === "ArrowRight" && focusedToken) { focusedToken = stepFocus(order, focusedToken, 1); ev.preventDefault(); render(); return; }
  if (ev.key === "Enter" && focusedToken) { focusedToken = null; ev.preventDefault(); render(); return; }
  if (ev.key === "Escape" && pasteOpen) { pasteOpen = false; ev.preventDefault(); render(); return; }
  if (pasteOpen && ev.key === "PageUp") { pasteBlock = scrollPaste(pasteBlock, -1); ev.preventDefault(); render(); return; }
  if (pasteOpen && ev.key === "PageDown") { pasteBlock = scrollPaste(pasteBlock, 1); ev.preventDefault(); render(); }
});
render();
