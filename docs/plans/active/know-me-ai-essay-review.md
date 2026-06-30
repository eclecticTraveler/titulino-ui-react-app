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

- [x] **Warehouse repo path** — `C:\Users\AlbertoArellano\Documents\WH-T\titulino-warehouse`
- [x] **UI refresh strategy** — polling (simpler, fits existing Redux action pattern)
- [x] **AI correction granularity** — per question (each essay corrected independently)

---

## Progress

### Phase 1 — Database · `titulino-warehouse`

> Gates everything. Do not start Phase 2 until T08 is verified in Supabase.

- [x] **T01** — Sqitch migration: create `Lrn.KnowMeAiJob` table  
  `id, contact_internal_id, email_id, course_code_id, class_number, essays_json, status (pending/processing/completed/failed), corrected_essays_json, feedback_json, error_message, created_at, updated_at`
- [x] **T02** — Sqitch: RPC `ClaimNextPendingKnowMeAiJob` (inner + wrapper)  
  Merged get+claim into one atomic op using `FOR UPDATE SKIP LOCKED` — no separate GetPending needed
- [x] **T03** — Sqitch: inner `claim_next_pending_know_me_ai_job` — covered in T02 migration
- [x] **T04** — Sqitch: RPC `CompleteKnowMeAiJob(job_id, corrected_essays, feedback)` (inner + wrapper)
- [x] **T05** — Sqitch: RPC `FailKnowMeAiJob(job_id, error_message)` (inner + wrapper)
- [x] **T06** — Sqitch: RPC `GetKnowMeAiJobResult(contact_id, course_code_id, class_number)` (inner + wrapper)  
  Fetch by `contact_internal_id + course_code_id + class_number` — used by the API result endpoint
- [x] **T07** — Modified `UpsertAuthenticatedKnowMeSubmission` to also INSERT a `pending` job row  
  Helper `Lrn.ensure_know_me_ai_job` filters Answers to string-only keys; ON CONFLICT DO NOTHING on re-submit; AI job failure is caught and logged, never surfaces to student
- [x] **T08** — Verify via Supabase SQL editor: submit test record → confirm `pending` job appears → manually run claim + complete cycle  
  Verified 2026-06-30. JobId 1, SubmissionId 28. All 8 steps passed. Phase 1 gate cleared.

---

### Phase 2 — Worker Service · `TitulinoWorkerService`

> Requires Phase 1 complete. Rewrites the current GCS-based approach entirely.

- [x] **T09** — Add DB query methods to `KnowMeAiManager` via `IRepositoryClient`  
  Wire: Claim, Complete, Fail through `IRepositoryClient` → `RepositoryClient` → `SupabaseAdapter`. Build: 0 errors.
- [x] **T10** — Rewrite `KnowMeAiManager.ProcessPendingSubmissionsAsync`  
  DB poll → while loop drains all pending jobs → claim one → iterate `job.Essays` dict → call `CorrectEssayAsync` per essay → `ParseAiResponse` splits CORRECTED:/FEEDBACK: → build JSON dicts → CompleteKnowMeAiJobAsync or FailKnowMeAiJobAsync
- [x] **T11** — Remove stale GCS scanning code (`ProcessOneAsync`, `StorageClient`, `AiInboxSuffix` constants)  
  Combined with T10 — done in the same file rewrite. Build: 0 errors, 0 warnings.
- [x] **T12** — Update `IKnowMeAiManager` interface to match new DB-driven contract  
  Removed stale GCS comment. Signature `Task ProcessPendingSubmissionsAsync(CancellationToken ct)` unchanged.
- [x] **T13** — Rewrite `AiPromptHelper.BuildEssayCorrectionPrompt`  
  New signature: `(questionId, grammarTopic, text)`. Uses `$$"""` raw string so JSON template `{`/`}` are literal. Returns JSON `{ questionId, correctedText, summaryFeedback }`. GrammarTopic empty for now (T31 injects real topics).
- [x] **T14** — Update `IAiCorrectionService` with structured types  
  New `EssayInput` + `EssayResult` types in `Services/`. Interface: `CorrectEssaysAsync(List<EssayInput>, ct) : Task<List<EssayResult>>`.
- [x] **T15** — Update `AnthropicAiProvider` for structured JSON output + response parsing  
  Per-essay loop. `TryParseResult` strips code fences + parses JSON. Retries once on malformed JSON; throws on second failure.
- [x] **T16** — Update `OpenAiProvider` and `GeminiAiProvider` to implement updated interface  
  Same per-essay loop + `ParseResult` + `StripCodeFences` pattern. Build: 0 errors, 0 warnings.

