# Agent Workflow — Plan Before Code

Every non-trivial task follows this five-phase workflow.
"Non-trivial" = anything that touches more than one file or takes more than 15 minutes.

---

## Phase 1 — Orient (every session)

Before touching anything:

1. Read `CLAUDE.md` (root) — project map and non-negotiable rules
2. Read most recent file in `docs/work-logs/` — what was done last
3. Check `docs/plans/active/` — if a plan exists for this task, read it and find the first unchecked step
4. If continuing an existing plan: go directly to Phase 4

---

## Phase 2 — Plan (new tasks only)

Do this before writing any code.

1. Read the business brief carefully — ask "what exactly changes, and what definitely does not?"
2. Create a plan file: `docs/plans/active/YYYY-MM-DD-[short-slug].md`
3. Copy the template from `docs/agents/PLAN-TEMPLATE.md` — fill in every section
4. Write atomic steps:
   - Each step changes exactly ONE thing in ONE place
   - The system is in a valid state after each step (not just at the end)
   - Each step has a "Done when:" condition that is verifiable without judgment
   - Maximum scope per step: one function, one component, one migration, one test file
5. Run the Guardrail Check (see `docs/agents/GUARDRAILS.md`)
6. Present the plan to the user and wait for approval — do not begin Phase 4 without it

### What makes a step atomic

| ✅ Atomic | ❌ Not atomic |
|---|---|
| "Add `getDivisionData()` to `ExperienceService.js`" | "Update the services layer" |
| "Add reducer case `SET_DIVISION_DATA` in `Lrn.js`" | "Wire up Redux for divisions" |
| "Add `alreadyEnrolled` flag in `CourseRegistrationCatalog.js`" | "Update the enrollment flow" |
| "Write test for `buildCourseUpsertPayload` empty input" | "Write tests for AdminTools" |

---

## Phase 3 — Review loop (before execution)

Read the plan back as if you are a different agent seeing it for the first time.

Ask:
- Does every step in the brief have a corresponding step in the plan?
- Is there anything in the plan not in the brief? (scope creep — remove it or note it as discovered/out-of-scope)
- Can each step be understood in isolation without reading the others?
- Does any step contain more than one change? (split it if so)
- Does the Guardrail Check pass?

If any answer is "no": revise the plan before proceeding. Do not execute a plan with open review questions.

---

## Phase 4 — Execute (one step at a time)

1. Read the first unchecked step from the plan
2. Verify: is this step still valid? Did a previous step change the context?
3. Execute the step — one change, one place
4. Verify the "Done when:" condition before marking it complete
5. Mark the step ✅ in the plan file
6. If this is the last step before a session ends: write a work-log entry (see below)
7. Repeat from step 1

### What to do if execution reveals a problem

- **Found a related bug not in the plan**: add it to "Discovered / Out of scope" in the plan — do not fix it silently. It becomes backlog.
- **A step is blocked by something unexpected**: stop, add a note to the plan, write a work-log entry explaining the blocker, and ask the user
- **A step would violate a guardrail**: hard stop — do not proceed without unlock phrase

---

## Phase 5 — Record (end of every session)

Write a work-log entry in `docs/work-logs/YYYY-MM-DD.md` (append to bottom):

```markdown
## Domain: [Testing | Feature | Bug Fix | Refactor | etc.]

### Context
[One sentence: what plan was being executed and where it started]

### Work done
[Which steps were completed. Reference the plan file.]

### Results
[Observable outcome: tests pass, feature renders, API returns correctly]

### Lessons / corrections
[Anything surprising, wrong assumptions, things to watch for next time]

### Next session
[First unchecked step in the plan. Or "Plan complete — move to docs/plans/completed/"]
```

Update the Session log table inside the plan file itself.

If the plan is complete: move it from `docs/plans/active/` to `docs/plans/completed/`.

---

## How resumption works

When picking up a partially-done task in a new session:

1. Phase 1: Orient (read CLAUDE.md, work-log, check plans/active/)
2. Find the plan file in `docs/plans/active/`
3. Scan for the first unchecked step — that's where execution resumes
4. Read the Session log in the plan to understand what the previous session did
5. Continue from Phase 4 — no need to re-plan

The plan file is the source of truth for task state. Work logs provide the narrative. Both together mean any agent can resume without a conversation handoff.

---

## Summary table

| Phase | When | Output |
|---|---|---|
| 1 — Orient | Start of every session | Current understanding of project state |
| 2 — Plan | New tasks only | `docs/plans/active/YYYY-MM-DD-slug.md` |
| 3 — Review | After planning, before executing | Approved plan |
| 4 — Execute | During work | ✅ steps in plan, changed source files |
| 5 — Record | End of every session | Work-log entry, updated plan session log |
