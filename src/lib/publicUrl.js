/**
 * URL for files in `public/` (copied to dist root). Use this instead of a
 * leading "/" path so GitHub Pages subpath deploys resolve correctly.
 *
 * The prefix comes from Vite `base` (see vite.config.js, often driven by
 * VITE_BASE_PATH in CI). No extra .env key is required.
 *
 * @param {string} path - e.g. "images/logo.png" or "/images/logo.png"
 * @returns {string}
 */
export function publicUrl(path) {
  const trimmed = path.replace(/^\/+/, "");
  const base = import.meta.env.BASE_URL;
  return `${base}${trimmed}`;
}
