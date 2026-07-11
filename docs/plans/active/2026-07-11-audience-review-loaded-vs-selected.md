# Audience Review Tab: Split Loaded vs Selected Summaries

**Started:** 2026-07-11
**Branch:** profile-issues
**Repos touched:** titulino-ui only

---

## Goal

The Mensageria "Revision" tab's gender/residency/language-level breakdowns are computed only from the currently **loaded** batch of audience rows, but sit next to a "Filas Seleccionadas" (selected rows) tile — making it look like the breakdowns might reflect the selection, when they never do. Split into two parallel cards (Cargados / Seleccionados) so it's unambiguous which dataset each breakdown describes, with the backend enrollee total shown once above both.

Confirmed with the user: when 0 rows are selected, the Seleccionados card should just show the same structure with empty/zero breakdowns (reusing the same render path) rather than a separate empty-state message — no special-casing needed.

---

## Progress

- [ ] **Task 1** — `src/lob/AudienceMessaging.js`: extend `buildAudienceSummary(rows, selectedRows)` — factor the existing gender/residency/language-level counting logic into an internal helper, run it once over `rows` (existing fields, unchanged) and once over `selectedRows` (new fields: `selectedGenderCounts`, `selectedResidencyCounts`, `selectedResidencyCountryAlpha3ByName`, `selectedLanguageLevelCounts`). Purely additive — no existing field renamed or removed.
- [ ] **Task 2** — LOB tests: `buildAudienceSummary` has zero existing coverage. Add a `describe` block: loaded-only counts (regression baseline matching current behavior), selected-subset counts with a distinct sample, empty-`selectedRows` case (empty objects, not throwing), `totalEmails` vs `selectedEmails` distinction.
- [ ] **Task 3** — i18n: add `admin.tools.messaging.loadedSection.title` and `admin.tools.messaging.selectedSection.title` to `en_US.json`, `es_US.json`, `pt_BR.json`. Existing `genderSnapshot`/`residencySnapshot`/`languageLevelSnapshot` keys get reused inside both cards, no duplication needed.
- [ ] **Task 4** — `GlobalAdminToolsLandingDashboard.js`: extract a reusable card-renderer (title, row count, email count, the three breakdown sections) out of the current `renderAudienceVisualization` (~lines 7826–7878).
- [ ] **Task 5** — Wire it up: one backend-count tile on top; the extracted renderer called twice side by side (`Col xs={24} md={12}`) — Cargados fed from `totalRows`/`totalEmails`/`genderCounts`/`residencyCounts`/`languageLevelCounts`, Seleccionados fed from `selectedRows`/`selectedEmails`/`selectedGenderCounts`/`selectedResidencyCounts`/`selectedLanguageLevelCounts`. Remove the now-redundant standalone "Filas Cargadas"/"Filas Seleccionadas"/"Correos" tiles — their numbers move into each card's own header.
- [ ] **Task 6** — Verification: `npm test` + production build clean; manual pass in a running browser (load audience rows, select a subset, confirm both cards show correct/independent breakdowns) since this repo has no automated browser testing available (established limitation from the token-expiry work this session).

---

## Known limitations

| Item | Why |
|---|---|
| No automated browser verification | Same pre-existing gap noted in this session's other plans — no Playwright/Puppeteer in this repo. Manual pass required for Task 6. |
| Residency/language-level lists still capped at top 12 per card | Matches existing behavior (`sort desc, slice(0, 12)`); not something this change is meant to revisit. |

---

## References

- [GlobalAdminToolsLandingDashboard.js](../../../src/components/admin-components/Insights/GlobalAdminToolsLandingDashboard.js) lines 7826–7950 — `renderAudienceVisualization`/`renderAudienceReview`, `audienceSummary` useMemo at lines 2951–2954, `selectedAudienceRows` state at lines 717–718
- [AudienceMessaging.js](../../../src/lob/AudienceMessaging.js) lines 738–777 — `buildAudienceSummary`
- [AudienceMessaging.test.js](../../../src/lob/__tests__/AudienceMessaging.test.js) — existing test file, no coverage yet for `buildAudienceSummary`
- `src/lang/locales/{en_US,es_US,pt_BR}.json` — messaging i18n block, ~lines 592–609 in each
