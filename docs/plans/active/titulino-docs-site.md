# Plan: docs.titulino.com — Internal Docs Site

**Goal:** Admin-only documentation hub at `docs.titulino.com` + staging at `dev.docs.titulino.com`.  
**Repo:** `titulino-docs`  
**Framework:** Docusaurus 3 (React, dark theme, sidebar auto-gen)  
**Auth:** Supabase — `user.app_metadata.isAdmin === true` (set per user in Supabase dashboard)

---

## Progress

### P0 — Foundation ✅ COMPLETE

- [x] Create `titulino-docs` repo, scaffold Docusaurus 3 (`npx create-docusaurus@latest --javascript`)
- [x] Configure `docusaurus.config.js` — URL, dark mode default, Prism languages (csharp/sql/hcl/bash)
- [x] Configure `sidebars.js` — 6 categories (titulino-ui, net-api, worker, communication, warehouse, infra)
- [x] Write Supabase auth gate in `src/theme/Root.js` — BrowserOnly, isAdmin check, inline login form
- [x] Dark theme in `src/css/custom.css`
- [x] Write `src/config/EnvironmentConfig.js` — local / dev / prod URL switching via `DOCS_ENV`
- [x] Update `docusaurus.config.js` to use `EnvironmentConfig.js`
- [x] Create `.env` (local, gitignored) with real Supabase values
- [x] Update `.env.example` and `.gitignore`

### P1 — Initial content ✅ COMPLETE

- [x] Write `docs/intro.mdx` — hub landing page
- [x] Copy titulino-ui docs: architecture, coding-standards, deployment, feature-workflow, known-bugs
- [x] Create `_category_.json` stubs for 5 remaining repos (net-api, worker, communication, warehouse, infra)

### P2 — CI/CD ✅ COMPLETE

- [x] Write `.github/workflows/deploy-docs.yml`:
  - PR opened → `DOCS_ENV=development` → deploy to `gs://dev.docs.titulino.com` → PR comment with URL
  - Push to main → `DOCS_ENV=production` → deploy to `gs://docs.titulino.com`

### P3 — GCP infrastructure ✅ COMPLETE

- [x] D02 — Terraform: `dev.docs.titulino.com` GCS bucket in `docs-bucket.tf`
- [x] D03 — Terraform: `dev-docs-titulino` backend bucket + URL map host rule
- [x] D04 — Terraform: `titulino-all-domains-v2` SSL cert covering 4 domains + proxy cert swap
- [x] D11 — New cert ACTIVE 2026-06-30, old cert `titulino-all-pd-domains` removed from proxy + deleted

### P4 — User actions ✅ COMPLETE

- [x] D05 — Namecheap DNS: add A record `dev.docs` → `34.8.75.161`
- [x] D08 — GitHub Secrets in `titulino-docs` repo: `SUPABASE_URL_DEV/PROD`, `SUPABASE_ANON_KEY_DEV/PROD`, `GCP_SA_KEY`, `TITULINO_NET_API_KEY_DEV`, `BACKEND_NET_TITULINO_API_KEY_PROD`
- [x] D09 — Not needed: auth uses `.NET API isGlobalAccessUser` (same as main app), not Supabase app_metadata
- [x] D10 — `npm start` compiles successfully; local full test requires TITULINO_NET_API_KEY in .env

### P5 — Starter docs for remaining repos ✅ COMPLETE

- [x] S01 — Write starter docs for `titulino-net-api` section (architecture, coding-standards, deployment, feature-workflow)
- [x] S02 — Write starter docs for `TitulinoWorkerService` section (architecture, coding-standards, deployment, feature-workflow)
- [x] S03 — Write starter docs for `titulino-communication` section (architecture, coding-standards, deployment, feature-workflow)
- [x] S04 — Write starter docs for `titulino-warehouse` section (architecture, coding-standards, deployment, feature-workflow)
- [x] S05 — Write `docs/titulino-infra/architecture.md` (ported from `titulino-infra/ARCHITECTURE.md`)
- [x] Update `docs/intro.mdx` with links to all docs across all repos

### P6 — GitHub sync actions (after site is live)

- [ ] A01 — Action in `titulino-ui`: push to main → sync `docs/**/*.md` → `titulino-docs/docs/titulino-ui/`
- [ ] A02 — Action in `titulino-net-api`: sync `docs/**/*.md` → `titulino-docs/docs/titulino-net-api/`
- [ ] A03 — Action in `TitulinoWorkerService`: sync `docs/**/*.md` → `titulino-docs/docs/titulino-worker/`
- [ ] A04 — Action in `titulino-communication`: sync `docs/**/*.md` → `titulino-docs/docs/titulino-communication/`
- [ ] A05 — Action in `titulino-warehouse`: sync `docs/**/*.md` → `titulino-docs/docs/titulino-warehouse/`

### P7 — Polish (after site is live)

- [ ] Search (Docusaurus built-in local search plugin)
- [ ] Copy HTML sprint plan artifacts into `static/` — link from `intro.mdx`

---

## Task count

| Phase | Tasks | Status |
|---|---|---|
| P0 Foundation | 9 | ✅ Done |
| P1 Content | 3 | ✅ Done |
| P2 CI/CD | 1 | ✅ Done |
| P3 GCP infra | 4 | ⏳ Waiting for quota (D02–D04, D11) |
| P4 User actions | 4 | 🙋 User (D05, D08, D09, D10) |
| P5 Starter docs | 5 | 🔜 Can do now |
| P6 Sync actions | 5 | 🔜 After site live |
| P7 Polish | 2 | 🔜 After site live |

**Remaining: 20 tasks total (4 blocked, 4 user, 12 me)**

---

## Auth — how to grant admin access

Supabase dashboard → Authentication → Users → select user → Edit → App metadata:
```json
{ "isAdmin": true }
```

---

## Decisions log

| Decision | Choice | Reason |
|---|---|---|
| Framework | Docusaurus 3 | React-based, MD → HTML, sidebar auto-gen, consistent with main app stack |
| Auth | Supabase `app_metadata.isAdmin` | Single Supabase project already in use; no .NET API changes needed; works across origins |
| Env config | `EnvironmentConfig.js` + `DOCS_ENV` | Mirrors main app pattern; CI sets env var per branch |
| Dev subdomain | `dev.docs.titulino.com` | PR previews before promoting to prod |
| Content source | MD files in each repo's `docs/` | Docs live next to code; P6 sync actions keep them current |
