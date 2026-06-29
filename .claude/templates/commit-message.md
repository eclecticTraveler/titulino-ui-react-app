# Commit Message Template

Fill in each section below. Write to a temp file, then commit.

---

```
[type]: brief description (50 chars max)
## types: feat | fix | refactor | test | docs | chore ####

Why we changed it
-----------------

-

What changed
------------

-

How to verify
-------------

-

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

---

## Types

| Type | Use when |
|---|---|
| `feat` | New feature or user-visible capability |
| `fix` | Bug fix |
| `refactor` | Code change with no behavior change |
| `test` | Adding or fixing tests only |
| `docs` | Documentation only |
| `chore` | Build, config, dependency changes |

## Commit workflow

1. Fill in the template above
2. Run `git add <specific files>` — never `git add -A`
3. Run `git commit -m "$(cat <<'EOF' ... EOF)"`
4. Do NOT force-push to main/master
5. Do NOT skip hooks (--no-verify)
