# Agent Setup Template

Reusable starting point for making any new codebase AI-agent-ready.
Copy the skeletons below, fill in the [PLACEHOLDERS], and you have a complete setup
that any agent (Claude, Codex, Gemini) can follow from the first session.

---

## Folder structure to create

```
[project-root]/
  CLAUDE.md                        ← Agent entry point. Claude Code reads this automatically.
  AGENTS.md                        ← Same content. For non-Claude agents that look for this file.

  .claude/
    support-scripts/
      run-tests.sh                 ← Canonical test command for this project
      run-build.sh                 ← Canonical build command
      run-lint.sh                  ← Canonical lint/static-analysis command
      (add more as needed)
    templates/
      commit-message.md            ← Why / What / How template
    agents/
      (add .md files here for named sub-agents — invoke with @agent-name)
    agent-memory/
      (one subfolder per agent — stores cross-session notes)

  docs/
    agents/
      README.md                    ← Documentation conventions (copy from Titulino)
      TEMPLATE.md                  ← This file
      WORKFLOW.md                  ← 5-phase plan-before-code workflow
      GUARDRAILS.md                ← Hard stops, soft stops, credential rules
      PLAN-TEMPLATE.md             ← Template for task plan files
    plans/
      active/                      ← In-progress task plans (YYYY-MM-DD-slug.md)
      completed/                   ← Archived finished plans
    prompts/
      EXAMPLES.md                  ← Reusable prompt patterns (Bootstrap, Investigation, Self-planning)
    work-logs/
      YYYY-MM-DD.md                ← Daily cross-domain work logs (append to bottom)
    [domain]/
      PROGRESS.md                  ← One per active work domain (testing, bugs, features)
    Architecture.md
    Coding Standards.md
    Feature Workflow.md
    Deployment.md
```

---

## CLAUDE.md skeleton

```markdown
# [PROJECT_NAME] — Agent Entry Point

Auto-read by Claude Code every session. All other agents read this first.

---

## Every session — read in this order

1. [docs/agents/README.md] — documentation conventions
2. Most recent file in [docs/work-logs/] — highest YYYY-MM-DD = most recent session
3. Domain PROGRESS file if working in a specific area:
   - Testing → [docs/testing/PROGRESS.md]
   - Bugs → [docs/bugs/PROGRESS.md]

---

## Docs-first rule

Before reading source, before grep, before Explore agent — check docs/ first.

| Looking for | Check first |
|---|---|
| Architecture / layers | docs/Architecture.md |
| Naming / coding rules | docs/Coding Standards.md |
| How to add a feature | docs/Feature Workflow.md |
| Build / deploy | docs/Deployment.md |
| What was done last session | docs/work-logs/ (most recent file) |

---

## Support scripts

Run from project root without `bash` prefix.

| Script | Usage | Description |
|---|---|---|
| run-tests.sh | .claude/support-scripts/run-tests.sh [pattern] | Run tests |
| run-build.sh | .claude/support-scripts/run-build.sh | Build |
| run-lint.sh | .claude/support-scripts/run-lint.sh | Lint / static analysis |

---

## Layer map

[Draw your layer diagram here — 5 lines max]

[Layer 1] → [Layer 2] → [Layer 3] → [Layer 4]

Full details: docs/Architecture.md · docs/Coding Standards.md

---

## Non-negotiable rules

[List 5–8 specific rules — concrete, testable, no vague statements]

1.
2.
3.

---

## Commit workflow

1. Read .claude/templates/commit-message.md
2. git add <specific files> — never git add -A
3. Commit with filled template
4. Never force-push to main/master. Never --no-verify.

---

## End-of-session checklist

- [ ] Work log entry written in docs/work-logs/YYYY-MM-DD.md
- [ ] Domain PROGRESS.md updated
- [ ] All tests pass: .claude/support-scripts/run-tests.sh
- [ ] No debug code or console.log left in committed files
```

---

## docs/Architecture.md skeleton

```markdown
# Architecture — [PROJECT_NAME]

## Overview
[2–3 sentences: what this system does, what problem it solves]

## Technology stack
| Concern | Technology |
|---|---|
| Framework | |
| State management | |
| HTTP / API | |
| Styling | |
| Auth | |
| Testing | |
| Build | |
| Hosting | |

## Layer architecture
[Diagram — show the data flow from UI to storage in one block]
Layer 1 (entry)
  ↓ how it calls Layer 2
Layer 2
  ↓
Layer 3
  ↓
Layer 4 (data / storage)

## Folder structure
[Only the top-level src/ or app/ folders — not every file]

## External integrations
| Service | Purpose |
|---|---|

## Environments
| Name | URL | Config key |
|---|---|---|
```

---

## docs/Coding Standards.md skeleton

