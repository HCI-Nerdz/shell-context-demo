/** Capture static PNG mockups from tools/mocks/*.html → public/mock/ + screenshots/ */
import { chromium } from "playwright";
import { mkdir, copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const variants = ["prompt", "standalone", "decoupled", "manager", "zones", "association"];
const WIDTH = 1122;
const HEIGHT = 585;

await mkdir(path.join(root, "public", "mock"), { recursive: true });
await mkdir(path.join(root, "screenshots"), { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });

for (const id of variants) {
  const html = path.join(root, "tools", "mocks", `${id}.html`);
  const outPublic = path.join(root, "public", "mock", `${id}.png`);
  const outMirror = path.join(root, "screenshots", `${id}.png`);
  await page.goto(`file:///${html.replace(/\\/g, "/")}`);
  await page.locator("#capture").screenshot({ path: outPublic, type: "png" });
  await copyFile(outPublic, outMirror);
  console.log(`captured ${id}.png (${WIDTH}×${HEIGHT})`);
}

await browser.close();
