Commit and push the current changes to the remote branch. No version bump. No tag.

## Steps

1. Run `git status` to see all modified and untracked files.

2. Stage only the relevant files using `git add <file1> <file2> ...` — never `git add -A`. Skip files that look like generated artifacts, secrets, or unrelated scratch work.

3. Read `.claude/templates/commit-message.md` and write a commit message using the Why/What/How format. Choose the correct type prefix (feat, fix, refactor, test, docs, chore).

4. Commit with the filled message.

5. Run `git push origin <current-branch>`.

6. Report: which files were committed, the commit hash, and confirmation the push succeeded.
