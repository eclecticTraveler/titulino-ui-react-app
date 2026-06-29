# Know Me — AI Essay Review

**Branch:** `feature/know-me-ai-review`  
**Started:** 2026-06-29  
**Repos touched:** titulino-warehouse · TitulinoWorkerService · titulino-net-api · titulino-ui

---

## What this builds

Students write essay answers inside the Know Me survey (`KnowMeV3`). After they submit, an AI (Claude via Anthropic) reviews each essay, corrects grammar and style based on the question's grammar topic, and returns structured feedback. The student sees the original and corrected essays side by side on the same page.

The flow:

```
UI submits via Supabase RPC UpsertAuthenticatedKnowMeSubmission
  └─► RPC also inserts Lrn.KnowMeAiJob (status = pending)

Worker polls DB every 30 s for pending jobs
  → claims one atomically (status = processing)
  → parses essays_json, calls Anthropic per question
  → saves corrected_essays_json + feedback_json
  → marks status = completed (or failed)

UI calls GET /v1/lrn/know-me/ai-result
  → shows pending/processing state or
  → renders corrected essays + per-question feedback
```

---

## Architecture decision

**DB-driven job queue, not GCS file-based.**

The current `KnowMeAiManager` scans a GCS bucket for `/ai-inbox/` files. That approach has two hard problems:

1. The submission flow goes through Supabase RPC → PostgreSQL. Nothing currently writes to the GCS inbox, so the worker would idle forever.
2. Listing all bucket objects on every poll is O(n) over all objects — gets expensive as the bucket grows.

The fix: `UpsertAuthenticatedKnowMeSubmission` (already called by the UI) is modified to also insert a `pending` row into a new `Lrn.KnowMeAiJob` table. The worker polls that table via `IRepositoryClient` (already injected but unused in the current code). The database is the single source of truth for both submission content and AI job status.

---

## Open questions — answer before starting Day 1

- [ ] **Warehouse repo path** — assumed `titulino-warehouse` with Sqitch. Confirm exact local path.
- [ ] **UI refresh strategy** — polling (simpler, already fits the Redux action pattern) or SignalR push via the Hub already registered in the worker?
- [ ] **AI correction granularity** — per question (each essay corrected independently) or one combined review of all essays?

---

## Progress

### Phase 1 — Database · `titulino-warehouse`

> Gates everything. Do not start Phase 2 until T08 is verified in Supabase.

- [ ] **T01** — Sqitch migration: create `Lrn.KnowMeAiJob` table  
  `id, contact_internal_id, email_id, course_code_id, class_number, essays_json, status (pending/processing/completed/failed), corrected_essays_json, feedback_json, error_message, created_at, updated_at`
- [ ] **T02** — Sqitch: RPC `GetPendingKnowMeAiJobs` (inner + wrapper)  
  Returns rows where `status = 'pending'`, ordered by `created_at ASC`, LIMIT 10
- [ ] **T03** — Sqitch: RPC `ClaimKnowMeAiJob(p_job_id)` (inner + wrapper)  
  Atomic `UPDATE status = 'processing' WHERE status = 'pending'` — prevents double-claim
- [ ] **T04** — Sqitch: RPC `CompleteKnowMeAiJob(p_job_id, p_corrected, p_feedback)` (inner + wrapper)
- [ ] **T05** — Sqitch: RPC `FailKnowMeAiJob(p_job_id, p_error_message)` (inner + wrapper)
- [ ] **T06** — Sqitch: RPC `GetKnowMeAiJobBySubmissionId` (inner + wrapper)  
  Fetch by `contact_internal_id + course_code_id + class_number` — used by the API result endpoint
- [ ] **T07** — Modify `UpsertAuthenticatedKnowMeSubmission` to also INSERT a `pending` job row  
  ⚠️ This is a live function used by every Know Me submission — test carefully before deploying to prod
- [ ] **T08** — Verify via Supabase SQL editor: submit test record → confirm `pending` job appears → manually run claim + complete cycle

---

### Phase 2 — Worker Service · `TitulinoWorkerService`

> Requires Phase 1 complete. Rewrites the current GCS-based approach entirely.

- [ ] **T09** — Add DB query methods to `KnowMeAiManager` via `IRepositoryClient`  
  Wire: GetPending, Claim, Complete, Fail. Currently `IRepositoryClient` is injected but completely unused.
- [ ] **T10** — Rewrite `KnowMeAiManager.ProcessPendingSubmissionsAsync`  
  DB poll → claim one job → parse `essays_json` → call AI per question → save results → mark complete/failed
- [ ] **T11** — Remove stale GCS scanning code (`ProcessOneAsync`, `StorageClient`, `AiInboxSuffix` constants)
- [ ] **T12** — Update `IKnowMeAiManager` interface to match new DB-driven contract
- [ ] **T13** — Rewrite `AiPromptHelper.BuildEssayCorrectionPrompt`  
  Accept question metadata (id, title, grammar topic) + student text. Enforce structured JSON output.