---

### Phase 3 — .NET API · `titulino-net-api`

> Requires T06 (RPC) from Phase 1. Can be developed in parallel with Phase 2 once T06 is live.

- [x] **T17** — Add `GetKnowMeAiResultAsync` to `ILrnManager` interface  
  Signature: `Task<KnowMeAiResultResponse> GetKnowMeAiResultAsync(Guid contactInternalId, string courseCodeId, int classNumber)`
- [x] **T18** — Implement `GetKnowMeAiResultAsync` in `LrnManager.cs`  
  Calls `_repositoryClient.GetKnowMeAiJobResultAsync`, parses raw JSON into `KnowMeAiResultResponse` with `JsonElement?` for correctedEssays + feedback. Returns `{ Status: "not_found" }` when no job exists.
- [x] **T19** — Add Supabase RPC call for `GetKnowMeAiJobResult` in net-api `SupabaseAdapter`  
  POSTs `{ contact_internal_id, course_code_id, class_number }` to `GetKnowMeAiJobResult`. Returns raw JSON string (or null if body is null/"null").
- [x] **T20** — Add `GET /v1/lrn/know-me/ai-result` to `Lrn.cs`  
  Auth: `AnyAuthenticatedUser`. Query params: `courseCodeId`, `classNumber`. Contact from JWT claims. Build: 0 errors.

---

### Phase 4 — React UI · `titulino-ui`

> Requires Phase 3 complete. Most user-visible phase.

- [x] **T21** — Remove `console.log("progressToUpsert", progressToUpsert)` from `LrnManager.js:766`
- [x] **T22** — Add `ON_FETCHING_KNOW_ME_AI_RESULT` constant to `constants/Lrn.js`
- [x] **T23** — Add `getKnowMeAiResult` service call to `TitulinoLrnNetService.js`  
  `GET /know-me/ai-result?courseCodeId=X&classNumber=Y`. Returns `{ success, aiStatus, correctedEssays, feedback, errorMessage }`.
- [x] **T24** — Add `getKnowMeAiResult(levelTheme, emailId, classNumber)` to `LrnManager.js`  
  Resolves courseCodeId via registry, uses `user.innerToken`, calls `TitulinoLrnNetService.getKnowMeAiResult`.
- [x] **T25** — Add `onFetchingKnowMeAiResult` Redux action to `Lrn.js`
- [x] **T26** — Update `KnowMeV3` — on load, fetch existing AI result  
  Mount effect fetches result; if `completed` hides form and shows result view; if `pending/processing` shows info banner.
- [x] **T27** — Update `KnowMeV3` — show pending/processing banner after successful submit  
  Optimistically sets `aiResult = { aiStatus: 'pending' }` after submit; polls every 10 s via `setInterval` until completed/failed.
- [x] **T28** — Update `KnowMeV3` — render corrected essays + per-question feedback when `status = completed`  
  Per-question cards with corrected text (green background) + AI feedback. Form hidden when completed. All tests pass (112/112).
- [x] **T29** — No new LOB logic added in Phase 4 — no tests needed.

---

### Phase 5 — AI Prompt Quality · `TitulinoWorkerService`

> Builds on Phase 2 foundation. Pins the output schema before T28 UI work finalizes.

- [x] **T30** — Design structured JSON output schema per essay question  
  Added `GrammarNotes` and `VocabularySuggestions` (`List<string>`) to `EssayResult.cs`.
- [x] **T31** — Grammar topic injection via static dictionary in `KnowMeAiManager`  
  `_grammarTopics` maps `q2_bio→Simple Present…`, `q3_bio→Simple Past`, `q4_bio→Future tenses`, `q5_bio→Present Perfect`. Speeches questions fall back to empty string (generic). `ProcessJobAsync` now sets `GrammarTopic` from the dictionary.
- [x] **T32** — Updated prompt template + all three provider parsers  
  `AiPromptHelper` JSON template now includes `grammarNotes` and `vocabularySuggestions` arrays with usage instructions. `AnthropicAiProvider.TryParseResult`, `OpenAiProvider.ParseResult`, `GeminiAiProvider.ParseResult` all extract the new array fields. Build: 0 errors, 0 warnings.
- [x] **T33** — Richer feedback serialization in `KnowMeAiManager` + UI rendering  
  `feedbackDict` now stores `{ summary, grammarNotes[], vocabularySuggestions[] }` per question. `KnowMeV3` renders summary text, grammar notes bullet list, and vocabulary suggestions bullet list. Tests: 112/112.

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
