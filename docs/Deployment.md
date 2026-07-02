# Deployment — Titulino UI React App

## Overview

This is a Create React App (CRA) project. The build output is a static site (HTML, JS, CSS) that can be deployed to any static hosting provider or served from a CDN.

---

## Local Development

### Prerequisites
- Node.js (check `.nvmrc` or `package.json` engines if present)
- npm

### Start development server
```bash
npm run dev
```

This runs two processes concurrently:
1. `react-scripts start` — CRA dev server with HMR on `localhost:3000`
2. `npx gulp watch` — Compiles LESS → CSS and watches for style changes

### Start dev server only (no Gulp)
```bash
npm start
```

---

## Environment Configuration

The app uses `.env.*` files for environment-specific values. CRA only exposes variables prefixed with `REACT_APP_`.

| File | Purpose |
|---|---|
| `.env` | Shared base values |
| `.env.development` | Development overrides (used with `npm start`) |
| `.env.local` | Local machine overrides — **never commit this file** |
| `.env.production` | Production values (used with `npm run build`) |

### Required environment variables

| Variable | Description |
|---|---|
| `REACT_APP_SUPABASE_URL` | Supabase project URL |
| `REACT_APP_SUPABASE_ANON_KEY` | Supabase anonymous API key |
| `REACT_APP_SUPABASE_BASE_API_URL` | Supabase RPC base URL (`/rest/v1/rpc`) |
| `REACT_APP_BACKEND_NET_SERVICE_USERNAME` | .NET backend service username |
| `REACT_APP_BACKEND_NET_TITULINO_API_KEY` | .NET backend API key |
| `REACT_APP_STORAGE_KEY` | AES encryption key for LocalStorageService |
| `REACT_APP_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (starts with `pk_`) |
| `REACT_APP_RECAPTCHA_SITE_KEY` | Google reCAPTCHA v3 site key |

---

## Production Build

```bash
npm run build
```

- Output directory: `build/`
- CRA produces minified, chunked, content-hashed static files
- `build/index.html` is the SPA entry point
- All routes resolve to `index.html` (configure on the server/CDN accordingly)

### Cache busting

The `scripts/bumpCacheVersion.js` script updates an internal version number used by the app to force cache invalidation on new deploys. This runs automatically as part of `npm run release`.

---

## Release Process

Releases use `standard-version` for automated semantic versioning and changelog generation.

### Standard release flow

```bash
# 1. Ensure you are on the correct branch and it is clean
git status

# 2. Run the release script
npm run release
# This does:
#   - Bumps version in package.json
#   - Updates CHANGELOG.md
#   - Runs scripts/bumpCacheVersion.js
#   - Creates a git commit and version tag (e.g., v0.1.219)

# 3. Push with tags
git push --follow-tags origin <branch-name>

# 4. Run post-release automation
npm run afterEachRelease
# This runs scripts/afterEachRelease.js
```

### Version format
Follows semantic versioning (SemVer): `MAJOR.MINOR.PATCH`  
Current version: `0.1.218` (see `package.json`)

---

## Build Verification

Before merging or deploying, verify the build is clean:

```bash
npm run build
```

Check for:
- Zero build errors
- No unexpected bundle size increases
- All `REACT_APP_*` variables resolve (missing variables become `undefined` silently)

---

## Routing on the Server

This is a Single Page Application. The server must serve `index.html` for all routes so React Router handles navigation client-side.

**Example: nginx**
```nginx
location / {
  try_files $uri /index.html;
}
```

**Example: Apache `.htaccess`**
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ /index.html [QSA,L]
```

---

## Testing

```bash
npm test
```

Runs Jest via `react-scripts test` in watch mode. For CI (single run):
```bash
CI=true npm test
```

---

## Styling Build (Gulp)

LESS files in `src/assets/` are compiled to CSS by Gulp:

```bash
npx gulp build   # one-time compile
npx gulp watch   # watch mode (included in npm run dev)
```

Gulp pipeline: LESS → PostCSS → Autoprefixer → CSS output

This step is required if LESS files have changed and you want the latest styles reflected in the build.

---

## Related Codebases

Titulino is a multi-repo system. This UI app connects to:

| Codebase | Role |
|---|---|
| `titulino-net-api` | Backend REST API for enrollment, profile upload, impersonation, email, AI result endpoint |
| `TitulinoWorkerService` | Background .NET worker — polls `Lrn.KnowMeAiJob` and processes AI essay corrections; deployed via GitHub Actions on push to `master` (auto build + copy + `systemctl restart titulino-worker`) |
| `titulino-warehouse` | Database schema and Sqitch migrations — must deploy before dependent services |
| `titulino-communication` | Communication service — shares Models/Repository libs with the worker; rebuild when shared interfaces change |

### Deployment order when all layers change

1. **titulino-warehouse** — `sqitch deploy` on prod DB *(gates everything)*
2. **TitulinoWorkerService** — push to `master` → GitHub Actions handles the rest automatically
3. **titulino-net-api** — build + deploy to prod
4. **titulino-ui** — `ssh-add` → `.claude/support-scripts/release.sh`

Ensure backend services are deployed and environment variables point to the correct endpoints before deploying the UI.
