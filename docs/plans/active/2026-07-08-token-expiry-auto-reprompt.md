# Auto-Reprompt Year of Birth on Token Expiry

**Started:** 2026-07-08
**Branch:** profile-issues
**Repos touched:** titulino-ui only (no backend/cross-repo changes)

---

## Goal

`AuthenticatedProfileGate` decides whether to show the year-of-birth form purely from `!user?.yearOfBirth` in Redux — it has no idea whether `user.innerToken` (the titulino-net-api JWT, ~160-min TTL) is still valid. Once the token expires mid-session, the app keeps silently using it (empty/failed data, e.g. messages not pulling) until the user manually refreshes the page, which is the only thing that re-hydrates state from the (by-then-expired) cache and correctly shows the form again.

Decided scope (per conversation): re-prompting as often as needed is fine — the only real problem is that it doesn't happen **automatically**. No silent background token refresh, no `yearOfBirth`/token cache-splitting, no backend logging-flag changes. Pure frontend fix: detect an expired token and reactively clear session state so the existing gate logic shows the form on its own.

---

## Progress

- [x] **Task 1** — `src/lob/TokenExpiry.js`: pure `isJwtExpired(token)` — decodes JWT payload, compares `exp * 1000` to now; returns `true` on missing/malformed token (fail-closed)
- [x] **Task 2** — `src/lob/__tests__/TokenExpiry.test.js`: valid/expired/malformed/null cases — 6/6 passing
- [x] **Task 3** — `src/redux/constants/Grant.js`: add `ON_SESSION_TOKEN_EXPIRED`
- [x] **Task 4** — `src/redux/actions/Grant.js`: add `onSessionTokenExpired(emailId)` — removes `UserProfile_{emailId}` and `auth_inner_token` from storage, returns the new action type
- [x] **Task 5** — `src/services/LocalStorageService.js`: add `removeCachedObject(key)` (immediate `localStorage.removeItem`, doesn't wait for natural TTL cleanup on next read)
- [x] **Task 6** — `src/redux/reducers/Grant.js`: handle `ON_SESSION_TOKEN_EXPIRED` — reset `user` to a cleared state (`yearOfBirth: null`, `innerToken: null`, etc.), same shape as `ON_STOPPING_IMPERSONATION_PROFILE`
- [x] **Task 7** — `src/components/layout-components/AuthenticatedProfileGate.js`:
  - add `mapDispatchToProps` for `onSessionTokenExpired`
  - effect keyed on `[pathname, search, user?.innerToken]` (already reactive to route via `useLocation()`) — if token present, not impersonating, not on a bypass path, and `isJwtExpired(user.innerToken)`, dispatch the clear action. This covers **in-app navigation into a view with a stale token** (the exact "went back to messages" case), no per-feature wiring needed.
  - second effect (mount-once) adding `visibilitychange`/`focus` listeners running the same check — covers **leaving the tab/app and coming back** without necessarily navigating
- [x] **Task 8** — Verification (see "Verification results" below for what was and wasn't actually exercised)
- [ ] **Task 9** — Coordinate with [2026-07-08-website-preferences-separation-of-concerns.md](2026-07-08-website-preferences-separation-of-concerns.md): once that plan's Manager exists, `onSessionTokenExpired` should trigger a preferences context flush/reset the same way impersonation start/stop will — see that plan's Task 3
- [x] **Task 10** — Bug fix: `ON_SESSION_TOKEN_EXPIRED` reducer case was spreading `emptyUser`, which also nulled `emailId` — since `shouldRequestProfile` requires `user?.emailId` and `EmailYearSearchForm` has no email input (it only ever reads `user.emailId`), this silently broke the entire re-prompt: the form could never render, and there was no rescue path since the cache backing the one auto-recovery effect (`onLoadingAuthenticatedLandingPage`) had just been deleted by the same action. Fixed to only null `yearOfBirth`/`innerToken`, preserving identity fields.
- [x] **Task 11** — Bug fix: `/lrn/enroll` and `/lrn-auth/enroll` are in `PROFILE_GATE_BYPASS_PATHS` so a brand-new enrollee (no `contactId` yet) isn't blocked — but this meant a **returning, already-known user** (has `contactId`) landing on `/lrn-auth/enroll` with a dead token got the same free pass, silently behaving like the anonymous enrollment flow instead of re-prompting. Added `isGateBypassed(pathname, user)`: on enroll paths specifically, bypass only when `!user?.contactId`; every other bypass path (`/login`, `/logout`, `/signup`, etc.) is unaffected.

### Verification results

- `npm test` (full suite, 243 tests) and production `build` both pass clean — no regressions, no new lint errors.
- Confirmed with real modules (reducer + `LocalStorageService`, no mocks): `removeCachedObject` clears the cached profile immediately, and the `grant` reducer's `ON_SESSION_TOKEN_EXPIRED` case resets `yearOfBirth`/`innerToken` to `null` from a populated state.
- **Not verified**: the actual `AuthenticatedProfileGate` component behavior (route-change effect, visibility/focus effect, gate re-render) in a real render tree or live browser. Blocked by two pre-existing environment issues, neither introduced by this change:
  - `react-router-dom@7.13.1`'s conditional package exports aren't resolvable under this repo's Jest/jsdom config (no test in the repo renders a router-connected component today — this would be new Jest infra, not a quick fix)
  - Importing the real `redux/actions/Grant.js` transitively pulls in `antd`'s date-picker locale, which fails to resolve `@rc-component/picker/locale/en_US` in this `node_modules` install (pre-existing, unrelated to this change)
- Recommend a manual pass in a running browser before merge: log in, let the token go stale (or temporarily lower `USER_PROFILE_CACHE_TTL_MINUTES`), navigate to a token-gated view without refreshing, confirm the form reappears immediately and `postLoginRedirect` returns to the right page after resubmission; then repeat leaving the tab and switching back instead of navigating.

---

## Architecture notes

### Why the gate effect, not per-manager guards

Five managers (`LrnManager`, `AdminToolsManager`, `ShopManager`, `GrantManager`, `AnalyticsManager`) read `user.innerToken` for their own API calls. Wrapping each call site individually would mean touching every Redux action that uses any of them. `AuthenticatedProfileGate` already sits above `children` and already re-renders on every route change via `useLocation()` — piggybacking the expiry check there catches the failure at the one place all authenticated views funnel through, with no per-feature changes.

### Flow after this fix

```
Route change or tab refocus
    ↓
AuthenticatedProfileGate effect: isJwtExpired(user.innerToken)?
    ↓ yes
dispatch(onSessionTokenExpired(user.emailId))
    → removes UserProfile_{emailId} + auth_inner_token from localStorage
    → reducer resets user.yearOfBirth / user.innerToken to null
    ↓
shouldRequestProfile recomputes → true
    ↓
EmailYearSearchForm renders immediately (no refresh needed)
    postLoginRedirect already set → returns to the same page after resubmission
```

---

## Known limitations / explicitly out of scope

| Item | Why deferred |
|---|---|
| Silent background token refresh (using known `yearOfBirth` + valid Supabase session) | User confirmed repeated prompting is acceptable; silent refresh was previously attempted (`SupabaseAuthService.refreshInternalTokenIfValidSupabase`, now commented out in `views/index.js`) and caused issues — revisit separately if prompting frequency becomes a real complaint |
| Splitting `yearOfBirth` out of the TTL'd `UserProfile_{emailId}` cache bundle | Only needed to support silent refresh; not needed for a visible re-prompt fix |
| Backend flag to distinguish silent vs. user-initiated DOB submission (titulino-net-api) | Only needed if silent refresh is built later |
| Guarding in-progress interactive work from mid-session token invalidation | No interactive multi-step flows exist yet; revisit when one is built |
| Periodic polling (`setInterval`) while idle on the same route with no tab-switch | Not covered by route-change or focus triggers; considered low-value edge case for now, can add a low-frequency interval later if it turns out to matter |
| `WebsitePreferences` separation-of-concerns + debounce-race fix | Real, but separate, scope — tracked in its own plan: [2026-07-08-website-preferences-separation-of-concerns.md](2026-07-08-website-preferences-separation-of-concerns.md) |

---

## References

- [AuthenticatedProfileGate.js](../../../src/components/layout-components/AuthenticatedProfileGate.js) — the gate itself, `shouldRequestProfile` logic
- [EmailYearSearchForm.js](../../../src/components/layout-components/EmailYearSearchForm.js) — the form rendered by the gate
- [redux/reducers/Grant.js](../../../src/redux/reducers/Grant.js) — `emptyUser`, existing `ON_STOPPING_IMPERSONATION_PROFILE` reset pattern to mirror
- [redux/actions/Grant.js](../../../src/redux/actions/Grant.js) — existing action creators pattern
- [services/LocalStorageService.js](../../../src/services/LocalStorageService.js) — `getCachedObject`/`setCachedObject`, needs `removeCachedObject`
- [services/SupabaseAuthService.js](../../../src/services/SupabaseAuthService.js) line 40 — existing `isInternalTokenExpired` JWT-decode pattern to mirror in the new LOB helper
- [configs/EnvironmentConfig.js](../../../src/configs/EnvironmentConfig.js) line 13 — `USER_PROFILE_CACHE_TTL_MINUTES: 160`
