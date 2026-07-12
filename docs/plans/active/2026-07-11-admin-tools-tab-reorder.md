# Admin Tools: Reorderable Outer Tabs

**Started:** 2026-07-11
**Branch:** profile-issues
**Repos touched:** titulino-ui only

---

## Goal

Let each admin arrange the Admin Tools outer tabs (Access Management / Contact Stewardship / Course Management / Revenue / Messaging / Monitoring) in whatever order works best for them, persisted per-admin the same way dashboard card order already is (local cache + synced to the backend preferences bucket).

---

## Key findings

- The dashboard-card reorder (`DraggableDashboardGrid`) has **no lock/edit-mode** — dragging is always live, saves on every drop. The outer tabs, however, render through antd `Card`'s built-in `tabList`/`activeTabKey`/`onTabChange` ([GlobalAdminToolsLandingDashboard.js:9975-9999](../../../src/components/admin-components/Insights/GlobalAdminToolsLandingDashboard.js#L9975-L9999)), which doesn't expose per-tab drag handles — so "always-draggable tabs" isn't a clean fit here, and mixing click-to-navigate with drag-to-reorder on the same live control risks mis-clicks.
- **Decision**: explicit "Reorder tabs" edit mode instead. While active, swap the normal tab bar for `DraggableDashboardGrid` (reused as-is — it's generic, just needs `{key, content}` cards) rendering the 6 tabs as draggable pills; a "Done" button exits and saves (this is the lock step).
- Persistence fully reuses existing infrastructure: `DashboardLayout.getDashboardCardOrderCacheKey`/`normalizeDashboardCardOrder` ([DashboardLayout.js](../../../src/lob/DashboardLayout.js)) already caches under a `DashboardCardOrder_<key>_<email>_<course>` key, already registered in `WebsitePreferences.js`'s `PREFERENCE_KEY_PREFIXES` — so it automatically rides the debounced sync to the backend bucket built earlier this session. No new persistence mechanism needed, just new Manager/action functions with names that fit this feature (rather than reusing `AnalyticsManager`'s card-order pair, a different domain).
- `normalizeDashboardCardOrder` already has LOB test coverage (`DashboardLayout.test.js`) and already handles stale/added tab keys gracefully — reused as-is, no new LOB tests needed for that part.

---

## Progress

- [x] **Task 1** — `AdminToolsManager.js`: added `getAdminToolsTabOrder`/`saveAdminToolsTabOrder`, delegating to `DashboardLayout`/`LocalStorageService` (mirrors `AnalyticsManager`'s card-order pair, `courseCodeId` passed as `null` since tabs aren't course-scoped)
- [x] **Task 2** — `redux/actions/AdminTools.js`: `onLoadingAdminToolsTabOrder`/`onSavingAdminToolsTabOrder`, plus `ON_LOADING_ADMIN_TOOLS_TAB_ORDER`/`ON_SAVING_ADMIN_TOOLS_TAB_ORDER` constants and a reducer case in `redux/reducers/AdminTools.js` (`adminToolsTabOrders` keyed by dashboardKey) — full Redux round-trip, matching the Analytics card-order precedent exactly rather than shortcutting to local-only state
- [x] **Task 3** — `GlobalAdminToolsLandingDashboard.js`: loads the saved order once `user.emailId` is available (guarded by the existing `useSessionTokenExpiryGuard` wrapper, same as every other AdminToolsManager-cluster call in this file); reconciles against `DEFAULT_OUTER_TAB_ORDER` with the same known-keys-then-leftovers logic `DraggableDashboardGrid` uses internally
- [x] **Task 4** — "Reorder tabs" toggle in the tab bar's `tabBarExtraContent`; while active, the whole tab `Card` swaps to a reorder `Card` rendering the 6 tabs via `DraggableDashboardGrid` (reused, not rebuilt)
- [x] **Task 5** — "Done" button exits edit mode and calls `onSavingAdminToolsTabOrder`; "Reset to default" resets local state (not persisted until Done is pressed)
- [x] **Task 6** — i18n keys added to all 3 locales: `admin.tools.reorderTabs.{toggle,title,reset,done}`
- [x] **Task 7** — See "Verification results" below

### Verification results

- `npm test` (277 tests) and production build both pass clean — no regressions, no new lint warnings beyond the same 5 pre-existing ones.
- **Not verified live in a browser**: the actual drag interaction, the tab bar swap, and confirming the order survives a refresh / round-trips through the backend bucket. Same environment limitation as the rest of this session's UI work (no Playwright/Puppeteer, admin dashboard needs real login). Recommend a manual pass: open Admin Tools, click "Reorder tabs", drag to a new order, click "Done", refresh the page, confirm the new order persists.

---

## Known limitations

| Item | Why |
|---|---|
| Scoped to outer tabs only | Inner tab groups (Monitoring, Revenue, etc.) aren't touched — same mechanism could extend to them later with no new infrastructure, if wanted |
| No live browser verification | Same pre-existing environment gap as the rest of this session's UI work |

---

## References

- [DraggableDashboardGrid/index.js](../../../src/components/shared-components/DraggableDashboardGrid/index.js) — reused as-is for the edit-mode tab list
- [DashboardLayout.js](../../../src/lob/DashboardLayout.js) — cache-key + order-normalization helpers, reused
- [AnalyticsManager.js](../../../src/managers/AnalyticsManager.js) lines 532-550 — the sibling card-order pattern this mirrors
- [GlobalAdminToolsLandingDashboard.js:9975-9999](../../../src/components/admin-components/Insights/GlobalAdminToolsLandingDashboard.js#L9975-L9999) — current outer tab rendering
- [WebsitePreferences.js](../../../src/lob/WebsitePreferences.js) — `PREFERENCE_KEY_PREFIXES` already includes `DashboardCardOrder_`
