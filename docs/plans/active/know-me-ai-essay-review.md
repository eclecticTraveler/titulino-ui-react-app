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

### Phase 6 — Bilingual Feedback + UI Polish

> Requires Phase 5 complete. Adds native-language feedback alongside English and redesigns the result card layout.

**Goal:** Language learners should be able to read their AI feedback in their own language (Spanish, Portuguese, etc.) as well as English. The current result view also has two visual bugs: grammar notes render raw `**markdown**` instead of bold text, and the student's original answer is not shown — there is no contrast between what they wrote and the correction.

**Design target (per question card):**

```
┌─────────────────────────────────────────────────────────┐
│  Question title                                          │
│                                                          │
│  YOUR ANSWER  (neutral gray)                            │
│  ┌─ original text ─────────────────────────────────┐   │
│  └────────────────────────────────────────────────┘   │
│                                                          │
│  CORRECTED VERSION  (green — as now)                     │
│  ┌─ corrected text ────────────────────────────────┐   │
│  └────────────────────────────────────────────────┘   │
│                                                          │
│  🇺🇸  ENGLISH FEEDBACK                                  │
│  Summary paragraph.                                      │
│  Grammar notes:  1. …  2. …                             │
│  Vocabulary:  • …                                       │
│                                                          │
│  🇪🇸  RETROALIMENTACIÓN EN ESPAÑOL  (or 🇧🇷 / other)   │
│  Same structure, translated by the AI.                   │
└─────────────────────────────────────────────────────────┘
```

The language of the second section is driven entirely by the `NativeLanguageId` on the course — no hardcoding. If a job has no native language (legacy rows), only the English section renders.

---

#### Layer 1 — Database · `titulino-warehouse`

> No schema change to `KnowMeAiJob`. `NativeLanguageId` is derived at claim time via a JOIN — no denormalization needed.

- [x] **T34** *(15 min)* — Update `ClaimNextPendingKnowMeAiJob` wrapper to derive `NativeLanguageId` from `Enrollment.Course` at claim time  
  After claiming the job row, do a secondary `SELECT "NativeLanguageId" INTO v_native_language FROM "Enrollment"."Course" WHERE "CourseCodeId" = v_job."CourseCodeId"` then include it in the `jsonb_build_object(…, 'NativeLanguageId', v_native_language)` return value. Returns NULL cleanly when course has no language set. No `ALTER TABLE` required.

- [x] **T35** *(15 min)* — Update `GetKnowMeAiJobResult` wrapper to also return `OriginalEssays`  
  Add `'OriginalEssays', j."EssaysJson"` to the result. This enables the UI to show the student's original answer without a second query.

---

#### Layer 2 — Worker · `TitulinoWorkerService`

- [x] **T36** *(15 min)* — Add `NativeLanguageId` to `IKnowMeAiJob` interface and its model  
  `string? NativeLanguageId { get; }` — nullable because legacy DB rows have NULL.

- [x] **T37** *(30 min)* — Pass `NativeLanguageId` into the AI prompt  
  `KnowMeAiManager.ProcessJobAsync` passes `job.NativeLanguageId` to `CorrectEssaysAsync`.  
  `IAiCorrectionService.CorrectEssaysAsync` gains `string? nativeLanguageId` parameter.  
  All three providers pass it to `AiPromptHelper.BuildEssayCorrectionPrompt`.

- [x] **T38** *(45 min)* — Update `AiPromptHelper` prompt template for bilingual output  
  When `nativeLanguageId` is non-null/non-empty, the prompt instructs the AI to provide a second `feedbackNative` block identical in structure to `feedback` but written entirely in the native language.  
  **Plain text rule added:** instruct the AI to NOT use markdown syntax (`**bold**`, `_italic_`) in any text fields — use plain sentences only.  
  New output schema per essay:
  ```json
  {
    "questionId": "…",
    "correctedText": "…",
    "feedback": {
      "summary": "…",
      "grammarNotes": ["…"],
      "vocabularySuggestions": ["…"]
    },
    "feedbackNative": {           // omitted if nativeLanguageId is null
      "summary": "…",
      "grammarNotes": ["…"],
      "vocabularySuggestions": ["…"]
    }
  }
  ```

- [x] **T39** *(45 min)* — Update `EssayResult` model + all three provider parsers  
  Add `FeedbackNative` property (nullable `EssayFeedback?` object with same fields as the existing feedback). All three providers (`Gemini`, `OpenAi`, `Anthropic`) parse `feedbackNative` from the response. Falls back to null cleanly if field is absent.

- [x] **T40** *(20 min)* — Update `KnowMeAiManager` feedback serialization  
  `feedbackDict` per question now serializes both `feedback` and `feedbackNative` (when present).  
  DB column `FeedbackJson` format becomes:
  ```json
  {
    "q1_intro": {
      "summary": "…",
      "grammarNotes": ["…"],
      "vocabularySuggestions": ["…"],
      "native": {
        "languageId": "es",
        "summary": "…",
        "grammarNotes": ["…"],
        "vocabularySuggestions": ["…"]
      }
    }
  }
  ```
  Note: `native.languageId` is stored so the UI can resolve the correct flag without knowing the course.

---

#### Layer 3 — .NET API · `titulino-net-api`

- [x] **T41** *(20 min)* — Add `OriginalEssays` to `KnowMeAiResultResponse`  
  `public JsonElement? OriginalEssays { get; set; }` — maps from `OriginalEssays` field returned by `GetKnowMeAiJobResult`.  
  `LrnManager.GetKnowMeAiResultAsync` maps the new field alongside the existing ones. No schema migration needed — the DB RPC already returns it after T36.

---

#### Layer 4 — React UI · `titulino-ui`

- [x] **T42** *(30 min)* — Add `originalEssays` to `TitulinoLrnNetService.getKnowMeAiResult`  
  Map `result?.originalEssays` → pass through manager → Redux action → component state.

- [x] **T43** *(90 min)* — Redesign completed result view in `KnowMeV3.js`  
  Per-question card layout (in render order):
  1. Question title  
  2. **Your Answer** — neutral gray box, `originalEssays[q.id]` (hidden if null for legacy jobs)  
  3. **Corrected Version** — existing green box  
  4. **🇺🇸 English Feedback** — summary + numbered grammar notes + vocabulary  
  5. **Native language section** — rendered only when `feedback[q.id].native` is non-null; flag emoji + section label driven by `native.languageId` via a small static map (`es` → `🇪🇸 Español`, `pt` → `🇧🇷 Português`, etc.)  
  Grammar notes use a numbered `<ol>` instead of a bullet `<ul>` to make them feel like structured lessons, not a loose list.  
  No markdown parsing needed — T39 removes markdown from AI output entirely.

---

#### Known bug fixed by this phase

- **Raw `**markdown**` in grammar notes** — visible in current production output. Caused by the AI prompt not specifying plain-text output. Fixed by T39 (prompt rule) plus the fact that new jobs will no longer contain markdown. Existing completed jobs with markdown will still show raw `**` — acceptable since they are test data.

---

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
