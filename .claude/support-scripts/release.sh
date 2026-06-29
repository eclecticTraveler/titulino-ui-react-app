#!/bin/bash
# Release workflow: bump version → update service worker cache → push branch + tags
#
# PREREQUISITE (run manually before calling this script):
#   ssh-add
# This loads your SSH key passphrase into ssh-agent for the session.
# Without it, the git push step will hang waiting for a password that
# Claude Code's non-interactive shell cannot provide.
#
# What this script does:
#   1. standard-version  — bumps version in package.json, updates CHANGELOG.md, commits both, creates a git tag
#   2. bumpCacheVersion  — updates public/service-worker.js CACHE_NAME and asset paths to the new version
#   3. git push          — pushes the current branch plus all tags to origin

set -e  # exit immediately if any step fails

echo "Running standard-version..."
npx standard-version

echo "Bumping service worker cache version..."
node scripts/bumpCacheVersion.js

echo "Pushing branch and tags to origin..."
node scripts/afterEachRelease.js

echo "Release complete."
