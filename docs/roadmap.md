# Titulino UI — Future Roadmap

Items here are **not scheduled** — they are architectural ideas or feature improvements captured for future planning. When any item gets a green flag, convert it to a plan file in `docs/plans/active/`.

---

## Messaging — Attachment Support

**Scope:** titulino-communication C# SLN + titulino UI React

**Summary:** Allow admins to attach files (PDFs, images, documents) to outgoing blast emails and scheduled `MessageManager` jobs.

### Architectural decision required first

Store a GCS path (or a `MessageAttachmentId` FK to a new `Missive.MessageAttachment` table) in the queue row. `MessageManager` fetches the bytes once before the send loop and reuses them across all recipients. Do **not** store inline base64 in the queue — it bloats the DB for large files or large audiences.

### DB (~4 migrations)

- `Missive.MessageAttachment` table — `MessageAttachmentId`, `FileName`, `ContentType`, `GcsPath`, `UploadedAt`, `IsActive`
- FK column on `Missive.CommunicationQueue` — `MessageAttachmentId` (nullable)
- `get_message_attachments` inner + `GetMessageAttachments` wrapper
- `upsert_message_attachment` inner + `UpsertMessageAttachment` wrapper; update queue stored proc to accept attachment ID

### C# (~3 files)

- `Models/Missive/IMessageAttachment.cs` + `MessageAttachment.cs` — mirror to all 3 repos
- `GmailSender` — extend `SendEmailAsync` to accept optional `IEnumerable<IMessageAttachment>`; build `MimePart` instances from `byte[]` (MimeKit already supports this)
- `MessageManager.cs` — fetch attachment bytes once before each send loop; pass to sender

### React (~6 files)

- Blast composer `renderMessageTab` — Ant Design `Upload` control; on select, upload to GCS via new `TitulinoAdminAuthService.uploadMessageAttachment()`, store returned `attachmentId` in component state
- `onSendingAudienceMessage` action — extend payload with `attachmentId`
- `AdminToolsManager.sendAudienceMessage()` — pass `attachmentId` to service
- `TitulinoAdminAuthService.sendAudienceMessage()` — include `attachmentId` in PostgREST body
- LOB: `buildMessageAttachmentModel()` + tests

### Rough size

~15 tasks, similar scope to the variable registry phase (T01–T14).

---

## Messaging — Audience Filter Natural Language Summary

**Scope:** titulino UI React only (`GlobalAdminToolsLandingDashboard.js` + 3 locale files)

**Summary:** A yellow `Alert` banner above the audience table that reads the active filters and assembles a plain-English (always EN) sentence describing what the current query will do — e.g. *"Targeting contacts enrolled in Supermarket (Sep 2024) · without progress · skipping those already sent Invitation (1st) for that course."*

### Key design decisions

- **No AI needed** — fully deterministic clause builder: each active filter contributes one clause; inactive filters are omitted; clauses are joined with `·` separators.
- **Always English** regardless of locale — audience management is an admin-only screen and the sentence structure differs too much across languages to maintain safely in 3 locales.
- Show only when at least one non-default filter is active (hide when everything is "Any" / empty).

### Implementation sketch

1. A `buildAudienceSummary(filters, options)` pure function in `src/lob/AudienceMessaging.js` — receives the current `audienceFilters` object + lookup maps (course names, category names) and returns a string array of active clauses.
2. Tests for every clause type (~12 test cases).
3. A `<Alert type="warning" showIcon message={...} />` rendered between the filter card and the audience table, visible only when `clauses.length > 0`.

### Clause catalog (13 filter dimensions)

| Filter | Example clause |
|---|---|
| courseCodeIds | enrolled in X, Y |
| excludeCourseCodeIds | not enrolled in X |
| hasProgress = with | with progress |
| hasProgress = without | without progress |
| hasCertifications = with | with a certificate |
| hasCertifications = without | no certificate |
| hasPurchases = with | with access/purchase |
| hasPurchases = without | no access/purchase |
| country | from [country] ([residency/birth]) |
| language | language [X] at level [Y] |
| gender | [female/male] contacts |
| excludeCategoryId + excludeCourseCodeId | skipping contacts already sent [category] for [course] |
| excludeCategoryId only | skipping contacts already sent [category] |

### Rough size

~8 tasks (LOB function + tests + component wiring + i18n for clause labels).

---
