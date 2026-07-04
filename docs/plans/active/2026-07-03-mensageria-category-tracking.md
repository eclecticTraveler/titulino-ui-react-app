# Mensageria Category & Communication Tracking Improvements

**Started:** 2026-07-03  
**Branch:** feature/know-me-ai-review  
**Repos touched:** titulino-warehouse, titulino-communication, titulino-net-api, titulino-ui

---

## Goal

Enable admins to label audience blasts with a meaningful communication category instead of always storing `na`. Add a History tab showing who was sent messages and when, an "exclude already sent" audience filter for reminders, and a category manager so new categories can be added without code deploys.

---

## Progress

- [x] **Task 1** — Sqitch: reconcile `Missive.CommunicationCategory` table (fix ID alignment, add `display_name` + `is_active`)
- [x] **Task 2** — Sqitch: RPC `GetCommunicationCategories` (inner function + wrapper)
- [x] **Task 3** — Sqitch: RPC `GetCommunicationTrackingHistory` (inner function + wrapper, paginated, joins category name)
- [x] **Task 4** — Sqitch: extend `GetContactSegment` with `p_exclude_category_id` + `p_exclude_course_code_id`
- [x] **Task 5** — TitulinoMissive: add `int? CategoryId` + `string? CourseCodeId` to `AudienceMessageQueueItem`
- [x] **Task 6** — TitulinoMissive: map `SentAt` + `TrackingId` in C# model + interface; mirror to titulino-net-api + TitulinoWorkerService
- [x] **Task 7** — TitulinoMissive: `MessageManager.SendAudienceMessagesAsync` reads `CategoryId` from queue item (falls back to `na`)
- [x] **Task 8** — titulino-net-api: extend `POST /v1/admin/messaging/audience/send` DTO with `int? CategoryId`
- [x] **Task 9** — UI services: `getCommunicationCategories()`, `getCommunicationTrackingHistory()`, extend `getContactSegment()`
- [x] **Task 10** — UI Redux + Manager: `onLoadCommunicationCategories`, `onLoadCommunicationTrackingHistory`
- [x] **Task 11** — UI LOB: `buildCommunicationTrackingHistoryTableModel()` in `AudienceMessaging.js`
- [x] **Task 12** — UI Mensageria compose: category `<Select>` (required before send) + 400/day `<Alert>` banner
- [x] **Task 13** — UI Audience tab: "Exclude already sent" toggle with category + courseCodeId selectors
- [x] **Task 14** — UI History tab: new Mensageria tab (after Certifications), paginated tracking grid
- [x] **Task 15** — UI Category manager: `+ Manage` modal for creating/deactivating categories
- [x] **Task 16** — UI i18n: EN + PT keys for all new labels

---

## Architecture notes

### Full flow after this plan

```
Admin picks category in Mensageria compose
    ↓
buildAudienceMessagePayload() includes categoryId
    ↓
POST /v1/admin/messaging/audience/send { ..., categoryId }   (titulino-net-api)
    ↓
AudienceMessageQueueItem { ..., CategoryId }  →  Redis audienceMessageRequests
    ↓
TitulinoMissive SendAudienceMessagesAsync()
    reads CategoryId from queue item (fallback: na)
    ↓
ProcessReportsWithTrackings(category: <real value>)
    ↓
CommunicationTracking row: WasSentSuccessful, SentAt (DB default), real CategoryId
```

### DB — `Missive.CommunicationCategory` after Task 1

| CommunicationCategoryId | CommunicationCategoryName | display_name | is_active |
|---|---|---|---|
| 0 | error | Error | true |
| 1 | welcome | Welcome | true |
| 2–13 | week1–week12 | Week 1–Week 12 | true |
| 14 | invitation1 | Invitation (1st) | true |
| 15 | invitation2 | Invitation (2nd) | true |
| 16 | unavailable | Unavailable | true |
| 17 | birthday | Birthday | true |
| 18 | afterPurchaseTierAccess | After Purchase | true |
| 19 | na | General / Unclassified | true |
| 20 | specialInvitation | Special Invitation | true |
| 21 | christmas2026 | Christmas 2026 | true |
| 22 | semiotics2 | Semiotics 2 | true |

> IDs **must** match C# enum ordinals. Enum is append-only — never renumber.

---

## Known limitations

| Limitation | Detail |
|---|---|
| titulino-warehouse empty | Sqitch project not yet initialized in `C:\Users\AlbertoArellano\source\repos\titulino-warehouse\`. Tasks 1–4 blocked until initialized or migrations written directly. |
| Historical tracking data has no SentAt in C# | `SentAt` exists in DB (likely `DEFAULT now()`), but C# never sets it explicitly. Task 6 fixes this going forward. |
| Enum must stay append-only forever | C# enum ordinals = DB category IDs. Reordering destroys historical data. |
| Remaining filter is success-only | Excludes contacts with `WasSentSuccessful = true`. Failed sends still appear as "remaining" — intentional (they should be retried). |
| 400/day banner is display-only | Enforcement is at Gmail/Yahoo provider level. App cannot block sends that exceed the limit. |
| net-api deploy before UI deploy | If UI ships before Task 8, `categoryId` is silently dropped at the queue boundary and falls back to `na`. |
| `Models` is triplicated | `ICommunicationTracking` + `CommunicationTracking.cs` changes in Task 6 must be mirrored to titulino-net-api and TitulinoWorkerService. |

---

## New capabilities

- Admins can label blast by intent (reminder, invitation, special event, etc.)
- History tab shows full send log with success/fail per contact
- Audience "remaining" filter shows who hasn't been reached under a given category + course
- New categories added via DB row — no code deploy needed
- Export tracking history for compliance / follow-up

---

## References

- [communication-tracking.md](../../titulino-communication/communication-tracking.md) *(in titulino-docs)*
- [mensageria-feature.md](../../titulino-ui/mensageria-feature.md) *(in titulino-docs)*
- `TitulinoMissive/Service/MessageManager.cs` line 779 — hardcoded `na`
- `TitulinoMissive/DTOs/AudienceMessageQueueItem.cs` — missing `CategoryId`
- `Models/Missive/CommunicationTracking.cs` — missing `SentAt`, `TrackingId`
- `src/lob/AudienceMessaging.js` lines 777–799 — payload builder
- `src/services/TitulinoNetService.js` line 200 — send endpoint
