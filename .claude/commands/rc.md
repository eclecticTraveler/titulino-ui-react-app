Run the full release workflow: commit any pending feature changes, bump version, update service worker cache, push everything.

## Before doing anything

Ask the user: "Have you run `ssh-add` in your terminal this session? The push will hang without it."

Wait for confirmation before proceeding.

## Steps

1. Run `git status` to see all modified and untracked files.

2. If there are any pending changes (other than the version files that release.sh will handle — package.json, package-lock.json, CHANGELOG.md, service-worker.js), commit them first:
   - Stage only relevant files using `git add <file1> <file2> ...` — never `git add -A`
   - Read `.claude/templates/commit-message.md` and write a commit using the Why/What/How format
   - Commit with the filled message

3. Run `.claude/support-scripts/release.sh` which executes in sequence:
   - `standard-version` — bumps version in package.json, updates CHANGELOG.md, commits both, creates a git tag
   - `node scripts/bumpCacheVersion.js` — syncs the new version into `public/service-worker.js` cache name and asset paths
   - `node scripts/afterEachRelease.js` — runs `git push --follow-tags origin <current-branch>`

4. Report: which feature files were committed (if any), the new version number, the tag created, and confirmation the push succeeded.

## If the push hangs or fails with an auth error

Stop. Tell the user: "The push failed — likely missing SSH key. Run `ssh-add` in your terminal and then say `/rc` again."
