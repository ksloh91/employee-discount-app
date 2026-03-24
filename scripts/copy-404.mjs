/**
 * GitHub Pages serves 404.html for unknown paths. Copy index.html so SPA routes work on refresh.
 */
import { copyFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dist = join(__dirname, "..", "dist");
const indexHtml = join(dist, "index.html");
const notFoundHtml = join(dist, "404.html");

if (!existsSync(indexHtml)) {
  console.error("copy-404: dist/index.html missing — run vite build first");
  process.exit(1);
}
copyFileSync(indexHtml, notFoundHtml);
console.log("copy-404: wrote dist/404.html");
