# Prompt Examples

Reusable prompt patterns for common agentic tasks.
Three types: Bootstrap · Investigation · Self-planning.

---

## Type 1 — Bootstrap: Orient a fresh agent to this project

Use at the start of any session where the agent has no prior context.

```
You are starting work on the [PROJECT_NAME] codebase.

Before doing anything else:
1. Read CLAUDE.md at the project root
2. Read docs/agents/README.md
3. Read the most recent file in docs/work-logs/ (highest YYYY-MM-DD filename)
4. Check docs/plans/active/ — if any plan files exist, read the most recently dated one

Then tell me:
- What layer pattern does this app use? (one-sentence summary)
- What are the 3 most important rules from Coding Standards?
- What was the last thing worked on (from the work log)?
- Is there an active plan in docs/plans/active/? If yes, what step is it on?

Do not write any code. Confirm your understanding first.
```

---

## Type 2 — Investigation / Diagnostic: Trace a specific bug

Use when you need to understand a data flow, find a root cause, or trace a blank/missing value.

### Example: Division data flow bug in Surveys view (CIP app)

```
I need you to trace a data flow bug in a React app. Here is the context:

Project type: React app with Redux, PostgREST-style API (warehouse.homecarepulse.com),
services in src/services/, shared logic in src/shared-logic/ReactPocSharedLogic.js,
Redux actions in src/redux/actions/.

Bug: In the Experience > Surveys view (route: /experience/surveys), the "Division"
column renders blank for some companies in a CompanyGroup/corporate account.
Specifically PA branches (Lancaster, Mechanicsburg, Reading) for BAYADA.

Task: Trace how the Division column is populated end-to-end:
1. Find the component that renders the Surveys table for a CompanyGroup user
2. Find the two API calls that build each row — one for survey responses,
   one for Division (CompanyGroupName) data
3. Identify the exact endpoint URL for the Division lookup call,
   including all query filters hardcoded in it
4. Find the Content-Profile header value used on that call
5. Find the merge function that joins Division onto survey rows,
   and explain under what condition a row ends up with a blank Division

Report: file paths with line numbers, endpoint URLs, the Content-Profile value,
and the specific filter condition that would cause PA branches to return no Division data.
Do not fix anything. Diagnose only.
```

**Findings from this trace (for reference):**

| Item | Value |
|---|---|
| Division lookup endpoint | `Report_SurveyResponseValueSingle_CompanyGroup` |
| Content-Profile / Accept-Profile | `AgpSurvey` |
| Hardcoded filter | `CompanyGroupName=ilike.%division%&CompanyGroupTypeId=eq.CustomUnit` |
| Merge key | `CompanyId` |
| Merge function | `getMergedObjectArrays` in `src/shared-logic/ReactPocSharedLogic.js:10` |
| Root cause | PA branches missing — `CompanyGroupName` doesn't contain "division" or `CompanyGroupTypeId` ≠ `CustomUnit` |

---

### Investigation prompt template (generic)

```
I need you to trace [what is wrong or missing] in [which view or feature].

Context:
- Project type: [framework, key folders, API style]
- Symptom: [what the user sees, what value is wrong/blank/missing]
- Affected case: [specific user, company, or data that triggers it]

Task: Trace [the specific value] end-to-end:
1. Find the component that renders [the thing]
2. Find the data source (API call, Redux action, service method)
3. Find the exact endpoint URL and any hardcoded filters
4. Find the transform or merge that produces the final value
5. Identify the exact condition under which [the wrong/blank value] appears

Report: file paths with line numbers, endpoint URLs, filter conditions,
and the specific scenario that causes the bug.
Do not fix anything yet. Diagnose only.
```

---

## Type 3 — Self-planning: Agent reads a brief and creates its own plan

Use when starting any non-trivial task. The agent writes the plan, validates it, and waits for your approval before touching any code.

```
You are working in [PROJECT_NAME].

Read these files before doing anything:
1. CLAUDE.md
2. docs/agents/README.md
3. docs/agents/WORKFLOW.md
4. docs/agents/GUARDRAILS.md
5. Most recent file in docs/work-logs/

Here is the business requirement:

---
[PASTE YOUR REQUIREMENT HERE]
---

Phase 1 — Plan:
Before writing any code, create a plan file at:
  docs/plans/active/[TODAY'S DATE]-[3-word-slug].md

Use the template at docs/agents/PLAN-TEMPLATE.md. Fill in every section:
- Business brief: paste the requirement above exactly
- Scope: specific files and components that will change
- Out of scope: what will NOT be touched
- Guardrail check: run through docs/agents/GUARDRAILS.md
- Atomic steps: each step must change exactly one thing, in one place,
  with a verifiable "Done when:" condition

Phase 2 — Review:
After writing the plan, read it back and check:
- Does every part of the brief have a corresponding step?
- Is there anything in the plan NOT in the brief? (remove it or note as out-of-scope)
- Can each step be understood without reading the others?
- Does any step contain more than one change? (split it)
- Does the Guardrail Check pass?

Phase 3 — Present:
Show me the plan. Do not execute any step until I approve it.

Phase 4 — Execute (after approval):
Work one step at a time. Before moving to the next step, verify the "Done when:" condition.
Mark each step ✅ in the plan file as you complete it.

Phase 5 — Record:
At the end of the session, write a work-log entry in docs/work-logs/[TODAY].md.
Update the Session log table in the plan file.
If all steps are done, move the plan to docs/plans/completed/.
```

---

## Prompt modifiers (add to any prompt above)

These phrases modify what the agent is allowed to do. Reference GUARDRAILS.md for the full list.

| Add this phrase to the prompt | What it unlocks |
|---|---|
| `"confirmed: destructive db operation"` | Allows DROP TABLE, TRUNCATE, DELETE without WHERE |
| `"confirmed: migrate production"` | Allows running migrations against production DB |
| `"confirmed: force push to main"` | Allows git push --force to main/master |
| `"read only — no file changes"` | Agent diagnoses/reports only, writes nothing |
| `"skip plan phase — execute directly"` | Skips planning for trivial tasks (single-file, <15 min) |

---

## How to add a new example to this file

When a prompt produces useful findings or a reusable pattern:

1. Add it under the appropriate Type section
2. Include the original prompt in a code block
3. If it was an investigation, add a "Findings" table below it
4. Keep the generic template version of the same pattern up to date

This file becomes the library that prevents re-inventing prompts for known scenarios.