- [ ] **T14** — Update `IAiCorrectionService` with structured types  
  `CorrectEssayAsync(string)` → `CorrectEssaysAsync(List<EssayInput>) : Task<List<EssayResult>>`
- [ ] **T15** — Update `AnthropicAiProvider` for structured JSON output + response parsing  
  Retry once on malformed JSON before failing.
- [ ] **T16** — Update `OpenAiProvider` and `GeminiAiProvider` to implement updated interface

---

### Phase 3 — .NET API · `titulino-net-api`

> Requires T06 (RPC) from Phase 1. Can be developed in parallel with Phase 2 once T06 is live.

- [ ] **T17** — Add `GetKnowMeAiResultAsync` to `ILrnManager` interface
- [ ] **T18** — Implement `GetKnowMeAiResultAsync` in `LrnManager.cs`  
  Accepts `contactInternalId + courseCodeId + classNumber`. Returns status + corrected essays if completed.
- [ ] **T19** — Add Supabase RPC call for `GetKnowMeAiJobBySubmissionId` in C# `LrnAuthService`
- [ ] **T20** — Add `GET /v1/lrn/know-me/ai-result` to `Lrn.cs`  
  Auth: `AnyAuthenticatedUser`. Returns `{ status, correctedEssays, feedback }` or `{ status: 'pending' }`.

---

### Phase 4 — React UI · `titulino-ui`

> Requires Phase 3 complete. Most user-visible phase.

- [x] **T21** — Remove `console.log("progressToUpsert", progressToUpsert)` from `LrnManager.js:766`
- [ ] **T22** — Add `ON_FETCHING_KNOW_ME_AI_RESULT` constant to `constants/Lrn.js`
- [ ] **T23** — Add `getKnowMeAiResult` service call to `TitulinoLrnNetService.js`  
  `GET ${env.TITULINO_NET_API}/v1/lrn/know-me/ai-result` with contactId + courseCodeId + classNumber
- [ ] **T24** — Add `getKnowMeAiResult(levelTheme, chapterNo)` to `LrnManager.js`
- [ ] **T25** — Add `onFetchingKnowMeAiResult` Redux action to `Lrn.js`
- [ ] **T26** — Update `KnowMeV3` — on load, fetch existing submission + AI result  
  If completed: hide form, show result view. If pending/processing: show waiting state.
- [ ] **T27** — Update `KnowMeV3` — show pending/processing banner after successful submit
- [ ] **T28** — Update `KnowMeV3` — render corrected essays + per-question feedback when `status = completed`  
  Show original alongside corrected. This is the most visible deliverable of the sprint.
- [ ] **T29** — Write LOB test for any new LOB logic added in Phase 4

---

### Phase 5 — AI Prompt Quality · `TitulinoWorkerService`

> Builds on Phase 2 foundation. Pins the output schema before T28 UI work finalizes.

- [ ] **T30** — Design structured JSON output schema per essay question  
  `{ questionId, correctedText, summaryFeedback, grammarNotes: [], vocabularySuggestions: [] }`
- [ ] **T31** — Update `AiPromptHelper` with grammar topic injection and JSON enforcement  
  Each question passes its grammar topic (e.g. "Simple Past") so corrections are targeted, not generic
- [ ] **T32** — Add JSON response parser + validation in `AnthropicAiProvider`
- [ ] **T33** — Map per-question AI results in `KnowMeAiManager` — align with `corrected_essays_json` DB shape

---

## Token / session budget

| Phase | Tasks | Est. hours | Strategy |
|---|---|---|---|
| P1 DB | 8 | 6–8 h | One dedicated session; verify in Supabase before moving on |
| P2 Worker | 8 | 5–6 h | One session; all C# in same repo |
| P3 API | 4 | 2–3 h | Can share session with start of P4 |
| P4 UI | 9 | 5–6 h | One session; T28 is the complex one |
| P5 AI | 4 | 2–3 h | Finalize alongside T28–T29 |
| **Total** | **33** | **20–26 h** | ~11 tasks/day; 3-day realistic estimate |

**Scope 1 phase per session.** Trying to span two phases risks context compression mid-rewrite. ~165k tokens/day at 11 tasks average.

---

## Coding rules that apply to this feature

- Services never contain business logic (LOB files handle pure logic).
- Services always `try/catch` and return a safe default — never throw.
- API URLs from `EnvironmentConfig.js` — never hardcode.
- Do not test the service layer. Test LOB files.
- LOB files are pure functions — no HTTP, no Redux, no side effects.
- Any modification to a LOB file requires tests in `src/lob/__tests__/`.
