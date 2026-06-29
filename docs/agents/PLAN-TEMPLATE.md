# Plan: [Feature / Task Name]

**Created:** YYYY-MM-DD  
**Status:** Draft → Approved → In Progress → Complete  
**Working branch:** (git branch name if applicable)  
**Agent:** (Claude Sonnet | Claude Opus | Codex | etc.)

---

## Business brief

> Paste the original requirement exactly as received. Do not paraphrase.

---

## Scope — what this plan will change

List specific files, components, endpoints, or database objects that will be modified.

- `src/...`
- `src/...`

## Out of scope — explicitly excluded

List related things that will NOT be touched, even if they seem relevant.

- (none identified yet — fill in as discovered)

---

## Guardrail check

Run through [docs/agents/GUARDRAILS.md](GUARDRAILS.md) before approving this plan.

- [ ] No hard-stop operations without unlock phrase
- [ ] No credentials written into source files or commits
- [ ] No production database targeted without unlock phrase
- [ ] Shared components: blast radius noted if any are touched
- [ ] All steps are in-scope
- [ ] Each step is atomic — one change, one place, verifiable "done when"

---

## Atomic steps

Each step must: change exactly one thing, leave the system in a valid state, and have a verifiable "Done when" condition.

- [ ] **Step 1:** [Action verb] [what] in [specific file or location]  
  Done when: [observable, verifiable condition — e.g., "test X passes", "component renders Y", "API returns Z"]

- [ ] **Step 2:** [Action verb] [what] in [specific file or location]  
  Done when: [condition]

- [ ] **Step 3:** ...  
  Done when: ...

*(Add steps as needed. If a step would take >30 minutes, split it.)*

---

## Discovered / Out of scope

Things found during execution that are related but not in the approved plan. These become backlog items, not silent additions.

| Found on | Description | Added to plan? |
|---|---|---|
| | | No — backlog |

---

## Session log

| Date | Agent | Steps completed | Notes |
|---|---|---|---|
| YYYY-MM-DD | | Steps X–Y | |

---

## Done when (overall)

The single condition that means this entire plan is complete:

> [One sentence. Must be verifiable without judgment calls.]
