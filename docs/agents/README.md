# Agent Documentation Rules

This file defines how AI agents (Claude, Codex, Gemini, or any future agent) read and write documentation in this project. Follow these rules consistently so any agent can pick up where the last one left off.

---

## The files every agent reads before starting work

| File | What it contains | When to read |
|---|---|---|
| `CLAUDE.md` (root) | Project overview, layer map, quick rules | Every session, automatically |
| `docs/work-logs/YYYY-MM-DD.md` (most recent) | What was done last — decisions, files changed, lessons learned | Every session |
| `docs/plans/active/` (most recent, if any) | In-progress task plan with atomic steps and checkboxes — first unchecked step = where to resume | Every session |
| `docs/{domain}/PROGRESS.md` | Status of all work items for that domain (testing, bugs, features) | When working in that domain |

## Plan-before-code workflow

Non-trivial tasks (multi-file or >15 min) follow a 5-phase workflow. Read these before starting:

| File | Purpose |
|---|---|
| `docs/agents/WORKFLOW.md` | The 5 phases: Orient → Plan → Review → Execute → Record |
| `docs/agents/GUARDRAILS.md` | Hard stops, soft stops, credential rules, scope guardrails |
| `docs/agents/PLAN-TEMPLATE.md` | Template for task plan files in `docs/plans/active/` |
| `docs/prompts/EXAMPLES.md` | Reusable prompt patterns: Bootstrap, Investigation, Self-planning |

Plans live in:
- `docs/plans/active/` — in-progress tasks (YYYY-MM-DD-slug.md)
- `docs/plans/completed/` — finished tasks (archived, not deleted)

---

## Daily work log — how to write and read

### Location

All daily work goes in `docs/work-logs/`. One file per day, named `YYYY-MM-DD.md`.

```
docs/work-logs/
  2026-06-24.md    ← oldest
  2026-06-25.md
  2026-06-26.md    ← newest (highest date = most recent)
```

### How to find the most recent log

The file with the highest date in `docs/work-logs/` is the most recent. Sort filenames descending alphabetically — YYYY-MM-DD format guarantees the last file alphabetically is the newest.

### How to read a daily log

Read **top to bottom** — entries are written in the order work happened that day.

### How to write a daily log

- **New session on an existing day**: append a new section to the BOTTOM of today's file.
- **New day**: create a new file `docs/work-logs/YYYY-MM-DD.md` using the template below.
- **Do not edit past days** — past logs are an immutable record. If something was wrong, correct it in today's log under "Corrections."

### Daily log file template

```markdown
# YYYY-MM-DD — [Brief description of main work today]

## Domain: [Testing | Bug Fix | Feature | Refactor | Deployment | Other]

### Context
[One paragraph: why this work is being done, what was the state before you started]

### Work done
[What files were created or changed, and why. Non-technical level of detail is fine — focus on WHAT and WHY, not HOW]

### Results
[Outcome: tests passed, bug resolved, feature shipped, etc.]

### Lessons / corrections
[Anything that tripped you up, fixed assumptions, data shapes that were wrong, etc.]

### Next session
[Specific actionable notes for whoever picks this up next]
```

---

## Domain PROGRESS files — how to write and read

Each domain has its own `docs/{domain}/PROGRESS.md`. Examples:
- `docs/testing/PROGRESS.md` — all test batches
- `docs/bugs/PROGRESS.md` — bug tracking (create when needed)
- `docs/features/PROGRESS.md` — feature work (create when needed)

### How to read a PROGRESS file

- Status icons: ✅ Done · 🔄 In progress · ⬜ Not started
- Read the status column to know what's done and what's next.

### How to update a PROGRESS file

- Mark items ✅ as soon as they are completed — not at end of session.
- Add new items to the appropriate section when planning new work.
- Do NOT delete completed items — the record of what was done matters.

---

## Adding a new domain

When you start a new category of work (e.g. bug fixing, feature development):

1. Create `docs/{domain}/` folder.
2. Create `docs/{domain}/PROGRESS.md` with a clear header describing what this domain tracks.
3. Add a line to `CLAUDE.md` under "Start here" pointing to the new PROGRESS file.
4. Write a daily log entry in `docs/work-logs/YYYY-MM-DD.md` explaining what the new domain is for.

---

## What NOT to put in daily logs

- Code snippets — those belong in the source files or test files.
- Full function signatures — reference the source file path instead.
- Opinions about code quality — keep entries factual.
- Anything that is already tracked in a PROGRESS file — just reference it.

---

## Folder map (docs/)

```
docs/
  CLAUDE.md (root, not in docs/)   ← Agent entry point — read every session
  agents/
    README.md                       ← This file — documentation system rules
  work-logs/
    YYYY-MM-DD.md                   ← Daily logs, all domains
  testing/
    PROGRESS.md                     ← Test batch tracker
    (individual test strategy files if needed)
  Architecture.md                   ← System architecture
  Coding Standards.md               ← Layer rules, naming conventions
  Feature Workflow.md               ← How to build a new feature
  Deployment.md                     ← How to build and deploy
```

---

## Checklist for ending a session

Before closing out a work session, an agent should:

- [ ] Daily log entry written in `docs/work-logs/YYYY-MM-DD.md` with results and next-session notes
- [ ] Domain PROGRESS.md updated (completed items marked ✅)
- [ ] No TODOs left as code comments — either done or tracked in PROGRESS.md
