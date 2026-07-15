# Shared Contact Filter Panel (Advanced Search + Audience)

**Started:** 2026-07-11
**Branch:** profile-issues
**Repos touched:** titulino-ui only

---

## Goal

Access Management's "Advanced Search" and Messaging's "Audience" tab both filter contacts, both bottom out in the same `AdminToolsManager.getContactSegment`/`buildContactSegmentPayload`, and both start their filter state from the same `getAudienceDefaultFilters()` — but every input is written out twice, in two different visual styles (Advanced Search: one flat ungrouped row; Audience: five titled sectioned cards). Per the user's decision, this isn't just a restyle — Advanced Search gains full feature parity (split Residency/Birth location, engagement signals, dedup) as part of unifying the two onto one shared, reusable component.

---

## Findings (from prior research)

- **State**: two separate `useState`s — `advancedContactFilters` (line 705) and `audienceFilters` (line 757) — both seeded from `getAudienceDefaultFilters()`. Advanced Search currently only *renders* a subset of that shape (combined `locationType`/`countryNameOrId`, no split residency/birth, no engagement/dedup fields), even though the state object already carries those unused fields.
- **Update/reset logic**: `updateAdvancedContactFilter`/`resetAdvancedContactFilters` (1356-1372) and `updateAudienceFilter`/`resetAudienceFilters` (1336-1354) are near-line-for-line duplicates (generic field setter, resets `offset` unless the changed field is `offset`).
- **Apply/data-flow** (deliberately staying separate): Advanced Search calls `AdminToolsManager.getContactSegment` directly, stores results in local state (`advancedContactSearchResult`). Audience goes through the Redux action `onLoadingContactSegment` into the `contactSegment` slice. Only the *filter form*, not this data-flow split, is being unified.
- **JSX**: `renderAdvancedContactSearch` (5366-5645) is one flat `<Row>` with no section headers/tooltips. `renderMessagingFilters` (7304-7725) is five titled `<Card>`s: Search / Gender & Age / Location & Language (Residency row + Birth row + language/level row) / Courses & Engagement (course include/exclude + match-all, then "Engagement Signals" divider, then "Skip already-messaged contacts" divider). Zero shared JSX between them today — full duplication.
- **`renderFilterTooltip`** is duplicated too — once inside `renderMessagingFilters` (7305-7309), once independently inside `renderProcessLogsMonitoring` (7067).
- **Option arrays** (already memoized, just need to be passed as props, not rebuilt): `audienceOptions`, `audienceLanguageOptions`/`audienceLanguageLevelOptions`, `communicationCategoryOptions`, `audienceCourseOptions` (flat, used by Advanced Search today) vs `audienceCourseGroupedOptions` (grouped-by-year, used by Audience), `advancedContactCountryOptions`/`advancedContactRegionOptions` (Advanced Search's single combined set) vs `audienceResidencyCountryOptions`/`audienceBirthCountryOptions`/`audienceResidencyRegionOptions`/`audienceBirthRegionOptions` (Audience's four split sets) — Advanced Search will need to start using the split sets once it gains Residency/Birth fields.

---

## Progress

