# Testing Progress — Titulino UI React App

This file is the domain-specific tracker for the Jest test suite. Update it when a batch status changes.

> **Daily work logs** are in [`docs/work-logs/`](../work-logs/) — one file per day, all domains.
> See [`docs/agents/README.md`](../agents/README.md) for documentation conventions.

**Legend:** ✅ Done · 🔄 In progress · ⬜ Not started

---

## Overview

We are building a unit test suite starting at the lowest, most stable layer (LOB pure functions) and working upward toward Redux and managers. We do not test REST service calls.

Test files live co-located with the source code under `__tests__/` folders inside each layer:

```
src/
  lob/__tests__/        ← Batches 1–5
  redux/reducers/__tests__/   ← Batch 6
  managers/__tests__/         ← Batch 7
```

---

## Batch 1 — Simple pure LOB (no external dependencies) 🔄

Target folder: `src/lob/__tests__/`

| Test file | Source file | Status |
|---|---|---|
| `AdminTools.test.js` | `lob/AdminTools.js` | ✅ Done |
| `DashboardLayout.test.js` | `lob/DashboardLayout.js` | ✅ Done |
| `ShopPurchaseExperience.test.js` | `lob/ShopPurchaseExperience.js` | ✅ Done |
| `LrnConfiguration.test.js` | `lob/LrnConfiguration.js` | ✅ Done |
| `CourseRegistrationCatalog.test.js` | `lob/CourseRegistrationCatalog.js` | ✅ Done |

---

## Batch 2 — LOB with storage / policy logic ⬜

Target folder: `src/lob/__tests__/`

| Test file | Source file | Notes |
|---|---|---|
| `ImpersonationSession.test.js` | `lob/ImpersonationSession.js` | Needs localStorage/sessionStorage mock |
| `WebsitePreferences.test.js` | `lob/WebsitePreferences.js` | Needs localStorage mock |
| `AccessManagementPolicy.test.js` | `lob/AccessManagementPolicy.js` | Policy evaluation, role priority rules |
| `FacilitadorDashboard.test.js` | `lob/FacilitadorDashboard.js` | Similar to DashboardLayout |

---

## Batch 3 — Aggregation and timeline LOB ⬜

Target folder: `src/lob/__tests__/`

| Test file | Source file | Notes |
|---|---|---|
| `StudentProgress.test.js` | `lob/StudentProgress.js` | Percentage calculations, category counts |
| `LoginFootprint.test.js` | `lob/LoginFootprint.js` | Date bucketing, hourly heatmap, trend |
| `ProcessLogs.test.js` | `lob/ProcessLogs.js` | Row normalization, multi-field filter |
| `KnowMeProfiles.test.js` | `lob/KnowMeProfiles.js` | Async, URL map building, set diff |

---

## Batch 4 — Table model and profile patch LOB ⬜

Target folder: `src/lob/__tests__/`

| Test file | Source file | Notes |
|---|---|---|
| `ContactProfileEditor.test.js` | `lob/ContactProfileEditor.js` | Immutability, deep merge, patch audit |
| `ContactProfilesMonitoring.test.js` | `lob/ContactProfilesMonitoring.js` | Table model, full-text filter |
| `ContactStewardship.test.js` | `lob/ContactStewardship.js` | Merge normalization, success detection |
| `AudienceMessaging.test.js` | `lob/AudienceMessaging.js` | Segment payload, options builders |

---

## Batch 5 — Large analytics LOB ⬜

Target folder: `src/lob/__tests__/`

| Test file | Source file | Notes |
|---|---|---|
| `AdminInsights.test.js` | `lob/AdminInsights.js` | Many converters, split into describe blocks |
| `ShopAnalytics.test.js` | `lob/ShopAnalytics.js` | Multiple table builders, row normalizers |

---

## Batch 6 — Redux reducers ⬜

Target folder: `src/redux/reducers/__tests__/`

| Test file | Source file | Notes |
|---|---|---|
| `Auth.test.js` | `redux/reducers/Auth.js` | 9 action cases |
| `Shop.test.js` | `redux/reducers/Shop.js` | 3 action cases |
| `Theme.test.js` | `redux/reducers/Theme.js` | 12 action cases |
| `Lrn.test.js` | `redux/reducers/Lrn.js` | 41+ action cases — largest reducer |
| `Analytics.test.js` | `redux/reducers/Analytics.js` | TBD |
| `AdminTools.test.js` | `redux/reducers/AdminTools.js` | TBD |
| `Grant.test.js` | `redux/reducers/Grant.js` | TBD |

---

## Batch 7 — Managers (service mocking) ⬜

Target folder: `src/managers/__tests__/`

| Test file | Source file | Notes |
|---|---|---|
| `ShopManager.test.js` | `managers/ShopManager.js` | jest.mock all services |
| `AnalyticsManager.test.js` | `managers/AnalyticsManager.js` | jest.mock all services |

---

## How to run tests

```bash
npm test                        # watch mode
npm test -- --watchAll=false    # single run
npm test -- --coverage          # with coverage report
npm test -- AdminTools          # run one file by name match
```
