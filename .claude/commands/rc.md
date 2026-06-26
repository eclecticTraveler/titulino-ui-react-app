Run the full release workflow: bump version, update service worker cache, push branch and tags.

## Before doing anything

Ask the user: "Have you run `ssh-add` in your terminal this session? The push will hang without it."

Wait for confirmation before proceeding.

## Steps

1. Run `.claude/support-scripts/release.sh` which executes in sequence:
   - `standard-version` — bumps version in package.json, updates CHANGELOG.md, commits both, creates a git tag
   - `node scripts/bumpCacheVersion.js` — syncs the new version into `public/service-worker.js` cache name and asset paths
   - `node scripts/afterEachRelease.js` — runs `git push --follow-tags origin <current-branch>`

2. Report: the new version number, the tag created, and confirmation the push succeeded.

## If the push hangs or fails with an auth error

Stop. Tell the user: "The push failed — likely missing SSH key. Run `ssh-add` in your terminal and then say `/rc` again."