- [x] **Task 1** — New `src/components/shared-components/ContactFilterPanel/index.js`: extracted the four sectioned Cards (Search / Gender & Age / Location & Language / Courses & Engagement, the last nesting Engagement Signals + Deduplication as sub-sections — matches the actual Card boundaries in the code, not a literal "five") as a controlled, prop-driven component (`filters`, `onFieldChange`, `onResidencyCountryChange`, `onBirthCountryChange`, `onExcludeCategoryChange`, `onApply`, `onReset`, loading props, `options`, `renderCourseTag`, section-visibility props defaulting to all-on, `showPaging` defaulting off). Owns its own `renderFilterTooltip`/location-row rendering internally — not exported separately (see Task 6 note).
- [x] **Task 2** — Added `computeNextContactFilters(filters, fieldName, value)` to `src/lob/AudienceMessaging.js` (LOB test in `src/lob/__tests__/AudienceMessaging.test.js`) and a `useContactFilterState(getDefaultFilters)` hook (`src/hooks/useContactFilterState.js`, tests in `src/hooks/__tests__/`). Both `updateAudienceFilter` and `updateAdvancedContactFilter` in `GlobalAdminToolsLandingDashboard.js` now call the shared pure function instead of duplicating the inline spread. The two components' `useState` declarations were deliberately left as-is rather than switched onto the `useContactFilterState` hook itself — Audience's updater needs the synchronously-computed next-filters value to conditionally trigger `loadAudienceSegment`, which the hook's fire-and-forget `updateField` doesn't expose; forcing that through the hook would have added risk to a working, in-use feature for no behavior change. The hook remains available, tested, and ready for reuse by any future filter panel that doesn't have this constraint.
- [x] **Task 3** — Advanced Search's residency/birth country selects now trigger `loadAdvancedContactCountryDivisions(locationKey, countryNameOrId)`, a single reusable local-state loader (new `advancedContactResidencyDivisions`/`advancedContactBirthDivisions` state pairs) mirroring Audience's existing `loadAudienceCountryDivisions` Redux call. Removed the old combined-`locationType`/`countryNameOrId` local-state effect (dead once Advanced Search moved to split fields) along with the `advancedContactCountryOptions`/`advancedContactRegionOptions` memos it fed. Country *options* (not divisions) are fully shared as-is: `audienceResidencyCountryOptions`/`audienceBirthCountryOptions` don't depend on either filter state, so both panels pass the exact same memoized arrays.
- [x] **Task 4** — `renderMessagingFilters` now renders `<ContactFilterPanel>` wrapped in the existing `Alert` banner; all handlers/options wired through unchanged Redux-backed state (`audienceFilters`, `loadAudienceSegment`, `loadAudienceCountryDivisions`, etc.).
- [x] **Task 5** — `renderAdvancedContactSearch` now renders the same `<ContactFilterPanel>` with `showPaging` on (Advanced Search keeps its limit/offset controls, which Audience's UI never exposed), using grouped-by-year course options (previously flat) and gaining split Residency/Birth, language/level tooltips, engagement signals, and the deduplication section for the first time. Results table below the panel is unchanged.
- [x] **Task 6** — `renderFilterTooltip` now lives once inside `ContactFilterPanel` (used by both Audience and Advanced Search through it) and once inside `renderProcessLogsMonitoring`, which is unrelated to contact filtering and was left untouched — reduced from 2 duplicate copies feeding the same domain down to 1.
- [x] **Task 7** — No new i18n keys needed: every label/tooltip/placeholder key used by `ContactFilterPanel` already existed in all three locales from Audience's original implementation. The one gap fixed: the "Residency"/"Birth" row labels were hardcoded English strings in the original `renderMessagingFilters` (never wrapped in `t()`); the shared component now reuses the pre-existing `admin.tools.messaging.option.residency`/`option.birth` keys (already "Residency"/"Birth" in `en_US.json`) instead, closing that gap in both panels for free.
- [x] **Task 8** — `.claude/support-scripts/run-tests.sh` (286 tests, 11 suites) and `run-build.sh` both pass clean. Removed one real lint warning (`Checkbox` import became unused in `GlobalAdminToolsLandingDashboard.js` once both usages moved into `ContactFilterPanel`); the 4 remaining warnings (`buildMessageVariableRegistryOptions`, `templateCreating`/`setTemplateCreating`, `getCourseDisplayInfo`, one `KnowMeV3.js` hook-deps warning) all pre-date this refactor and are unrelated. **Not verified live in a browser** — same standing environment limitation as the rest of this session's UI work (no Playwright/Puppeteer, admin dashboard needs real SSO login). Recommended manual pass: open Admin Tools → Access Management → Advanced Search and Messaging → Audience side by side, confirm both now render identical sectioned-card styling; in each, set a Residency country and confirm the region dropdown populates and clears correctly on country change; confirm Advanced Search's new engagement-signal and dedup selects filter correctly end-to-end; confirm Audience's existing behavior (apply/reset, course grouping, message-send flow) shows zero regressions.

---

## Known limitations

| Item | Why |
|---|---|
| Results/data-flow (local state vs Redux) not unified | Deliberately out of scope — this refactor only touches the filter *form*, not how results are stored/displayed |
| `useContactFilterState` hook built and tested but not adopted by either call site | Both existing updaters need synchronous access to the computed next-filters value (for conditional reload / country-divisions triggers); the hook's own state setter doesn't expose that. The shared pure `computeNextContactFilters` function *is* adopted by both. The hook stays available for a future filter panel without this constraint. |
| Advanced Search's `getContactSegment` call still bypasses Redux and the `withSessionGuard` token-expiry wrapper | Pre-existing gap noted in the original research, not introduced or widened by this refactor — left out of scope |
| No live browser verification | Same pre-existing environment gap as the rest of this session's UI work |

---

## References

- [ContactFilterPanel/index.js](../../../src/components/shared-components/ContactFilterPanel/index.js) — the new shared component
- [useContactFilterState.js](../../../src/hooks/useContactFilterState.js) — the new shared hook (tested, not yet consumed — see Known limitations)
- [GlobalAdminToolsLandingDashboard.js](../../../src/components/admin-components/Insights/GlobalAdminToolsLandingDashboard.js) — `renderAdvancedContactSearch`, `renderMessagingFilters` now both render `<ContactFilterPanel>`; `loadAdvancedContactCountryDivisions` is the new shared cascade loader for Advanced Search
- [AudienceMessaging.js](../../../src/lob/AudienceMessaging.js) — `getDefaultAudienceFilters`, `computeNextContactFilters`, `buildContactSegmentPayload`
- [DraggableDashboardGrid](../../../src/components/shared-components/DraggableDashboardGrid/index.js) — folder-with-index.js convention this new component follows
