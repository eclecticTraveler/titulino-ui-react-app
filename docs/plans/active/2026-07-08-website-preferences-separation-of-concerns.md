# WebsitePreferences: Separation of Concerns + Impersonation Reliability

**Started:** 2026-07-08
**Branch:** profile-issues
**Repos touched:** titulino-ui only

---

## Goal

`src/lob/WebsitePreferences.js` is meant to be a "bucket" so a user's saved settings (native language, course language, theme, nav layout, dashboard card order — and future personalization) survive a busted local cache, and so that admin impersonation shows the **impersonated user's own** saved settings rather than the admin's. The mechanism mostly works, but:

1. It violates this project's own layering rules (LOB = pure, no HTTP/timers/side effects; components go through Redux actions, not services/LOB directly) — it's called straight from a view component and owns HTTP calls, a debounce timer, and mutable module state.
2. That mutable module state creates a real bug: a pending debounced save reads its target token/storage **at fire time, not schedule time**. If an admin edits a preference and then starts impersonating before the 1.8s debounce fires, the pending save silently redirects to the impersonated context instead — the admin's edit is dropped, never saved.
3. Restoring from the backend "bucket" only ever runs once per browser tab per identity (a `useRef` dedup keyed on `contactInternalId`/`emailId` + impersonation flag) — it can't be re-triggered by an explicit event like our new token-expiry reset or an impersonation switch, and a transient fetch failure during restore is indistinguishable from "nothing was ever saved."

---

## Progress

