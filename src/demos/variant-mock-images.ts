/** Static PNG anchoring mockups — captured from tools/mocks/*.html (non-interactive). */

export type MockRoute =
  | "prompt"
  | "standalone"
  | "decoupled"
  | "manager"
  | "zones"
  | "association";

/** Fixed capture size (tools/capture-mocks.mjs). */
export const MOCK_WIDTH = 1122;
export const MOCK_HEIGHT = 585;

export function variantMockSrc(id: MockRoute): string {
  return `${import.meta.env.BASE_URL}mock/${id}.png`;
}

export function variantMockImg(id: MockRoute, alt: string): string {
  const src = variantMockSrc(id);
  return `<img class="demo-variant-mock-img" src="${src}" width="${MOCK_WIDTH}" height="${MOCK_HEIGHT}" alt="${alt}" loading="eager" decoding="async" draggable="false" />`;
}
