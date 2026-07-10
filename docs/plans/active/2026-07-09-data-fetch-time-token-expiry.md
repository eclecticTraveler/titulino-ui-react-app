# Data-Fetch-Time Token Expiry Check + 5-Hour TTL

**Started:** 2026-07-09
**Branch:** profile-issues
**Repos touched:** titulino-ui, titulino-net-api (`JwtTokenService.cs` only)

---

## Goal

The prior two plans ([2026-07-08-token-expiry-auto-reprompt.md](2026-07-08-token-expiry-auto-reprompt.md), [2026-07-08-website-preferences-separation-of-concerns.md](2026-07-08-website-preferences-separation-of-concerns.md)) made `AuthenticatedProfileGate` re-check `user.innerToken`'s real JWT expiry on route change and tab focus/visibility-regain. The remaining gap: **staying on the same page and interacting with it** (clicking a button, submitting a form) fires an authenticated call using the dead token, which silently fails/returns empty — neither existing trigger catches this, since neither the URL nor tab visibility changes.

This plan adds a third mechanism: check expiry **at the moment a data-fetch is about to fire**, short-circuiting into `onSessionTokenExpired` instead of making a doomed request. It also bumps the token lifetime itself from ~4 hours to 5 hours, on both sides (frontend cache constant + the backend repo that actually issues the JWT).

---

## Audit findings

Traced every consumer of `grant.user.innerToken` (14 source files reference it). Two access patterns:
- **Direct**: a component reads `user.innerToken` and passes it straight into an action → manager → service call. 2 call sites: `AuthenticatedQuickEnrollment.js`, and `EnrolleeProfile` in `views/auth-views/user/profile/index.js` (calls `KnowMeProfiles.getOwnKnowMeProfileUrlMap` directly, bypassing the action/manager layers).
- **Cache-derived**: a component passes `user.emailId`; the manager resolves the token via `LocalStorageService.getCachedObject('UserProfile_' + emailId).innerToken`. Confirmed via `GrantManager.getUserProfile`/the `grant` reducer this **is** the same JWT as `grant.user.innerToken` for the current identity, not a separate token. Dominant pattern — `AdminToolsManager`: ~35 functions behind one shared internal helper (`getTokenFromEmail`), `AnalyticsManager`: ~6 functions, `LrnManager`/`ShopManager`: a handful more.

All ~35 `AdminToolsManager` functions and the `AnalyticsManager` admin-dashboard functions are dispatched from just two components (`GlobalAdminToolsLandingDashboard.js`, and the admin-tools calls inside `views/auth-views/user/profile/index.js`), always from the same `user.emailId`. Guarding at the **component** level — where `user.innerToken` is already available via `connect()` — turns a 45+-file problem into roughly 8 files. Managers can't dispatch Redux actions, so the guard has to live where dispatch is reachable: the component, right before it fires the action.

**Confirmed out of scope**: `views/app-views/user/impersonation/index.js` (validates a *target* profile before it becomes `grant.user`, not the current session), the unauthenticated enrollment flow, the profile-fetch call that *produces* the token, and dead code (`LrnManager.upsertKnowMeProfilePicture`, `AnalyticsManager.getEnrolleeKnowMeProfilePictureForCourse`, the orphaned `AUTH_TITULINO_INTERNAL_TOKEN` mechanism).

---

## Approach

New shared hook `src/hooks/useSessionTokenExpiryGuard.js` — takes the same `user` and bound `onSessionTokenExpired` a component already receives via `connect()`, returns `ensureValidSession()`:

```js
const ensureValidSession = () => {
  if (isJwtExpired(user?.innerToken)) {
    onSessionTokenExpired(user?.emailId);
    return false; // caller should not proceed with the fetch
  }
  return true;
};
```

Reuses `isJwtExpired` ([TokenExpiry.js](../../../src/lob/TokenExpiry.js)) and `onSessionTokenExpired` ([Grant.js](../../../src/redux/actions/Grant.js)) exactly as `AuthenticatedProfileGate` does. Takes `user`/`onSessionTokenExpired` as arguments (not `useSelector`/`useDispatch`) to stay consistent with this codebase's `connect()`-only convention. Each guarded call site wraps its existing dispatch with `if (!ensureValidSession()) return;`.

---

## Progress

