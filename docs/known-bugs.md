# Known Bugs

Tracked defects that have been diagnosed but not yet fixed, or fixed in one part and still open in another. Add a new entry when a bug is confirmed. Update **Status** when work begins or completes. Link to the relevant work log or plan.

---

## How to use this file

| Status | Meaning |
|---|---|
| `OPEN` | Confirmed bug, not yet fixed |
| `PARTIAL` | Fix applied to one layer; another layer still needs work |
| `IN PROGRESS` | Actively being worked on this session |
| `FIXED` | Resolved and deployed — keep for historical reference |

---

## BUG-006 — AI grammar notes rendered raw `**markdown**` instead of plain text

**Status:** `FIXED` — deployed with Phase 6 (T38) on 2026-07-02  
**Severity:** Medium — all grammar notes in completed AI reviews showed visible asterisks instead of formatted text  
**Discovered:** 2026-06-30 (first end-to-end test)  
**Work log:** [docs/work-logs/2026-07-02.md](work-logs/2026-07-02.md)

### Symptom

Grammar notes in the Know Me AI review result card displayed raw markdown syntax, e.g.:
`**Use simple past:** changed "go" to "went"` instead of bold text.

### Root cause

The AI prompt did not specify plain-text output. Gemini (and other models) default to markdown formatting in free-text fields.

### Fix applied

Added an explicit plain-text rule to `AiPromptHelper.BuildEssayCorrectionPrompt` in `TitulinoWorkerService`:

> "All text values must be plain text — no asterisks, no bold, no italic, no markdown formatting of any kind."

**Note:** Existing completed jobs in the DB still contain markdown in their stored `FeedbackJson`. These are legacy test rows — new jobs processed after the worker deploy will be plain text.

---

## BUG-001 — Auth redirect loses query params after logout/login cycle

**Status:** `OPEN`  
**Severity:** Low — only affects pages whose URLs carry state in query params  
**Discovered:** 2026-06-27  
**Work log:** [docs/work-logs/2026-06-27.md](work-logs/2026-06-27.md)

### Symptom

When a user logs out from a page whose URL contains query parameters (e.g. `/lrn-auth/contact?contactId=abc123&tab=courses`) and then logs back in, they land on the correct section but the query params are gone (`/lrn-auth/contact`).

### Root cause

`RouteInterceptor` in [src/views/index.js](../src/views/index.js) builds the post-login redirect URL using only `pathname` — `search` and `hash` are not included:

```js
// Current (drops query params and hash):
search: `?redirect=${encodeURIComponent(pathname)}`

// Fix:
search: `?redirect=${encodeURIComponent(pathname + (search || '') + (hash || ''))}`
```

`useLocation()` already provides `search` and `hash` — they just need to be destructured and appended.

### Scope

- Verified **not** broken for simple paths with no query params (manual test 2026-06-27: `/lrn-auth/global-admin`, `/lrn-auth/shopping` both redirected correctly)
- Would break for any URL like `/lrn-auth/contact?contactId=X` or `/lrn-auth/shopping?courseId=Y`

### Fix (not yet applied)

**File:** [src/views/index.js](../src/views/index.js)

1. Add `search` and `hash` to the `useLocation()` destructure
2. Change `encodeURIComponent(pathname)` → `encodeURIComponent(pathname + (search || '') + (hash || ''))`

One line change. No other files need to change — the login page's `getRedirectPath()` already decodes and uses the full value.

---

## BUG-002 — Stale `postLoginRedirect` in localStorage causes wrong redirect on fresh login

**Status:** `OPEN`  
**Severity:** Low — only triggers when navigating directly to the login page (no `?redirect=` param)  
**Discovered:** 2026-06-27  
**Work log:** [docs/work-logs/2026-06-27.md](work-logs/2026-06-27.md)

### Symptom

A user who navigates directly to `https://dev.titulino.com/lrn/login` (e.g. via a "Login" link, a bookmark, or after a browser restart) can be sent to a page they visited in a previous session — without intending to go there.

### Root cause

`localStorage.getItem('postLoginRedirect')` is set each time `RouteInterceptor` catches an unauthenticated access, but it is **never cleared after it is consumed**. `getRedirectPath()` in the login page falls back to it as a third priority (after query param and `location.state`):

```js
// getRedirectPath() priority chain:
// 1. ?redirect= or ?redirectTo= query param   ← RouteInterceptor sets this on logout ✓
// 2. location.state.from                       ← not set on logout
// 3. localStorage.getItem('postLoginRedirect') ← stale from previous session ✗
// 4. APP_PREFIX_PATH ('/lrn')                  ← safe fallback
```

When the user arrives at login WITH a `?redirect=` param (the normal logout path), priority 1 fires correctly and priority 3 is never reached. The bug only surfaces when priority 1 is absent.

### Fix (not yet applied)

Clear `postLoginRedirect` from localStorage after it is consumed — two places:

**File A:** [src/views/app-views/user/login/index.js](../src/views/app-views/user/login/index.js) — inside `handleSuccessfulLogin()`, after `history.replace(redirectPath)`:
```js
localStorage.removeItem('postLoginRedirect');
```

**File B:** [src/components/layout-components/EmailYearSearchForm.js](../src/components/layout-components/EmailYearSearchForm.js) — after the profile-gate redirect call, same line:
```js
localStorage.removeItem('postLoginRedirect');
```

---

## BUG-004 — npm audit: uuid buffer-bounds warning in dev toolchain (accepted risk)

**Status:** `OPEN` — accepted, no production exposure  
**Severity:** Low — dev-only dependency, not in production bundle  
**Discovered:** 2026-06-30  
**Advisory:** [GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq)

### What `npm audit` reports

