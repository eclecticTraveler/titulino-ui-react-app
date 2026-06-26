#!/bin/bash
# Run all tests with coverage report.
# Usage: .claude/support-scripts/run-tests-coverage.sh
# Output: coverage/ folder + summary printed to terminal

npm test -- --watchAll=false --coverage