- [x] **Task 1** — Trim `src/lob/WebsitePreferences.js` down to pure functions only: `isWebsitePreferenceStorageKey`, `buildWebsitePreferencesBackup(entries)`, `normalizePreferenceEntries`, `selectApplicableEntries` (replaces the impure parts of `applyWebsitePreferencesBackup`). No `window`, no `fetch`, no `setTimeout`, no `console.log`, no module-level mutable state.
- [x] **Task 2** — New `src/managers/WebsitePreferencesManager.js`: owns the orchestration moved out of the LOB file — the debounce timer, actual `localStorage`/`sessionStorage` reads/writes, calling the trimmed LOB functions + `TitulinoLrnNetService.getWebsitePreferences`/`putWebsitePreferences`. Current sync target is one explicit `{ token, storage, readOnly }` object (`syncContext`), swapped only via `switchSyncContext`.
- [x] **Task 3** — Fixed via `switchSyncContext`'s internal `flushPendingSave()`, called before every context swap. Turned out **not** to need separate wiring into `ImpersonationSession` or the token-expiry action directly — `views/index.js`'s existing hydration effect already re-runs on any `user.innerToken`/identity change (impersonation start/stop, and the other plan's `ON_SESSION_TOKEN_EXPIRED` reset both change `innerToken`), so routing that effect through `restoreWebsitePreferences` → `switchSyncContext` covers all three context-switch events through one hook, no per-event wiring needed.
- [x] **Task 4** — `restoreWebsitePreferences` retries once via `fetchWebsitePreferencesWithRetry` on any `!result.success`, only marks the identity as "handled" (`restoredIdentityKey`) after a confirmed `exists:false` or a successful apply — a fetch that fails twice leaves it untouched so the next context-change event retries.
- [x] **Task 5** — Restore dedup (`restoredIdentityKey`) now lives in the manager, keyed the same way as before, plus a `force` param for explicit re-trigger (not currently invoked by any caller — no concrete "bust the cache mid-session" trigger exists yet, but the capability is there for one).
- [x] **Task 6** — `src/redux/constants/Preferences.js` + `src/redux/actions/Preferences.js` (`onSyncingWebsitePreferences`) wraps `WebsitePreferencesManager.restoreWebsitePreferences`.
- [x] **Task 7** — `views/index.js` no longer imports `lob/WebsitePreferences`; the hydration effect now calls `onSyncingWebsitePreferences(...)` (dispatched), and the now-unused `preferencesHydrationKey` ref + `useRef` import were removed. The `!isImpersonating && exists !== true` initial-backup behavior moved into the manager as `skipInitialBackup` (passed as `isImpersonating` from the view).
- [x] **Task 8** — [WebsitePreferences.test.js](../../../src/lob/__tests__/WebsitePreferences.test.js) — 13 tests, key allow-listing, backup building (including the byte-size and null/undefined drop cases), both normalize-entry shapes, entry selection.
- [x] **Task 9** — see "Verification results" below.

### Verification results

- `npm test` (full suite, 259 tests) and production `build` both pass clean.
- [WebsitePreferencesManager.test.js](../../../src/managers/__tests__/WebsitePreferencesManager.test.js) — new permanent regression suite (HTTP boundary mocked via `TitulinoLrnNetService`, everything else real):
  - Reproduces the exact bug this plan fixes: admin edits a preference, schedules a debounced save, starts impersonating before it fires — confirms the admin's edit is flushed under the admin's own token/storage before the switch, and no data is misattributed to the impersonated token.
  - Confirms one retry on a transient fetch failure before an apply.
  - Confirms same-identity token refresh (the token-expiry scenario) skips re-fetching (won't clobber local edits) but still re-arms the sync target under the new token.
- **Not verified live in a browser**: impersonation actually loading the target contact's theme/language into `sessionStorage` end-to-end, and the admin's own `localStorage` prefs being unaffected after stopping impersonation. Same environment blockers as the companion plan (no Playwright/Puppeteer in this repo, `react-router-dom@7` unresolvable under this repo's Jest config, real SSO/impersonation login not available here). Recommend a manual pass before merge, per the scenarios originally listed for Task 9.

---

## Known limitations / explicitly out of scope

| Item | Why deferred |
|---|---|
| Full removal of module-level state in the manager | An explicit context object is a big improvement over four scattered singletons, but a fully stateless design (context threaded through every call) is a larger rewrite than this fix needs |
| `LocalStorageService` (Service) imports `WebsitePreferencesManager` (Manager) for `isApplyingWebsitePreferences`/`scheduleWebsitePreferencesBackup` | Backwards from the canonical `Action → Manager → Service` direction. Accepted as a narrow, deliberate exception: `LocalStorageService` is a low-level shared utility called from many places to write any preference-tagged key, and routing every one of those writes through Redux would be a much larger change than this fix warrants. Worth revisiting if more cross-cutting concerns accumulate here. |
| Cross-tab sync (two tabs, same user, different preference edits) | Not reported as a problem; out of scope until it is |
| Expanding stored preference keys for future personalization features | This plan only fixes the mechanism; new preference types are a separate, later task once the plumbing is solid |

---

## References

- [WebsitePreferences.js](../../../src/lob/WebsitePreferences.js) — current implementation to split
- [TitulinoLrnNetService.js](../../../src/services/Lrn/TitulinoLrnNetService.js) lines 26-110 — `getWebsitePreferences`/`putWebsitePreferences`, already correct (HTTP-only, returns status + safe defaults)
- [views/index.js](../../../src/views/index.js) lines 108-181 — current hydration effect, `preferencesHydrationKey` ref dedup, direct LOB import at line 22
- [ImpersonationSession.js](../../../src/lob/ImpersonationSession.js) — `setActiveImpersonationProfile`/`clearActiveImpersonationProfile`, where the context-flush hook needs to attach
- [LocalStorageService.js](../../../src/services/LocalStorageService.js) lines 28-42 — `getPreferenceAwareStorage`/`schedulePreferenceBackup`, routes preference keys to session vs local storage during impersonation
- [2026-07-08-token-expiry-auto-reprompt.md](2026-07-08-token-expiry-auto-reprompt.md) — companion plan; its `ON_SESSION_TOKEN_EXPIRED` action is one of the context-switch events this plan's flush logic needs to handle
