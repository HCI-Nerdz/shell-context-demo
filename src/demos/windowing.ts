/** Faux OS-window chrome for facsimile desks (not real HWND / multi-monitor). */

export interface WinGeom {
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  minimized: boolean;
  closed: boolean;
}

export function defaultGeom(
  seed: Partial<WinGeom> & Pick<WinGeom, "x" | "y">,
): WinGeom {
  return {
    w: 280,
    h: 200,
    z: 1,
    minimized: false,
    closed: false,
    ...seed,
  };
}

export function titleBarHtml(opts: {
  title: string;
  winId: string;
  badge?: string;
  actions?: Array<"close" | "min">;
}): string {
  const actions = opts.actions ?? ["min", "close"];
  const badge = opts.badge
    ? `<span class="ot-win-badge">${opts.badge}</span>`
    : "";
  const btns = actions
    .map((a) => {
      if (a === "min") {
        return `<button type="button" class="ot-win-btn" data-win-min="${opts.winId}" title="Minimize" aria-label="Minimize">─</button>`;
      }
      return `<button type="button" class="ot-win-btn ot-win-close" data-win-close="${opts.winId}" title="Close" aria-label="Close">×</button>`;
    })
    .join("");
  return `<div class="ot-win-titlebar" data-win-drag="${opts.winId}">
  <span class="ot-win-title-text">${opts.title}${badge}</span>
  <span class="ot-win-actions">${btns}</span>
</div>`;
}

export function winStyle(g: WinGeom, focused: boolean): string {
  const z = focused ? Math.max(g.z, 40) : g.z;
  const h = g.minimized ? "auto" : `${g.h}px`;
  return `left:${g.x}px;top:${g.y}px;width:${g.w}px;height:${h};z-index:${z}`;
}

/**
 * Bind drag, focus raise, minimize, close, and optional SE resize on a desk.
 * Geometries live on `getGeom` / `setFocus`; close/min mutate via callbacks.
 */
export function bindFauxWindows(
  root: ParentNode,
  opts: {
    getGeom: (id: string) => WinGeom | undefined;
    setFocus: (id: string) => void;
    onClose: (id: string) => void;
    onMin: (id: string) => void;
    bumpZ: (id: string) => void;
    redraw: () => void;
  },
): void {
  root.querySelectorAll<HTMLElement>("[data-win]").forEach((el) => {
    const id = el.dataset.win;
    if (!id) return;
    el.addEventListener("pointerdown", (e) => {
      const t = e.target as HTMLElement;
      if (t.closest("[data-win-close], [data-win-min], [data-win-resize]")) return;
      opts.setFocus(id);
      opts.bumpZ(id);
      // focus paint without full redraw when only z/focus changed — still redraw for class
      opts.redraw();
    });
  });

  root.querySelectorAll<HTMLButtonElement>("[data-win-close]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.dataset.winClose;
      if (id) opts.onClose(id);
    });
  });

  root.querySelectorAll<HTMLButtonElement>("[data-win-min]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.dataset.winMin;
      if (id) opts.onMin(id);
    });
  });

  root.querySelectorAll<HTMLElement>("[data-win-drag]").forEach((bar) => {
    const id = bar.dataset.winDrag;
    if (!id) return;
    bar.addEventListener("pointerdown", (e) => {
      if ((e.target as HTMLElement).closest("button")) return;
      const g = opts.getGeom(id);
      if (!g || g.closed) return;
      e.preventDefault();
      opts.setFocus(id);
      opts.bumpZ(id);
      const startX = e.clientX;
      const startY = e.clientY;
      const origX = g.x;
      const origY = g.y;
      const win = bar.closest<HTMLElement>("[data-win]");
      const onMove = (ev: PointerEvent) => {
        g.x = Math.max(0, origX + (ev.clientX - startX));
        g.y = Math.max(0, origY + (ev.clientY - startY));
        if (win) {
          win.style.left = `${g.x}px`;
          win.style.top = `${g.y}px`;
        }
      };
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        opts.redraw();
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    });
  });

  root.querySelectorAll<HTMLElement>("[data-win-resize]").forEach((handle) => {
    const id = handle.dataset.winResize;
    if (!id) return;
    handle.addEventListener("pointerdown", (e) => {
      const g = opts.getGeom(id);
      if (!g || g.closed || g.minimized) return;
      e.preventDefault();
      e.stopPropagation();
      opts.setFocus(id);
      opts.bumpZ(id);
      const startX = e.clientX;
      const startY = e.clientY;
      const origW = g.w;
      const origH = g.h;
      const win = handle.closest<HTMLElement>("[data-win]");
      const onMove = (ev: PointerEvent) => {
        g.w = Math.max(180, origW + (ev.clientX - startX));
        g.h = Math.max(120, origH + (ev.clientY - startY));
        if (win) {
          win.style.width = `${g.w}px`;
          win.style.height = `${g.h}px`;
        }
      };
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        opts.redraw();
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    });
  });
}

export function nextZ(geoms: Iterable<WinGeom>): number {
  let max = 1;
  for (const g of geoms) {
    if (g.z > max) max = g.z;
  }
  return max + 1;
}
