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
- [x] T29f — User confirmed production validation successful (2026-07-15). Flag-on behavior accepted as correct.
- [ ] T30 — **Decision needed before implementing:** (a) keep the current lighter display-name-placeholder preview as sufficient (it already reads the live registry — arguably already satisfies the spirit of this task), or (b) build genuine per-contact resolution in the preview (bigger — needs either a sample contact's real data reaching the frontend, or a small preview-resolution endpoint that mirrors T29d's logic server-side).
- [ ] T31 — Once T29d's resolver table exists, `association`'s locale/gender logic is already one entry in it (T29d formalizes it, doesn't rewrite it). Confirm the registry's `LocaleKey` is enough to drive future locale-aware variables, or whether a `SupportedLocales` field is needed on `MessageVariable`.

### Cleanup — done 2026-07-15

1. [x] Deleted `ResolveVariablesLegacy` and the `MISSIVE_USE_VARIABLE_REGISTRY` flag check in `PopulateMessageDetailsAsync`; the call to `ResolveVariablesFromRegistryAsync` is now unconditional. `TitulinoMissive.csproj` builds clean (0 errors, same pre-existing warnings).
2. [ ] **Still needed, on the user's side** — remove `MISSIVE_USE_VARIABLE_REGISTRY` from the crontab's env line on `pd-titulino-lang` (`sudo crontab -e`). Harmless to leave (nothing reads it anymore), but worth cleaning up so a future reader doesn't go looking for what it does.
3. [x] Grepped the repo — no remaining references to `MISSIVE_USE_VARIABLE_REGISTRY`, `ResolveVariablesLegacy`, or `UseVariableRegistry`.
4. [x] Updated `titulino-communication/docs/Architecture.md` (new "Message Content Source" + "Variable Substitution" sections) and `titulino-docs/docs/titulino-communication/architecture.md` (same two sections, condensed).
5. **Not moving this file to `docs/plans/completed/`** — Phases 9–11 below were added the same day and are still active. File stays in `docs/plans/active/` until those close out too.
6. T30/T31 intentionally left open — independent decisions, not blocked by this cleanup.

## Phase 9 — Welcome content for 4 new courses (2026-08 cohort)

> Content drafted 2026-07-15, staged in scratchpad, not yet in the titulino-spine bucket. User deploys bucket changes themselves (see [[project_missive_content_platform]] convention).

Dates confirmed against actual calendar (`date -d`): all 4 start dates land on the stated weekday.

| Course | Start | Weekly meeting (Rexburg) |
|---|---|---|
| ENGLISH_CONNECT_1_JUL_2026_COURSE_01 | Sun 2026-08-02 | Sundays 4:00 pm |
| SPEECHES_OF_HISTORY_JUL_2026_COURSE_01 | Tue 2026-08-04 | Tuesdays 6:00 pm |
| CONVERSATION_JUL_2026_COURSE_01 | Thu 2026-08-06 | Thursdays 4:00 pm |
| MEDITACIONES_DE_UNA_EXISTENCIA_LUCIDA_JUL_2026_COURSE_01 | Sun 2026-08-09 | Sundays 6:00 pm |

- [x] T32 — Drafted `welcome_es.txt`/`welcome_en.txt` for all 4 courses + updated `welcome-messages.json`.
- [x] T32b — Placed the content in the user's actual local mirror repo (`C:\Users\AlbertoArellano\t-bucket\titulino-bucket-spine\titulino-bucket\titulino-spine-data\`, git-tracked, working tree only — not committed/pushed/uploaded). SPEECHES already had good real `welcome_es.txt`/`welcome_en.txt` content locally (better than the live bucket's — the live bucket has never received an `en` file for this course); rather than overwrite it, only fixed the two real bugs in place: wrong/inconsistent date (`lunes, 07 Julio 2025` / `Tuesday, July 07 2026` → both corrected to `martes, 04 de agosto de 2026` / `Tuesday, August 4, 2026`) and the JSON's `en.bodyUrl` pointing at the Spanish file instead of its own `welcome_en.txt`. MEDITACIONES/ENGLISH_CONNECT_1/CONVERSATION had no local folders at all — created all 3 with drafted content, and replaced MEDITACIONES' `"TODO: ..."` placeholder subjects in the JSON.
- [ ] T33 — User reviews drafted content (esp. the `[GROUP LINK PENDING]` WhatsApp placeholders on the 3 new courses, and the intentionally-omitted sprint/certificate/grammar structure on MEDITACIONES since it's unconfirmed whether that course uses it), fills in the gaps, and runs their own upload trigger to push to the live bucket.

## Phase 10 — Fix welcome queue course-misattribution bug

> Bug found 2026-07-15 tracing `SendWelcomeMessagesToNewCourseEnrolleesAsync` (see the `⚠ Known bug` note added to `titulino-communication/docs/Architecture.md`'s Redis Queues section). Root cause: the job loops over every course and pops the *same* shared `welcomeToCourseEnrollee` queue on each iteration; the queue message is a bare external contact ID with no course code, so a popped contact gets sent whichever course's content the loop happens to be on — not necessarily the one they enrolled in.

### Design decision

User asked whether the fix should push `{externalId, courseCodeId}` pairs from titulino-net-api, or look up the contact's course history from the external ID at consumption time. Neither — a third option is both simpler and correct: **stop using the queue for course attribution entirely.** `GetEnrolleesByCourseAsync(courseCodeId)` and `GetCommunicationTrackingAsync(courseCodeId, category, type)` (→ `GetSuccesfulCommunicationTrackingByFilters` RPC, already filters to successful sends only) both already exist and are already used by this exact pattern in `SendInviationMessageToUnenrolledContactsForEnrollmentAsync` (get all contacts for the course, subtract the ones already tracked as successfully messaged for that category). Reusing it here means:
- No producer change in titulino-net-api — the enrollment endpoint doesn't need to push anything for this job.
- No extra DB load vs. the queue-pair option — same 2 queries per course either way, and the course scoping happens in the query itself instead of trusting loop-iteration timing.
- Course attribution becomes a property of the query, not of when a pop happens to land — eliminates the bug class entirely rather than papering over it.

- [x] T34 — Rewrote `SendWelcomeMessagesToNewCourseEnrolleesAsync` (2026-07-16): per course, calls `GetEnrolleesByCourseAsync(courseCodeId)` instead of popping `welcomeToCourseEnrollee`, then `GetCommunicationTrackingAsync(courseCodeId, CommunicationCategory.welcome, CommunicationProvider.email)` and filters out contacts already in that result before calling the existing `ProcessEnrolleesAsync` directly (bypassing `ProcessMessagesFromGivenQueueAsync`'s queue-pop path entirely). Skips the course early if nothing's pending. `dotnet build` clean (0 errors).
- [x] T35 — Confirmed `reprocesswelcome`/`reprocessinFaultyWelcomeToCourseEnrollee` is unaffected — `ProcessEnrolleesAsync` still receives the same `reprocessQueueName`, so failed sends still land on the dead-letter queue exactly as before; only the *initial* course-attribution pop was removed.
- [ ] T36 — Retire the `welcomeToCourseEnrollee` queue and its producer push in titulino-net-api. **Not yet** — waiting for T34 to run live for a while first, per the plan's own caution.
- [x] T37 — Updated `docs/Architecture.md`'s Redis Queues section: replaced the `⚠ Known bug` note with a `✅ Fixed 2026-07-16` note describing the fix, and flagged that `titulino-net-api` still pushes to `welcomeToCourseEnrollee` with nothing consuming it (T36).
- [x] T38 — Manual verification passed (2026-07-17): confirmed correctly-attributed welcome emails in production after the server deploy. Phase 10 is fully live and verified.

### Deferred — combine multi-course welcomes into one email (user's original ask)

Not scoped as its own task yet. Once T34 makes course attribution a query result rather than queue-timing, this becomes: run the per-course "enrolled, not yet welcomed" query across *all* courses first, group the combined result by contact, and send one email per contact listing every pending course instead of one email per course. Worth doing as a follow-up once T34–T38 are live and stable, not bundled into the bug fix itself.

## Phase 11 — Admin Tools > Configuration > Jobs

> New admin section: view/upsert which jobs exist, their schedule, and their content source (DB template / titulino-spine bucket / hardcoded — see the table in `titulino-communication/docs/Architecture.md`).

**Two fields with two different levels of "real":**
- **Active/inactive status** — informational only, per the user's explicit framing (2026-07-15): "to activate and deactivate it tells to edit cron jobs in the server for active or inactive is just a status." Changing it does not start/stop anything — the real switch is `sudo crontab -e` on the server. UI must say so.
- **Template association (`TemplateName`)** — **functional, decided 2026-07-15** (user chose this over informational-only when asked): editing it in the admin UI actually changes which DB template a job resolves at send time. This requires each DB-driven job method in `MessageManager.cs` to look up its template name from this new registry instead of a hardcoded string literal. The UI must distinguish these two fields clearly — an admin editing "Active" expects nothing to happen; an admin editing "Template Name" needs to know the *next real run* will use it.

- [x] T39 — Sqitch migration: `Missive.Job` table + `job_type` composite (`JobKey` text PK, `DisplayName`, `ScheduleDescription`, `ContentSourceType` with CHECK constraint, `TemplateName` nullable, `BucketPath` nullable, `IsActiveDisplay` bool, `Notes` text). Scaffolded via `wsl sqitch add` (native `sqitch` wasn't on PATH in the Windows shell, WSL has it), deploy/revert/verify all written. **Not yet deployed** — deploy is on the user, per this project's convention.
- [x] T40 — `Missive.get_jobs()` inner + `TitulinoApi_v1.GetJobs()` wrapper + admin-only grants (titulino_administrator + super_admin).
- [x] T41 — `Missive.upsert_job(p_job job_type)` inner + wrapper (admin-only grants, returns full composite type).
- [x] T42 — Seed migration: seeded only the 8 jobs whose content source was directly confirmed by reading `MessageManager.cs` (birthdays, churchmemberbirthdays, goldcerts, defaultcerts, invitationtoenroll, reprocesswelcome, welcome, testing) — deliberately left out the 9 not-yet-audited jobs rather than guess.
- [x] T43 — C#: added `IJob`/`Job` to `Models/Missive/` in all 3 repos.
- [x] T44 — C#: added `GetJobsAsync()` to the full Repository chain (Mapper → SupabaseAdapter → IProviderAdapter/ProviderContext → IRepositoryClient/RepositoryClient) in all 3 repos. **Discovery**: the admin UI calls Supabase PostgREST directly (`TitulinoAdminAuthService.js` → `SupabaseConfig.baseApiUrl`), not through titulino-net-api — that's why `UpsertMessageVariable` had no C# method anywhere. So no `UpsertJobAsync` C# method was needed either; only the read path (`GetJobsAsync`) is used, by `MessageManager.cs` itself.
- [x] T45 — Added `GetJobsRegistryAsync()` (cached) + `ResolveJobTemplateName(jobKey, fallback)` to `MessageManager.cs`. Rewired all 6 job methods (7 call sites: `SendBirthdayMessageAsync`, `SendBirthdayMessageToChurchMembersAsync` es+pt, `SendGoldenCertificationToQualifiedEnrolleesAsync`, `SendDefaultCertificationToQualifiedEnrolleesAsync`, `SendInviationMessageToUnenrolledContactsForEnrollmentAsync`, `ReprocessFaultyWelcomeMessagesAsync`) to resolve `templateName` from the registry with fallback to today's hardcoded string. `dotnet build` clean (0 errors) across all 3 repos.
- [x] T46 — Frontend: `buildJobTableModel` in `AudienceMessaging.js` + 8 tests (all pass, 171/171 total in that suite); `getJobs`/`upsertJob` in `TitulinoAdminAuthService.js`; `getJobs`/`upsertJob` in `AdminToolsManager.js`; `ON_LOADING_JOBS`/`ON_UPSERTING_JOB` constants + `onLoadingJobs`/`onUpsertingJob` actions + reducer cases (`jobs`, `lastUpsertJobResult` state).
- [x] T47 — Added a 4th Card ("Jobs") to the Messaging → Setup tab (same Card+Modal+Tabs(list/createEdit) pattern as Template Manager) in `GlobalAdminToolsLandingDashboard.js`: list view (job key, display name, schedule, content-source Tag, template/bucket path, active toggle with a tooltip disclaimer, edit button) + create/edit form. Edit form shows an `Alert` on the Template Name field specifically noting it's live, and a tooltip on Active noting it's status-only — the two fields are visually distinguished per the plan's requirement. Locale keys added to `en_US.json`/`es_US.json`/`pt_BR.json`.
- [x] T48 — Manual verification passed (2026-07-17): pointed `birthdays` at a temporary `birthday-testing` template via Job Manager, confirmed the new content sent, reverted back to `birthday` and cleaned up the test template afterward.

### T49 — Active toggle now short-circuits real execution (decided + built 2026-07-16)

User asked (looking at the built UI): what if toggling a job inactive didn't just *display* as off, but made the job a genuine no-op the next time cron fires it — cron scheduling stays server-controlled, but the job's own code exits immediately. Agreed this was better than the original informational-only design; user gave explicit go-ahead since it's a real production-behavior change.

- [x] Sqitch: `Missive/2026/07/16_rename_job_is_active_display_to_is_active` — renames `Missive.Job.IsActiveDisplay`→`IsActive` (column + `job_type` attribute via `ALTER TYPE ... RENAME ATTRIBUTE`), redefines `get_jobs()`/`upsert_job()` to match.
- [x] Sqitch: `TitulinoApi_v1/2026/07/16_rename_upsert_job_is_active_param` — renames `UpsertJob`'s `p_is_active_display` param to `p_is_active` (PostgREST matches JSON body keys to param names, so this had to change in lockstep with the frontend payload key). **First deploy attempt failed**: Postgres doesn't allow renaming a parameter via `CREATE OR REPLACE FUNCTION`, even with unchanged types/order (`cannot change name of input parameter`) — sqitch auto-reverted cleanly back to a known-good state. Fixed both deploy and revert to `DROP FUNCTION` first, then `CREATE` fresh. **Both `07/16` migrations deployed successfully 2026-07-16.**
- [x] C#: renamed `IJob`/`Job.IsActiveDisplay`→`IsActive` in all 3 repos. Added `IMessageManager.IsJobActiveAsync(jobKey)` / `MessageManager.IsJobActiveAsync` (fails open — returns `true` if the registry is unreachable or the job has no row, since most jobs aren't seeded yet and a missing row must never silently kill a job). Wired the actual guard into `TitulinoMissive/Program.cs`, right after the CLI arg resolves to a job name, before `ValidateCommunicationCategorySyncAsync()` — logs and returns early if inactive. `dotnet build` clean (0 errors).
- [x] Frontend: renamed `isActiveDisplay`→`isActive` across `AudienceMessaging.js` (+ tests, 171/171 pass), `AdminToolsManager.js`, `redux/actions/AdminTools.js`, `GlobalAdminToolsLandingDashboard.js`. Rewrote the Active tooltip/confirm-dialog copy in all 3 locale files to describe the real short-circuit behavior instead of "status note only" — and moved Active into the "affects real behavior" framing alongside Template Name (the `referenceFieldsNote` banner text now says so explicitly).
- [x] Manual verification passed (2026-07-17): toggled `testing` off, confirmed it skipped and logged nothing extra; toggled back on, confirmed normal execution and logging.

### T50 — Bucket Path made functional for `welcome` (built 2026-07-17)

Same idea as T49, applied to the `welcome` job's bucket path.

- [x] Added a `GetWelcomeMessageConfigsAsync(string bucketPath)` overload to `IBucketAdapter`/`GcpBucketAdapter`/`IRepositoryClient`/`RepositoryClient` (all triplicated across titulino-communication, titulino-net-api, TitulinoWorkerService) — the existing no-arg method now just delegates to it with today's hardcoded literal, so nothing else calling it changes behavior.
- [x] Added `ResolveJobBucketPath(jobKey, fallbackPath)` to `MessageManager.cs`, mirroring `ResolveJobTemplateName` exactly (same fail-safe-default: missing row or empty `BucketPath` falls back to the hardcoded literal).
- [x] `SendWelcomeMessagesToNewCourseEnrolleesAsync` now resolves the path via `ResolveJobBucketPath("welcome", "titulino-spine-data/welcome-messages.json")` before calling `GetWelcomeMessageConfigsAsync(bucketPath)`.
- [x] `dotnet build` clean (0 errors) in all 3 repos.
- [x] Frontend: updated `bucketPathHint` copy (now says "Live", matches Active/Template Name's warning-style Alert) and `referenceFieldsNote` (Bucket Path moved out of the reference-only list) in all 3 locale files. No structural UI change needed — the field/section placement was already correct from T49's divider work.
- [ ] Manual verification: not yet done. Same test pattern as T48 — point `welcome`'s Bucket Path at a duplicate test JSON file with obviously different content, run manually, confirm the test content is what's used; then revert.

### T51 — Job Manager "Logs" tab, filtered by job key (built 2026-07-16)

User noticed the Monitoring tab already has a Missive log source and asked to scope a 3rd tab in Job Manager showing that job's log entries. Found while scoping: job methods only log on error/critical paths today, so a job-scoped Logs tab would've been empty for successful runs — fixed that as part of the same piece of work. Broken into 8 small tasks per the user's request; all 8 built.

- [x] 1-3 (C#, `TitulinoMissive/Program.cs`): wrapped the job switch dispatch in try/catch — logs Info `"Job '{job}' started"` before, Info `"Job '{job}' completed successfully"` after, Error with exception details in the catch block (then rethrows, preserving today's crash-on-error behavior). All three tagged `methodName: job` — the CLI key itself (e.g. "birthdays"), not a C# method name, so the Logs tab can filter by exact job key with no separate job→method-name mapping needed. `dotnet build` clean (0 errors). **No shared-library (Models/Repository/Hub/AuthToken/Logger) changes** — only used the already-existing `IMissiveLogger`/`LogSeverity`, so nothing needed mirroring to titulino-net-api or TitulinoWorkerService this time.
- [x] 4 — Added a 3rd "Logs" tab to Job Manager's `Tabs`, `disabled` when creating a new job (no `jobKey` yet).
- [x] 5 — `renderJobManager`'s `logsTab`: dispatches the *already-existing* `onLoadingProcessLogEvents(emailId, 'missive', { ...filters, methodSearchText: jobKey })` action (zero new redux plumbing) and renders with the *already-existing* `processLogColumns` (`buildProcessLogTableColumns`) from the Monitoring tab's own `ProcessLogs.js`.
- [x] 6 — Filter bar scoped to just this job: severity `Select` + `DatePicker.RangePicker`, both re-fetching on change; `methodSearchText` stays locked to the job key, no free-text search box (not needed — the job key already scopes it).
- [x] 7 — Locale keys (`jobManager.tabs.logs`, `jobManager.logs.description`, `jobManager.logs.refresh`) in all 3 locale files, including a note that older activity won't retroactively appear.
- [x] 8 — Build verification: `dotnet build` (TitulinoMissive) 0 errors; frontend `npm run build` 0 errors. **Live manual verification passed (2026-07-17)**: toggled `testing` off, confirmed the console skip message *and* a matching Warning entry in its Logs tab (this specific skip-logging call needed a separate deploy after the first one, since it landed in a later commit — see below).
- [x] Gap found and fixed 2026-07-16: the `IsJobActiveAsync` skip branch in `Program.cs` only did `Console.WriteLine` — nothing landed in the structured Missive log table, so a skipped job's Logs tab would show nothing. Added a `LogSeverity.Warning` call there too, tagged with the job key like the others.

**Known shared-state nuance (not a bug, just worth knowing):** the Logs tab reuses the same `processLogEventsBySource.missive` redux slot the Monitoring tab's Missive view uses. If both are open at once with different filters, the last one to fetch wins that slot — low practical risk, but not fully isolated.

**Task count for Phases 9–11: 17 tasks + T49 (built) + T50 (scoped, not built) + T51 (built, 8/8 tasks)**, plus the deferred combine-into-one-email enhancement (unscoped).

---

## Notes

- `MessageVariable.DataFieldPath` uses dot-notation (e.g. `contact.firstName`) — both C# and JS resolve the same path
- Templates are locale-specific rows (one row per language per template) — not a single row with translations
- Phase 7–8 require `titulino-communication` repo changes; coordinate with sqitch changes for any new DB columns needed
- C# model `CommunicationTemplate.cs` will need to be added to `titulino-communication/Models/Missive/` alongside `CommunicationCategory.cs`