```
uuid  <11.1.1  — moderate
  node_modules/sockjs/node_modules/uuid
  node_modules/uuid
    react-tooltip  4.1.5 - 4.5.1  (removed 2026-06-30)
    sockjs  >=0.3.17
      webpack-dev-server  *
        @pmmmwh/react-refresh-webpack-plugin  0.3.1 - 0.5.11
        react-scripts  >=0.1.0
```

### Why this is accepted risk

- `sockjs`, `webpack-dev-server`, and `@pmmmwh/react-refresh-webpack-plugin` are **build toolchain only** — they run during `npm start` / `npm run build` but are **never included in the production bundle output**. Confirmed by inspecting the `build/` output: no sockjs or webpack-dev-server code ships to GCS.
- Note: `npm audit --omit=dev` still shows these because CRA (a CRA quirk) lists `react-scripts` under `dependencies`, not `devDependencies`. The flag is not the right signal here — what matters is that these packages do not appear in the `build/` bundle.
- The uuid buffer-bounds vulnerability (GHSA-w5hq-g745-h8pq) requires explicitly passing a custom `buf` argument to the uuid v3/v5/v6 functions; webpack-dev-server's sockjs usage calls `uuid()` with no buffer, so the vulnerable code path is never reached

### Why it cannot be fixed easily

These packages live inside `react-scripts` (Create React App, now deprecated). Fixing requires either:
- Ejecting CRA (high maintenance cost)
- Migrating to Vite (future roadmap item — see `docs/plans/`)
- Using `npm overrides` to force `uuid@^11.1.1` (risky: may break webpack HMR during development)

### Resolution path

Will be resolved when the project migrates away from CRA. Until then, `npm audit --omit=dev` is the correct command to verify production security posture.

---

## BUG-005 — Chile O'Higgins region tooltip shows corrupted name

**Status:** `FIXED` — committed in `titulino-bucket-spine` on 2026-06-30  
**Severity:** Medium — tooltip displayed `"Libertador General Bernardo O'Higgins'Hi"` (spurious `'Hi` suffix)  
**Discovered:** 2026-06-30  
**Work log:** [docs/work-logs/2026-06-30-phase5.md](work-logs/2026-06-30-phase5.md)

### Symptom

Map tooltip showed `"Chile - Libertador General Bernardo O'Higgins'Hi - 0"` for Chile's 6th region. The region also failed to match against the DB value `"Libertador General Bernardo O'Higgins"`.

### Root cause

`gadm41_CL_1.json` in `titulino-bucket-spine` had a data entry error for `GID_1: CHL.8_1`:

```json
{ "NAME_1": "Libertador General Bernardo O'Higgins'Hi", "VARNAME_1": "Libertador" }
```

The `NAME_1` had a spurious `'Hi` appended (likely a copy-paste truncation artifact from GADM source data). `VARNAME_1` was also truncated to just `"Libertador"`.

### Fix applied

**Repository:** `titulino-bucket-spine` — `titulino-spine-data/maps/gadm41_CL_1.json`

| Feature | Property | Before | After |
|---|---|---|---|
| CHL.8_1 (O'Higgins) | `NAME_1` | `"Libertador General Bernardo O'Higgins'Hi"` | `"Libertador General Bernardo O'Higgins"` |
| CHL.8_1 (O'Higgins) | `VARNAME_1` | `"Libertador"` | `"NA"` |

---

## BUG-003 — CDMX shows no map highlight (DistritoFederal / Ciudad de México name mismatch)

**Status:** `FIXED` — committed `e2b1524` in `titulino-bucket-spine` on 2026-06-27  
**Severity:** Medium — contacts from Mexico City get no region highlight in the Geography map  
**Discovered:** 2026-06-26  
**Work log:** [docs/work-logs/2026-06-27.md](work-logs/2026-06-27.md)

### Symptom

In Admin Tools → contact detail → Geography tab, contacts whose `CountryDivisionBirthName` or `CountryDivisionResidencyName` is `"Ciudad de México"` showed no highlighted region on the Mexico map. Enrollee Insights aggregate map showed tooltip `"México - DistritoFederal - 0"` instead of `"Ciudad de Mexico"`.

### Root cause

The GADM GeoJSON file (`gadm41_MX_1.json` in `titulino-bucket-spine`) used the pre-2016 name for CDMX:

```json
{ "NAME_1": "DistritoFederal", "VARNAME_1": "NA" }
```

The DB stores `"Ciudad de Mexico"`. `RegiondataWidget` normalizes both — `"ciudaddemexico"` did not match `"distritofederal"`.

### Fix applied

**Repository:** `titulino-bucket-spine` — `titulino-spine-data/maps/gadm41_MX_1.json`

| Feature | Property | Before | After |
|---|---|---|---|
| MEX.9_1 (CDMX) | `NAME_1` | `"DistritoFederal"` | `"Ciudad de Mexico"` |
| MEX.9_1 (CDMX) | `VARNAME_1` | `"NA"` | `"DistritoFederal"` |
| MEX.9_1 (CDMX) | `TYPE_1` | `"DistritoFederal"` | `"Distrito Federal"` |
| MEX.15_1 (Estado de México) | `NAME_1` | `"México"` | `"EstadodeMéxico"` *(prior edit)* |

`VARNAME_1: "DistritoFederal"` is kept so any DB records still using the pre-2016 name continue to match via the alias lookup.

### Related

BUG-003 was discovered alongside a separate map bug (Estado de México false positive for all Mexican contacts), which was **fixed** in commit `6d706ff` on 2026-06-27 by setting `nativeName: null` in both `EnrolleeByRegionWidget` calls in [src/components/admin-components/Insights/GlobalAdminToolsLandingDashboard.js](../src/components/admin-components/Insights/GlobalAdminToolsLandingDashboard.js).
