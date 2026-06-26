# Agent Guardrails

Rules checked before writing any code and before each execution step.
Violation = stop and ask the user. No exceptions.

---

## Hard stops — never without explicit written approval in the task prompt

These are blocked by default. The task prompt must contain the exact phrase in the "Unlock phrase" column to allow it.

| Operation | Unlock phrase required |
|---|---|
| `DROP TABLE`, `TRUNCATE`, `DELETE` without a `WHERE` clause | "confirmed: destructive db operation" |
| Production API keys or passwords written into source files | "confirmed: credential in source" |
| Modifying a migration file that has already been run in production | "confirmed: modify run migration" |
| `git push --force` to main/master | "confirmed: force push to main" |
| Deleting files that are not generated artifacts | "confirmed: delete source file" |
| Modifying `.env.production` or any `.env` file with real credentials | "confirmed: edit production env" |

If the task prompt does not contain the unlock phrase, output:

> "HARD STOP: [operation] requires explicit approval. Add '[unlock phrase]' to the task prompt to proceed."

---

## Soft stops — flag before proceeding, not a full block

Check these and note them in the plan. If any are present, state them clearly in the plan's Guardrail Check section.

| Situation | What to do |
|---|---|
| Editing a shared component used in more than 3 places | List all call sites in the plan. Note the blast radius. |
| Renaming a public API endpoint or Redux action type | Note every place that calls it — plan must include all update steps |
| Removing a dependency from package.json | Check if anything else imports it first |
| Changing a default value or fallback that existing data depends on | Note the data impact |
| Test deletion | Explain in the plan why it's being removed |

---

## Scope guardrails — prevent silent drift

These protect the plan from expanding uncontrolled during execution.

| Rule | Why |
|---|---|
| If a step was not in the approved plan, do not execute it | Prevents feature creep |
| If you find a related bug while executing, add it to the plan as a NEW step at the end — do not fix it silently | Keeps scope visible |
| Plans are immutable once execution starts (except adding steps at the end) | Prevents retroactive scope changes |
| If a step would take more than 30 minutes, split it into two atomic steps | Forces smaller, safer changes |
| Out-of-scope items found during execution go in a "Discovered / Out of scope" section in the plan file | Creates a backlog without scope creep |

---

## Credential rules — always

- Never write a real API key, password, or token in source code
- Never commit a `.env` file with real values — only `.env.example` with placeholders
- All secrets come from environment variables or a secret manager at runtime
- If you see a real credential already in the code, flag it in the work log and do not reproduce it

---

## Before any session that involves the database

- Confirm which environment is targeted (dev / staging / production)
- If production: state this explicitly in the plan and require the hard-stop unlock phrase for any destructive operation
- Never run migrations against a production DB without the unlock phrase "confirmed: migrate production"

---

## Quick checklist (paste into every plan's Guardrail Check section)

```
- [ ] No hard-stop operations (DROP, TRUNCATE, DELETE without WHERE, force push to main)
- [ ] No credentials written into source files or commits
- [ ] No production database targeted without unlock phrase
- [ ] Shared components: blast radius noted if any are touched
- [ ] All steps are in-scope (nothing added silently during execution)
- [ ] Each step is atomic — one change, one place, verifiable "done when"
```