- [x] **Task 1** — `src/hooks/useSessionTokenExpiryGuard.js`
- [x] **Task 2** — Unit tests (`src/hooks/__tests__/`): 4/4 passing — proceeds when valid, dispatches + blocks when expired/missing token, handles missing user
- [x] **Task 3** — Direct-token call sites: `AuthenticatedQuickEnrollment.js` (submission effect), `views/auth-views/user/profile/index.js` (both `getOwnKnowMeProfileUrlMap` spots — avatar-hydration effect and `handleSave`)
- [x] **Task 4** — KnowMe group: `KnowMeV1.js`, `KnowMeV2.js`, `KnowMeV3.js` guarded. `TestForm.js` is dead code (not imported anywhere in `src/`) — skipped, no value in guarding unreachable code
- [x] **Task 5** — Shop purchase flow: `views/auth-views/shop-window/index.js` — `handlePurchase` guarded
- [x] **Task 6** — Analytics group: both dashboards' `onHydratingAnalyticsAvatars` effects guarded. `onSubmittingAdminEnrolleeProgress`/`onLoadingFacilitadorDashboardContents`/drill-down/card-order calls deliberately **not** guarded — confirmed course-token-gated, not `innerToken` (same category as Task 8). `onLoadingAllDashboardContents` (genuinely `innerToken`-gated) guarded at its own call site inside `InsightsLandingDashboard.js`'s `handleAdminProgressSubmit`, separately from the course-token call in the same function
- [x] **Task 7** — `GlobalAdminToolsLandingDashboard.js`: all ~41 in-scope action creators (the AdminToolsManager cluster, cross-checked against the audit's course-token/no-token exclusions) wrapped via a single `withSessionGuard` helper applied right after the props destructure — every existing call site elsewhere in the file works unmodified since the wrapped versions shadow the original names. `views/auth-views/user/profile/index.js`'s admin-tools dispatches (`onLoadingContactCertificationHistory`, `onLoadingContactShopPurchaseHistory`, `onUpsertingSelectedContactProfile`) were already covered under Task 3's edits to that file
- [ ] **Task 8** *(optional, lower priority, still deferred)* — Course-token-fallback pair: `TestForm.js` (dead code) / `ProgressDashboardByEmailV4.js` (not yet examined)
- [x] **Task 9** — Frontend TTL: `USER_PROFILE_CACHE_TTL_MINUTES` in `src/configs/EnvironmentConfig.js`, 160 → 300
- [x] **Task 10** — Backend TTL: `GenerateJwtTokenV2Async` in `JwtTokenService.cs` → `AddHours(5)`. `GenerateJwtTokenAsync` (service-account token) left at `AddHours(4)`, confirmed unrelated.
- [x] **Task 11** — See "Verification results" below.

### Verification results

- `npm test` (263 tests) and production `build` both pass clean after every batch of edits — no regressions, no new lint warnings beyond the pre-existing 5 (unrelated files).
- Hook logic verified with real unit tests (mount a harness component, click, assert dispatch/return value) — not mocked at the hook level.
- **Not verified live in a browser**: the actual click-through behavior in each of the 5 guarded flows (enrollment, KnowMe, shop, analytics, admin tools). Same environment blockers as the companion plans (no Playwright/Puppeteer, `react-router-dom@7` unresolvable under this repo's Jest config, real login requires Supabase/SSO credentials unavailable here). Recommend a manual pass per flow before merge: expire a token, stay on the same page, trigger the action, confirm the year-of-birth prompt appears immediately instead of the request silently failing.
- The `.NET` backend change compiles by inspection (single literal changed, `AddHours(4)` → `AddHours(5)`, no signature/behavior change otherwise) but was not built or deployed from this session.

---

## Known limitations / explicitly out of scope

| Item | Why deferred |
|---|---|
| Course-token-fallback pair (Task 8) | `innerToken` is only a fallback there; primary path uses a per-course token, so this is lower urgency |
| Full browser/Playwright verification | Same environment blockers as the companion plans — no Playwright/Puppeteer in this repo, `react-router-dom@7` unresolvable under this repo's Jest config |
| `.NET` build/test/deploy for the `titulino-net-api` change | Outside this session's tooling — verification is on the user's side |

---

## References

- [AuthenticatedProfileGate.js](../../../src/components/layout-components/AuthenticatedProfileGate.js) — existing route/focus expiry checks this extends
- [TokenExpiry.js](../../../src/lob/TokenExpiry.js) — `isJwtExpired`, reused by the new hook
- [redux/actions/Grant.js](../../../src/redux/actions/Grant.js) — `onSessionTokenExpired`, reused by the new hook
- `src/managers/AdminToolsManager.js` — `getTokenFromEmail` helper, the convergence point for ~35 functions
- `C:\Users\AlbertoArellano\source\repos\titulino-net-api\TitulinoNet.Api\Service\JwtTokenService.cs` — `GenerateJwtTokenV2Async`, the actual per-user token issuer
- [2026-07-08-token-expiry-auto-reprompt.md](2026-07-08-token-expiry-auto-reprompt.md) — companion plan (Tasks 10-11 there fixed two bugs this plan's verification depends on)
