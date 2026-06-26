#!/bin/bash
# Run all tests once (no watch mode). Optionally filter by pattern.
# Usage: .claude/support-scripts/run-tests.sh [pattern]
# Example: .claude/support-scripts/run-tests.sh AdminTools
# Example: .claude/support-scripts/run-tests.sh lob/__tests__

PATTERN=${1:-}

if [ -n "$PATTERN" ]; then
  npm test -- --watchAll=false --testPathPattern="$PATTERN"
else
  npm test -- --watchAll=false
fi
