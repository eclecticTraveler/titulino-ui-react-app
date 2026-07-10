# Titulino UI — Agent Entry Point

Auto-read by Claude Code every session. All other agents (Codex, Gemini, etc.) read this first.

---

## Every session — read in this order

1. **[docs/agents/README.md](docs/agents/README.md)** — documentation conventions for this project
2. **Most recent file in [docs/work-logs/](docs/work-logs/)** — highest YYYY-MM-DD filename = most recent session
3. **[docs/plans/active/](docs/plans/active/)** — if any plan files exist, read the most recent one; first unchecked step = where to resume
4. **Domain PROGRESS file** when working in a specific domain:
   - Testing → [docs/testing/PROGRESS.md](docs/testing/PROGRESS.md)

---

## Docs-first rule

Before reading any source file, before running grep, before spawning an Explore agent — **check docs/ first**.

| Looking for | Check first |
|---|---|
| How a layer works | [docs/Architecture.md](docs/Architecture.md) |
| Naming / coding rules | [docs/Coding Standards.md](docs/Coding%20Standards.md) |
| How to add a feature | [docs/Feature Workflow.md](docs/Feature%20Workflow.md) |
| How to build/deploy | [docs/Deployment.md](docs/Deployment.md) |
| What was done last session | [docs/work-logs/](docs/work-logs/) most recent file |
| Known unfixed bugs | [docs/known-bugs.md](docs/known-bugs.md) |
| Test batch status | [docs/testing/PROGRESS.md](docs/testing/PROGRESS.md) |

---

## Support scripts (pre-approved operations)

Use these scripts for all shell operations — do not construct the commands manually.
Run without `bash` prefix, from the project root.

| Script | Usage | Description |
|---|---|---|
| `run-tests.sh` | `.claude/support-scripts/run-tests.sh [pattern]` | Run all tests once. Optionally filter by name (e.g. `AdminTools`, `lob/__tests__`) |
| `run-tests-coverage.sh` | `.claude/support-scripts/run-tests-coverage.sh` | Run tests with coverage report output to `coverage/` |
| `run-build.sh` | `.claude/support-scripts/run-build.sh` | Production build — fails loudly on errors |
| `compile-less.sh` | `.claude/support-scripts/compile-less.sh` | Compile LESS → CSS. Run after any `.less` file change |
| `release.sh` | `.claude/support-scripts/release.sh` | Full release: bump version → update service worker cache → push branch + tags |

---

## Project layer map

```
Views (src/views/, src/components/)
    ↓ dispatch(action)
Redux Actions (src/redux/actions/)     ← async; calls manager or service; returns { type, payload }
    ↓ await Manager or Service
Manager (src/managers/)                ← orchestrates: calls services + applies LOB transforms
    ↓
Service (src/services/)                ← HTTP calls only; always returns safe default on error
    ↓ applies
LOB (src/lob/)                         ← pure domain logic; no HTTP, no Redux, no side effects
```

Full details: [docs/Architecture.md](docs/Architecture.md) · [docs/Coding Standards.md](docs/Coding%20Standards.md)

---

## Non-negotiable rules

1. Components never call services directly — go through Redux actions.
2. Services never contain business logic — that belongs in LOB files.
3. LOB files are pure functions — no HTTP, no Redux, no side effects, no `console.log`.
4. Services always `try/catch` and return a safe default (`[]`, `{}`, `false`) — they never throw.
5. All API URLs come from `EnvironmentConfig.js` (`env.ENDPOINT`) — never hardcode.
6. Do not test the service layer (REST calls). Test LOB files and Redux reducers.
7. LESS changes require `compile-less.sh` — `npm start` alone does not recompile LESS.
8. **Never filter, sort, or paginate data client-side as a substitute for backend filtering.** All business logic belongs in PostgreSQL. The frontend describes intent (parameters); the backend determines eligibility and results. If a filter is missing from the backend, add it to the stored procedure first — do not implement it in JavaScript. See [docs/audience-segmentation.md](docs/audience-segmentation.md) for the segmentation contract.
9. **All database changes (schema, functions, data migrations) must be Sqitch migrations in `titulino-warehouse` at `C:\Users\AlbertoArellano\Documents\WH-T\titulino-warehouse\`. Never write a one-off SQL script.** The agent creates the deploy/verify/revert SQL files and appends the entry to `sqitch.plan`. **The new entry must always go at the END of `sqitch.plan` — never inserted before an already-deployed change.** sqitch computes each change's SHA-1 from its position in the plan; inserting before a deployed change shifts its predecessor chain, breaks its hash, and corrupts `sqitch deploy/revert` for all future changes. (This happened 2026-07-10 and required manually reordering the plan to fix.)

---

## Custom agents

Agents in `.claude/agents/` are invoked with `@<agent-name>` in a conversation.

| Agent | When to use |
|---|---|
| *(none yet — add as needed)* | See [docs/agents/README.md](docs/agents/README.md) for how to create one |

---

## Commit workflow

1. Read `.claude/templates/commit-message.md` — fill in `type`, `Why`, `What`, `How to verify`
2. Stage specific files: `git add <file1> <file2>` — never `git add -A`
3. Commit using the filled template
4. Never force-push to `main`. Never use `--no-verify`.

## Release workflow (agent cannot run this alone)

The release push requires an SSH key passphrase. Claude Code's shell is non-interactive and cannot accept password prompts — the push will hang if the passphrase is not already cached.

**Human must run this first in their terminal (once per session):**
```
ssh-add
```

After that, the agent can run `.claude/support-scripts/release.sh` which does:
1. `standard-version` — bumps version in package.json, updates CHANGELOG.md, commits, creates git tag
2. `bumpCacheVersion.js` — syncs the new version into `public/service-worker.js` cache name and asset paths
3. `git push --follow-tags origin <current-branch>` — pushes commits and tags

**Never run release.sh without confirming ssh-add has been run.** Ask the user to confirm before executing.

---

## End-of-session checklist

- [ ] Work log entry written in `docs/work-logs/YYYY-MM-DD.md` with results + next-session notes
- [ ] Domain PROGRESS.md updated (completed items marked ✅)
- [ ] All tests still pass: `.claude/support-scripts/run-tests.sh`
- [ ] No console.log, TODO comments, or debug code left in committed files
