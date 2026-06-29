Generate a Jest test scaffold for a LOB file in this project.

## Argument

The user passes a LOB filename (with or without path or extension). Examples:
- `ImpersonationSession`
- `ImpersonationSession.js`
- `src/lob/ImpersonationSession.js`

Resolve to `src/lob/$ARGUMENTS.js` (strip `.js` if already present, strip leading path if provided).

## Steps

**1. Read the LOB file**

Read `src/lob/<filename>.js`.

If the file does not exist, stop and tell the user: "File not found: src/lob/<filename>.js — check the name and try again."

**2. Identify testable functions**

Scan the file for all named exports (default export object properties, or individual named exports).
List each function with:
- Function name
- What it appears to take as input (parameter names)
- What it appears to return (inferred from the body)
- Whether it has any conditional branches (if/else, ternary, switch) worth covering

Do NOT test:
- Functions that make HTTP calls
- Functions that access `localStorage` or `sessionStorage` directly (flag these — they need beforeEach cleanup)
- Functions that import from Redux or dispatch actions
- Internal helpers that are not exported

**3. Check for an existing test file**

Check whether `src/lob/__tests__/<filename>.test.js` already exists.
- If it exists: read it and list which functions already have tests. Only scaffold tests for functions NOT yet covered.
- If it does not exist: scaffold the full file.

**4. Write the test scaffold**

Write to `src/lob/__tests__/<filename>.test.js`.

Rules for the scaffold:
- Use `describe('<FunctionName>', () => { ... })` for each function
- Each `it(...)` block must have a descriptive label — name the scenario, not the assertion (e.g. `'returns empty array when input is null'` not `'should work'`)
- Write at minimum: one happy-path test and one edge-case test per function
- For functions with multiple branches: one `it` per branch
- Leave each `it` body with a `// TODO` comment and the expected input/output so the developer knows what to fill in — do not write fake passing assertions
- If the file needs `localStorage`/`sessionStorage`, add at the top of the describe block:
  ```js
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  ```
- Import the LOB file as a default import: `import <ModuleName> from '../<filename>'`
- Do not mock CRA absolute imports (e.g. `utils`) — use the real module

**5. Report**

Tell the user:
- Which file was read
- How many functions were found and which ones have tests scaffolded
- Whether any functions were skipped and why (HTTP calls, not exported, etc.)
- The path of the test file written
- Run `.claude/support-scripts/run-tests.sh <filename>` to verify the scaffold compiles and the TODO tests are pending (not failing)
