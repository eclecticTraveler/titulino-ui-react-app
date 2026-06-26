#!/bin/bash
# Compile LESS → CSS (one-time, not watch mode).
# LESS is compiled by Gulp, not webpack — must run this after any .less change.
# Usage: .claude/support-scripts/compile-less.sh

npx gulp theme
