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

### Findings (2026-07-14, before implementation)

- The actual hardcoded resolution point is `PopulateMessageDetails()` in `titulino-communication/TitulinoMissive/Service/MessageManager.cs:1531` — builds one fixed `Dictionary<string,string>` with exactly the 7 seeded keys (`name`, `location`, `association`, `fullName`, `lastNames`, `programTitle`, `year`), each hand-mapped inline. `association` is not a field lookup — it's a 4-way `switch` on `isPortugueseNative` / `Sex` / `isBasicLevel` that computes a greeting string.
- The DB registry (seed: `titulino-warehouse/deploy/Missive/2026/07/05_seed_message_variables.sql`) already anticipates this: 6 of 7 variables have real dot-notation `DataFieldPath` values (e.g. `location.residency.countryNativeName`), but `association`'s `DataFieldPath` is the literal sentinel string `'dynamicGreeting'` — flagged as non-field, but nothing in C# interprets that sentinel yet.
- `ReplacePlaceholdersInPdf` (certificate PDF stamping, `goldcerts`/`defaultcerts`) consumes the *same* dictionary `PopulateMessageDetails` builds. Whatever replaces the builder must keep producing that same `Dictionary<string,string>` shape, or cert jobs break too.
- The frontend "live preview" (T25, Phase 6) is already partially registry-driven but lighter than this plan originally described: it substitutes `{{key}}` with a bracketed **display name** (`[Recipient Name]`), sourced from `messageVariables?.rows` (the live DB registry) — not a genuine resolved value from a real contact. Confirmed via `GlobalAdminToolsLandingDashboard.js` ~line 8052. This needs an explicit decision (see T30 below) rather than being assumed "just needs a data-source swap."

### Reflection can't literally walk `DataFieldPath`

Checked the real C# model: the residency path is `Location.ResidencyLocation.CountryOfResidencyNativeName` (PascalCase, `IContactResidencyLocation`). The seeded `DataFieldPath` for `location` is `location.residency.countryNativeName` — different words, different casing. Literal reflection against the seeded strings would fail. Design instead keeps each variable's computation as a small named C# resolver function, but organizes all of them into one lookup table keyed by `VariableKey`, with the DB registry driving *which keys are active* rather than a fixed C# object initializer.

### Toggle design — feature flag for safe cutover

Rather than a hard cutover, gate the new path behind a flag so the old behavior stays one env var away at all times:

