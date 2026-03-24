# Deploy to GitHub Pages

This app is a **Vite + React** SPA. GitHub Pages only serves **static files** from the **`dist`** folder after `npm run build` — it does **not** run Vite or compile `.jsx` from `/src`.

## What was fixed in the repo

1. **`vite.config.js`** — `base` is set from `VITE_BASE_PATH` so asset URLs work under `https://<user>.github.io/<repo>/`.
2. **`BrowserRouter`** — `basename` matches Vite’s `base` (via `import.meta.env.BASE_URL`).
3. **`npm run build`** — runs `vite build` then copies `dist/index.html` → `dist/404.html` so **refreshing** a client route (e.g. `/login`) works on GitHub Pages.
4. **`.github/workflows/deploy-github-pages.yml`** — builds and deploys `dist/` on every push to `main`.

## One-time GitHub setup

1. **Pages source**  
   Repo → **Settings** → **Pages** → **Build and deployment** → **Source**: **GitHub Actions**.

2. **Repository secrets** (same names as your local `.env`)  
   Repo → **Settings** → **Secrets and variables** → **Actions** → add:

   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

   Without these, the build still runs but Firebase will be misconfigured in production.

3. **If your repo name is not `employee-discount-app`**  
   Edit `.github/workflows/deploy-github-pages.yml` and set `VITE_BASE_PATH` to `/<your-repo-name>` (leading slash, no trailing slash required).

4. **Push to `main`**  
   The workflow runs automatically. After it finishes, open:

   `https://<username>.github.io/employee-discount-app/`

## Local production build (same as CI)

```bash
VITE_BASE_PATH=/employee-discount-app npm run build
npx vite preview --base /employee-discount-app/
```

For everyday dev, omit `VITE_BASE_PATH` (defaults to `/`):

```bash
npm run dev
```

## Firebase Auth authorized domains

In Firebase Console → **Authentication** → **Settings** → **Authorized domains**, add:

- `ksloh91.github.io` (or your GitHub username)
- `localhost` (for local dev)
