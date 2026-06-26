# Get Started — Human Guide

How to trigger agent prompts as a human in Claude Code or any other AI agent.

---

## Scenario 1 — Project already has CLAUDE.md set up (like this one)

Claude Code reads `CLAUDE.md` automatically every time you open a new conversation.
You do not need to trigger anything — the agent is already oriented.

The **Bootstrap prompt (Type 1)** is only useful here if you want to explicitly verify
the agent understood the project before starting work. To trigger it:

> "Run the bootstrap prompt from docs/prompts/EXAMPLES.md for this project."

The agent will find the file because CLAUDE.md is already loaded and points to the docs folder.

---

## Scenario 2 — Brand-new project (no CLAUDE.md yet)

The agent has zero context. You cannot say "do Type 1" because it does not know the file exists.

### Option A — Paste the prompt directly (recommended)

1. Open [docs/prompts/EXAMPLES.md](EXAMPLES-PLACEHOLDER) in the project you are copying from
2. Copy the **Type 1 — Bootstrap** prompt block
3. Replace `[PROJECT_NAME]` with the actual project name
4. Paste it as your first message to the agent

No setup needed. Works in any agent (Claude Code, Codex, Gemini, etc.).

### Option B — Point the agent to the file

Only works if you have already run the [TEMPLATE.md](TEMPLATE.md) checklist and the `docs/` folder exists.

First message:

> "Read docs/prompts/EXAMPLES.md and run the Type 1 Bootstrap prompt for this project."

The agent reads the file, fills in the project name, and runs the orientation sequence.

---

## The correct order for a truly new codebase

1. **Set up the docs** — follow the checklist in [docs/agents/TEMPLATE.md](TEMPLATE.md).
   This is one manual session where you (or an agent) create all the skeleton files.
2. **From that point on** — Claude Code reads `CLAUDE.md` automatically every session.
   No manual trigger needed.
3. **Type 1 becomes optional** — a sanity check, not a daily ritual.

---

## Triggering other prompt types

| What you want to do | What to say |
|---|---|
| Orient a fresh agent (new session) | "Run the bootstrap prompt from docs/prompts/EXAMPLES.md" |
| Investigate a bug (trace data flow) | Paste the **Type 2 Investigation** template from EXAMPLES.md, fill in the blank fields |
| Start a non-trivial task with a plan | Paste the **Type 3 Self-planning** template from EXAMPLES.md, paste your business requirement |
| Unlock a hard stop (e.g. DROP TABLE) | Add the exact unlock phrase to your message — see [docs/agents/GUARDRAILS.md](GUARDRAILS.md) |

For the full prompt library: [docs/prompts/EXAMPLES.md](../prompts/EXAMPLES.md)
