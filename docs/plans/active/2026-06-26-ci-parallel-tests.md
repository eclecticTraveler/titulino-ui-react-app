# Plan: CI Parallel Test Job
Date: 2026-06-26
Status: pending approval

## Goal

Add a test job to the GitHub Actions workflow that runs in **parallel** with the deploy job. Test failures do not block deployment. Results are visible in the Actions tab after every push to `main`.

---

## About the GlobalNav example

The GlobalNav test (`__tests__/GlobalNav.test.tsx`) builds the library first and then snapshot-tests the compiled output via `renderToString`. That pattern only makes sense for distributable component libraries where the build output is the deliverable.

Titulino is a CRA app — the 5 existing tests in `src/lob/__tests__/` are pure LOB function tests that run directly from source. No build step needed before testing. Snapshot testing of components could be added later but is a separate initiative.

**What is worth borrowing from GlobalNav:** nothing structural — but it confirms we only need a standard Jest run, not a build-then-test pattern.

---

## What already exists

| Item | State |
|---|---|
| `"test": "react-scripts test"` in package.json | Exists — but defaults to interactive watch mode when `CI=false` |
| 5 test files in `src/lob/__tests__/` | Exist and pass |
| `.github/workflows/titulino-pr-action.yml` | One job (`publish`) — linear, no test step |
| `CI: false` in workflow env | Set globally to prevent CRA from treating warnings as build errors |

---

## Steps

### Step 1 — Add `test:ci` script to package.json
- [ ] Add `"test:ci": "react-scripts test --watchAll=false --passWithNoTests --forceExit"` to the `scripts` section
  - `--watchAll=false` — run once, not watch mode (needed because `CI: false` is set globally in the workflow)
  - `--passWithNoTests` — don't fail if a pattern matches zero files
  - `--forceExit` — prevents jest from hanging in CI after tests complete

### Step 2 — Add a `test` job to the workflow YAML
- [ ] Add a second top-level job named `test` alongside the existing `publish` job
- [ ] The `test` job has **no `needs:` dependency** on `publish` — GitHub Actions will run both simultaneously
- [ ] Set `continue-on-error: true` on the job so a red test result doesn't cancel or fail the workflow
- [ ] The `test` job steps:
  1. Checkout code
  2. Setup Node 22.13.1 (same as publish)
  3. Restore npm cache from GCS (same cache step as publish — read-only, no GCP deploy permissions needed)
  4. `npm install`
  5. `npm run test:ci`
- [ ] The `test` job does NOT need GCP auth, Gulp, env vars, or build — LOB tests are pure functions with no environment dependencies

### Step 3 — Add a job summary annotation (optional, low effort)
- [ ] After the test step, emit a summary line to `$GITHUB_STEP_SUMMARY` so the pass/fail count is visible in the Actions tab without opening logs:
  ```yaml
  - name: Report test results
    if: always()
    run: echo "### Test results" >> $GITHUB_STEP_SUMMARY
  ```
  Jest exits with a non-zero code on failure; `continue-on-error: true` on the job captures the outcome and marks the job yellow rather than red, keeping the deployment green.

---

## What does NOT change

- The `publish` job is untouched — same deploy flow as today
- `CI: false` stays in the global env (still needed for the build to not fail on warnings)
- No new secrets or GCP permissions required for the test job
- No test files are added or modified in this plan

---

## Files to modify

| File | Change |
|---|---|
| `package.json` | Add `test:ci` script |
| `.github/workflows/titulino-pr-action.yml` | Add `test` job in parallel |

---

## Verification after execution

1. Push a commit to `main` (or trigger workflow_dispatch)
2. Open GitHub Actions → confirm two jobs appear and run simultaneously: `publish` and `test`
3. Confirm `publish` completes and deploys successfully regardless of test outcome
4. Confirm test results are visible in the `test` job log
