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

## BUG-003 — CDMX shows no map highlight (DistritoFederal / Ciudad de México name mismatch)

**Status:** `OPEN` — fix identified, requires change in a different repository  
**Severity:** Medium — contacts from Mexico City get no region highlight in the Geography map  
**Discovered:** 2026-06-26  
**Work log:** [docs/work-logs/2026-06-27.md](work-logs/2026-06-27.md)

### Symptom

In Admin Tools → contact detail → Geography tab, contacts whose `CountryDivisionBirthName` or `CountryDivisionResidencyName` is `"Ciudad de México"` show no highlighted region on the Mexico map. The rest of the map renders correctly.

### Root cause

The GADM GeoJSON file used for the Mexico map (`gadm41_MX_1.json` in the `titulino-bucket-spine` repo) still uses the pre-2016 name for the CDMX feature:

```json
{ "NAME_1": "DistritoFederal", ... }
```

The database stores the current official name `"Ciudad de México"`. `RegiondataWidget` normalizes both strings and looks for a match — `"ciudaddemxico"` does not match `"distritofederal"`, so no feature is highlighted.

### Fix (not yet applied)

**Repository:** `titulino-bucket-spine`  
**File:** `titulino-spine-data/maps/gadm41_MX_1.json`

For the CDMX feature entry:
1. Change `NAME_1` from `"DistritoFederal"` → `"CiudaddeMéxico"` (normalized form matches DB value)
2. Add or set `VARNAME_1: "DistritoFederal"` — `RegiondataWidget` includes `VARNAME_1` in its alias lookup, so old contacts stored with the pre-2016 name continue to match

This is a pure data change, no code change required.

### Related

BUG-003 was discovered alongside a separate map bug (Estado de México false positive for all Mexican contacts), which was **fixed** in commit `6d706ff` on 2026-06-27 by setting `nativeName: null` in both `EnrolleeByRegionWidget` calls in [src/components/admin-components/Insights/GlobalAdminToolsLandingDashboard.js](../src/components/admin-components/Insights/GlobalAdminToolsLandingDashboard.js).