```markdown
# Coding Standards — [PROJECT_NAME]

## The core rule: layer responsibilities

| Layer | Location | Responsibility | Must NOT do |
|---|---|---|---|
| [Layer 1] | src/... | | |
| [Layer 2] | src/... | | |
| [Layer 3] | src/... | | |

## Layer 1 — [name]
[Rules + one positive example + one anti-pattern]

## Layer 2 — [name]
[Rules + one positive example + one anti-pattern]

## Layer 3 — [name]
[Rules + one positive example + one anti-pattern]

## Naming conventions
| What | Convention | Example |
|---|---|---|

## What AI agents must know
[8–12 numbered rules — the most common mistakes and most important invariants]
1.
2.
...
```

---

## docs/Feature Workflow.md skeleton

```markdown
# Feature Workflow — [PROJECT_NAME]

## Step 1 — Identify what you are adding
| What | Where it goes |
|---|---|

## Step 2 — Implementation order (build bottom-up)
1. [lowest layer — data/storage]
2.
3.
4. [highest layer — UI/entry point]

## Pattern A — [most common feature type]
[Step-by-step with code examples per layer]

## Pattern B — [second most common]

## Pre-merge checklist
- [ ]
- [ ]
- [ ]
```

---

## docs/Deployment.md skeleton

```markdown
# Deployment — [PROJECT_NAME]

## Environments
| Environment | URL | Trigger |
|---|---|---|

## CI/CD pipeline
[File path, trigger conditions, build steps]

## Local development
[Prerequisites + start command]

## Build
[Command + what it produces]

## Environment variables / secrets
| Variable | Purpose |
|---|---|

## How to rollback
[Steps]

## Monitoring
[Where to look when something breaks]
```

---

## docs/agents/README.md

Do not recreate this — copy it directly from the Titulino project at:
`docs/agents/README.md`

It contains the conventions for work logs, PROGRESS files, and daily entries.
The only thing to change is the folder structure diagram at the bottom.

---

## What to write in Coding Standards — what makes rules good

Rules in Coding Standards are only useful if they are:

- **Specific** — "Services always return `[]` on error" not "handle errors properly"
- **Testable** — a reviewer can verify the rule was followed without judgment calls
- **Negative examples included** — "never do X" is more memorable than "do Y"
- **Ordered by how often an agent will need them** — most important = first

Avoid:
- "Write clean code" — not actionable
- "Follow best practices" — meaningless without context
- Rules that duplicate what a linter already enforces

---

## What to put in the "docs-first" table

List the specific directories or files that contain information an agent would
otherwise read source files to discover. Examples:

- Model/entity documentation (schema, relationships)
- API endpoint reference
- Environment variable reference
- Feature flag inventory
- Known gotchas or non-obvious invariants

The value: an agent reading a 2KB doc file instead of grep-ing 50 source files
saves context window, reduces hallucinations, and is faster.

---

## Agent writing style (for docs in docs/agents/ and .ai/)

Write in caveman format — optimized for LLM consumption:
- Drop articles: "the", "a", "an"
- Drop filler: "in order to", "it is important to", "please note that"
- Use fragments: "Fetch data. Apply transform. Return result."
- Preserve ALL technical substance: class names, method names, constants, file paths
- Preserve code blocks exactly as-is

Human-facing docs (Architecture.md, Feature Workflow.md, etc.) use normal prose.
Agent-facing docs (agents/README.md, CLAUDE.md) use caveman format.

---

## Checklist for a new project

- [ ] `CLAUDE.md` at root — filled with layer map, non-negotiable rules, support scripts, plans/active/ in read order
- [ ] `AGENTS.md` at root — same content (for non-Claude agents)
- [ ] `.claude/support-scripts/` — at minimum: run-tests.sh, run-build.sh
- [ ] `.claude/templates/commit-message.md` — Why / What / How sections
- [ ] `docs/agents/README.md` — copy from Titulino, update folder diagram
- [ ] `docs/agents/WORKFLOW.md` — copy from Titulino (5-phase plan-before-code workflow)
- [ ] `docs/agents/GUARDRAILS.md` — copy from Titulino, update hard-stop list for this project's risk surface
- [ ] `docs/agents/PLAN-TEMPLATE.md` — copy from Titulino unchanged
- [ ] `docs/plans/active/` and `docs/plans/completed/` — folders created
- [ ] `docs/prompts/EXAMPLES.md` — copy Bootstrap and Self-planning examples; add project-specific investigation example
- [ ] `docs/Architecture.md` — layer diagram, stack, folder map
- [ ] `docs/Coding Standards.md` — layer rules, naming, 8–12 agent rules
- [ ] `docs/Feature Workflow.md` — build order, 2–3 patterns with examples
- [ ] `docs/Deployment.md` — commands, envs, secrets, rollback
- [ ] `docs/work-logs/` — folder exists, ready for first daily log
- [ ] `docs/testing/PROGRESS.md` (or first domain PROGRESS file)