- Flag lives **only in `TitulinoMissive`** (titulino-communication's own executable) — not in the shared/triplicated `AuthToken`/`EnvironmentHelper.cs`, since `MessageManager.cs` is not shared code and no other repo needs this flag. No cross-repo mirroring needed for the flag itself.
- Env var: `MISSIVE_USE_VARIABLE_REGISTRY` (unset or anything other than `"true"` = legacy path — matches the fail-safe-default convention already used by `EnvironmentHelper`'s `string.Equals(..., "Production", StringComparison.OrdinalIgnoreCase)` checks).
- Settable per-run for manual testing (`MISSIVE_USE_VARIABLE_REGISTRY=true dotnet TitulinoMissive.dll birthdays`) or added to the crontab's existing `ASPNETCORE_ENVIRONMENT=Production` env line once ready to run live with it on.

### Refined tasks

- [x] T29a — Added `Models/Missive/IMessageVariable.cs` + `MessageVariable.cs` (mirrors `IMessageTemplate.cs`/`MessageTemplate.cs`) to all 3 repos; each `Models.csproj` builds clean (0 errors).
- [x] T29b — Added `GetMessageVariablesAsync()` to the full Repository chain (`Mapper` → `SupabaseAdapter` → `IProviderAdapter`/`ProviderContext` → `IRepositoryClient`/`RepositoryClient`) in all 3 repos, mirroring `GetMessageTemplatesAsync`'s exact pattern. `Repository.csproj` and `TitulinoMissive.csproj` both build clean (0 errors) in titulino-communication; `Repository.csproj` builds clean in the other two.
- [x] T29c — Extracted the exact inline logic verbatim into `ResolveVariablesLegacy(enrollee, messageReferenceTemplate)` — pure "extract method," confirmed zero behavior change (warning count identical before/after, just relocated line numbers).
- [x] T29d — Built `ResolveVariablesFromRegistryAsync` + `VariableResolvers` dictionary + `ResolveAssociationGreeting` (extracted, not rewritten) + `GetActiveMessageVariablesAsync` (cached on the `MessageManager` instance for the process lifetime, not re-fetched per enrollee) + missing-resolver `LogFireAndForget(LogSeverity.Critical, ...)` safety net.
- [x] T29e — Wired `MISSIVE_USE_VARIABLE_REGISTRY` into `PopulateMessageDetailsAsync` (renamed from `PopulateMessageDetails`, now `async`). Updated both call sites: `DispatchEmailMessages`'s `foreach` just got `await`; `DispatchEmailMessagesByBatching`'s LINQ `.Select()` chain was converted to an explicit sequential loop (**not** `Task.WhenAll`) — `MessageEnvelope`'s constructor snapshots `sender.Subject`/`.Message` immediately, and `PopulateMessageDetailsAsync` mutates that same shared `sender`, so the mutate-then-snapshot pair must stay atomic per enrollee or concurrent calls would race and corrupt each other's emails. `ReplacePlaceholdersInPdf` untouched — still receives the same `Dictionary<string,string>` shape from either path. `TitulinoMissive.csproj` builds clean (0 errors, same 17 pre-existing warnings, just relocated).
- [ ] T29f — Validate with the flag on: run `testing` + at least one real job (`birthdays` is a good candidate — small volume, already fixed this week) with `MISSIVE_USE_VARIABLE_REGISTRY=true`, diff resolved output against a flag-off run for the same contact, watch logs for the missing-resolver Critical alert. **Not yet run** — this sends real test/production emails, so it needs an explicit go-ahead rather than being run unprompted.
- [ ] T30 — **Decision needed before implementing:** (a) keep the current lighter display-name-placeholder preview as sufficient (it already reads the live registry — arguably already satisfies the spirit of this task), or (b) build genuine per-contact resolution in the preview (bigger — needs either a sample contact's real data reaching the frontend, or a small preview-resolution endpoint that mirrors T29d's logic server-side).
- [ ] T31 — Once T29d's resolver table exists, `association`'s locale/gender logic is already one entry in it (T29d formalizes it, doesn't rewrite it). Confirm the registry's `LocaleKey` is enough to drive future locale-aware variables, or whether a `SupportedLocales` field is needed on `MessageVariable`.

### Cleanup — after validation, not now (self-contained instructions for whoever picks this up)

Once T29f's validation window has run clean (no Critical missing-resolver alerts, spot-checked emails look correct) for a deliberate period across the higher-volume jobs (`welcome`, `audiencemessages`), do this cleanup — safe to hand to a fresh agent with just this section, no other context needed:

1. In `titulino-communication/TitulinoMissive/Service/MessageManager.cs`: delete `ResolveVariablesLegacy` and the `MISSIVE_USE_VARIABLE_REGISTRY` flag check in `PopulateMessageDetails`; make the call to `ResolveVariablesFromRegistryAsync` unconditional.
2. Remove `MISSIVE_USE_VARIABLE_REGISTRY` from the crontab's env line on `pd-titulino-lang` (`sudo crontab -e`) if it was added there.
3. Grep the repo for `MISSIVE_USE_VARIABLE_REGISTRY` to confirm no other references remain.
4. Update `titulino-communication/docs/Architecture.md` and `titulino-docs/docs/titulino-communication/architecture.md` — both currently describe template fetching from GCS with no mention of the variable registry; add a short section once this is the only path.
5. Check off T29a–f in this plan file, move the file from `docs/plans/active/` to `docs/plans/completed/` (matching this repo's existing convention for finished plans).
6. Do **not** touch T30/T31 as part of this cleanup — they're independent decisions, not blocked by removing the legacy fallback.

---

## Notes

- `MessageVariable.DataFieldPath` uses dot-notation (e.g. `contact.firstName`) — both C# and JS resolve the same path
- Templates are locale-specific rows (one row per language per template) — not a single row with translations
- Phase 7–8 require `titulino-communication` repo changes; coordinate with sqitch changes for any new DB columns needed
- C# model `CommunicationTemplate.cs` will need to be added to `titulino-communication/Models/Missive/` alongside `CommunicationCategory.cs`
