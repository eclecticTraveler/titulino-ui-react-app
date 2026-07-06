# Missive Content Platform — Templates + Variable Registry

**Created:** 2026-07-05  
**Branch:** profile-issues (Phase 1–6); new branch for Phase 7–8 (C# refactor)  
**Goal:** Single source of truth for message templates and substitution variables, accessible by both React frontend and C# console jobs. No breaking changes to existing blast flow until Phase 7–8.

---

## Phasing strategy

Start with zero-impact additions (DB + read-only data layer) and defer all refactors / substitution changes to the end. Each phase can ship independently.

| Phase | Area | Impact on existing features |
|---|---|---|
| 1 | DB: Variable registry | None — new tables only |
| 2 | DB: Message templates | None — new tables only |
| 3 | Frontend: Variable data layer | None — new LOB + Redux slice |
| 4 | Frontend: Template data layer | None — new LOB + Redux slice |
| 5 | Admin UI: Variable + Template managers | None — new admin tabs only |
| 6 | Blast composer: Additive UX | Additive — existing flow unchanged |
| 7 | C#: Read templates from DB | Moderate — replaces hardcoded strings |
| 8 | Variable substitution refactor | High — changes resolution logic |

---

## Phase 1 — DB: Variable Registry

> sqitch path: `deploy/Missive/2026/07/`

- [x] T01 — Create `Missive.MessageVariable` table + `message_variable_type` composite type  
  Fields: `MessageVariableId` (serial PK), `VariableKey` (text, e.g. `name`), `DisplayName` (text), `DataFieldPath` (text, e.g. `contactName`), `LocaleKey` (text, i18n key for description), `IsActive` (bool)
- [x] T02 — `Missive.get_message_variables()` inner function (returns `SETOF message_variable_type`)
- [x] T03 — `TitulinoApi_v1.GetMessageVariables()` wrapper + permission grants
- [x] T04 — `Missive.upsert_message_variable(p_variable message_variable_type)` inner + `TitulinoApi_v1.UpsertMessageVariable(...)` wrapper (returns full composite type)
- [x] T05 — Seed migration: insert existing variables (`name`, `association`, `location`) with data field paths and locale keys

## Phase 2 — DB: Message Templates

> sqitch path: `deploy/Missive/2026/07/`

- [x] T06 — Create `Missive.MessageTemplate` table + `message_template_type` composite type  
  Fields: `MessageTemplateId` (serial PK), `TemplateName` (text), `Subject` (text), `Body` (text, preserves `{{variables}}`), `LocaleCode` (text, e.g. `es_US`), `CategoryId` (int FK → `Missive.CommunicationCategory`), `IsActive` (bool)
- [x] T07 — `Missive.get_message_templates()` inner function with optional `p_locale_code` filter
- [x] T08 — `TitulinoApi_v1.GetMessageTemplates(p_locale_code text DEFAULT NULL)` wrapper + grants
- [x] T09 — `Missive.upsert_message_template(p_template message_template_type)` inner + `TitulinoApi_v1.UpsertMessageTemplate(...)` wrapper
- [x] T10 — Seed migration: extract hardcoded templates from `MessageManager.cs` into DB rows

## Phase 3 — Frontend: Variable Data Layer

- [x] T11 — LOB: `buildMessageVariableTableModel(rows)`, `buildMessageVariableOptions(rows)` in `AudienceMessaging.js` + 8+ tests
- [x] T12 — Service: `TitulinoAdminAuthService.js` — `getMessageVariables()`, `upsertMessageVariable(...)`
- [x] T13 — Manager: `AdminToolsManager.js` — named + default exports for both functions
- [x] T14 — Actions + constants + reducer slice for `messageVariables`; wire `GET_MESSAGE_VARIABLES` on admin tools load

## Phase 4 — Frontend: Template Data Layer

- [x] T15 — LOB: `buildMessageTemplateTableModel(rows)`, `buildMessageTemplateOptions(rows)` + 8+ tests
- [x] T16 — Service: `getMessageTemplates(localeCode)`, `upsertMessageTemplate(...)`
- [x] T17 — Manager: named + default exports
- [x] T18 — Actions + constants + reducer slice for `messageTemplates`; wire `GET_MESSAGE_TEMPLATES` on admin tools load

## Phase 5 — Admin UI: Variable + Template Managers

> All inside `GlobalAdminToolsLandingDashboard.js`, new tabs in the existing admin tools panel

- [x] T19 — Variable manager list tab: table with filters (VariableKey, DataFieldPath, IsActive), edit-on-click, Y-scroll
- [x] T20 — Variable manager create tab: key, display name, data field path, locale key, active toggle; auto-derives key; confirm dialog notes to add i18n key
- [x] T21 — Template manager list tab: table with template name, locale, category, subject preview, active toggle, edit-on-click
- [x] T22 — Template manager create/edit: name, locale selector, category selector, subject input, body textarea with variable picker (insert `{{key}}` at cursor); confirm dialog notes to verify variable keys exist

## Phase 6 — Blast Composer: Additive UX

> Changes are purely additive — existing custom-text flow works unchanged

- [x] T23 — "Load from template" selector above subject/body fields; selecting a template pre-fills both; user can still edit freely afterward
- [x] T24 — Variable picker in body toolbar: shows available variables with description + data field tooltip; inserts `{{key}}` at cursor position
- [x] T25 — Live variable preview panel: shows a sample resolved message using the first contact in the audience (replaces `{{name}}` with actual name, etc.) — read-only, informational

## Phase 7 — C#: Read Templates from DB

> Branch: feature/missive-template-db-refactor (separate from UI branch)

- [x] T26 — Add `GetMessageTemplatesAsync(localeCode)` RPC call in `MessageManager.cs`; keep hardcoded templates as fallback
- [x] T27 — Replace hardcoded template strings in `MessageManager.cs` with DB lookups; remove fallback once verified
- [x] T28 — Console jobs: same DB-driven template lookup; ensure variable substitution still works identically

## Phase 8 — Variable Substitution Refactor

> Most intrusive phase — changes how `{{variables}}` are resolved at send time

- [ ] T29 — C#: Replace per-method hardcoded field mappings with DB variable registry (`VariableKey → DataFieldPath`); single `SubstituteVariables(template, contact, locale)` method
- [ ] T30 — Frontend: Live preview uses same registry; `buildAudienceMessageVariableOptions` reads from DB-driven store instead of hardcoded list
- [ ] T31 — Multi-language: resolve locale-dependent variables (e.g. `{{association}}`) by checking contact's language preference; variable registry stores locale-aware display name key

---

## Notes

- `MessageVariable.DataFieldPath` uses dot-notation (e.g. `contact.firstName`) — both C# and JS resolve the same path
- Templates are locale-specific rows (one row per language per template) — not a single row with translations
- Phase 7–8 require `titulino-communication` repo changes; coordinate with sqitch changes for any new DB columns needed
- C# model `CommunicationTemplate.cs` will need to be added to `titulino-communication/Models/Missive/` alongside `CommunicationCategory.cs`
