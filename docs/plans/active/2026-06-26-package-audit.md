# Plan: Package Audit — Remove Unused Dependencies

**Created:** 2026-06-26  
**Status:** Approved  
**Working branch:** mergeContact  
**Agent:** Claude Sonnet 4.6

---

## Business brief

> Audit all packages listed in package.json. Identify those with no import references anywhere in src/. Document findings. Create a removal plan with atomic steps. Do not remove anything until this plan is approved.

---

## Audit findings

### How to read this table

- **Imports found** = count of files in `src/` that import this package
- **Verdict** = Remove · Move (wrong section) · Investigate · Keep

| Package | Imports found | Verdict | Reason |
|---|---|---|---|
| `redux-thunk` | 0 | **Remove** | Zero imports. Store explicitly sets `thunk: false` in RTK config. Contradicts having it installed. |
| `rxjs` | 0 | **Remove** | Zero imports. No usage anywhere in the codebase. |
| `reqwest` | 0 | **Remove** | Zero imports. Pre-Fetch-era HTTP library, superseded by axios. |
| `web-vitals` | 0 | **Remove** | Zero imports. CRA used to scaffold `reportWebVitals.js` but this app has none. |
| `@supabase/ssr` | 0 | **Remove** | Zero imports. SSR package has no use in a CRA (client-side only) application. |
| `react-calendar` | 0 | **Remove** | Zero imports. No calendar UI anywhere in the app. |
| `save` | 0 | **Remove** | Accidentally installed. `save` is an npm file-system utility, not a frontend package. Was meant to be the `--save` flag on another install command. |
| `firebase` | 1 (FirebaseAuth.js) | **Remove** | FirebaseAuth.js and FirebaseService.js exist but are never imported in App.js or any route. App moved to Keycloak + Supabase auth. Firebase is unreachable dead code. |
| `@firebase/webchannel-wrapper` | 0 | **Remove** | Internal Firebase peer dependency. Only needed when Firebase is in use. Remove with `firebase`. |
| `sass` | 0 | **Remove** | Project uses LESS (via gulp). No `.scss` files exist. The standalone `sass` package is not needed; react-scripts bundles its own SCSS support if/when .scss files are added. |
| `concurrently` | 0 in src/ | **Move to devDependencies** | Used only in `npm run dev` script — not imported by app code. Belongs in devDependencies. |
| `@testing-library/jest-dom` | test files only | **Move to devDependencies** | Testing utility. No business in production `dependencies`. |
| `@testing-library/react` | test files only | **Move to devDependencies** | Testing utility. Same as above. |
| `@testing-library/user-event` | test files only | **Move to devDependencies** | Testing utility. Same as above. |
| `bootstrap` | 3 (template files) | **Investigate** | Only imported in `user/profile/index-edit.js`, `index-template.js`, `index-2.js`. These look like dev templates, not production routes. Confirm they are not in any routing config before removing. |
| `react-bootstrap` | 3 (same files) | **Investigate** | Same 3 template files as `bootstrap`. Remove only if confirmed unused in routing. |
| `framer-motion` | 1 (LoginForm.js) | **Keep** | Active import: `import { motion } from "framer-motion"` in LoginForm.js. |
| `redux-saga` | 3 (store + 2 saga files) | **Keep** | ACTIVE. Auth.js saga handles SIGNIN/SIGNOUT/SIGNUP flows via SupabaseService. Wired in store and runs via `sagaMiddleware.run(rootSaga)`. |
| All others | 1+ | **Keep** | antd, axios, crypto-js, dayjs, @fortawesome/*, @ant-design/plots, @stripe/stripe-js, @supabase/supabase-js, @supabase/auth-ui-react, @supabase/auth-ui-shared, react-intl, react-google-recaptcha-v3, lottie-react, react-confetti, react-confetti-explosion, react-countdown, react-use, react-tooltip, react-toggle, react-css-theme-switcher, react-custom-scrollbars-2, react-iframe, react-world-flags, react-redux, react-router-dom, redux, redux-promise, redux-axios-middleware, @reduxjs/toolkit, keycloak-js, @react-keycloak/web, dayjs, js-cookie, d3-geo, topojson-client, @uiw/react-json-view — all actively imported. |

---

## Scope — what this plan will change

- `package.json` — remove packages, move packages between sections
- No source files changed

## Out of scope

- Deleting the dead source files that go with Firebase (`src/auth/FirebaseAuth.js`, `src/services/FirebaseService.js`, `src/configs/FirebaseConfig.js`) — separate cleanup task
- Any source code changes
- `npm install` or `npm ci` — agent must not run these without explicit user instruction

---

## Guardrail check

- [x] No hard-stop operations
- [x] No credentials in source
- [x] No production database
- [x] Shared components: N/A — package.json only
- [x] All steps in scope
- [x] Soft stop noted: `bootstrap` and `react-bootstrap` require routing verification first (Step 1)

---

## Atomic steps

- [ ] **Step 1 (Investigate):** Check whether `user/profile/index-edit.js`, `index-template.js`, `index-2.js` are registered in any routing config or imported anywhere outside of themselves.  
  Done when: confirmed these 3 files are dead templates OR confirmed they are active routes.

- [ ] **Step 2 (Remove clear unused):** Remove from `dependencies` in package.json: `redux-thunk`, `rxjs`, `reqwest`, `web-vitals`, `@supabase/ssr`, `react-calendar`, `save`, `firebase`, `@firebase/webchannel-wrapper`, `sass`  
  Done when: 10 packages removed from the dependencies block, `npm install` runs without error, `npm test -- --watchAll=false` still passes all 90 tests.

- [ ] **Step 3 (Move to devDependencies):** Move from `dependencies` to `devDependencies`: `concurrently`, `@testing-library/jest-dom`, `@testing-library/react`, `@testing-library/user-event`  
  Done when: 4 packages appear in devDependencies section and are gone from dependencies, `npm test` still passes.

- [ ] **Step 4 (Conditional — based on Step 1 finding):** If Step 1 confirms `index-edit.js`, `index-template.js`, `index-2.js` are dead: remove `bootstrap` and `react-bootstrap` from `dependencies`.  
  Done when: 2 more packages removed, `npm test` passes, `npm run build` succeeds.

- [ ] **Step 5 (Verify build):** Run `.claude/support-scripts/run-build.sh` to confirm production build still succeeds.  
  Done when: build completes with no errors.

---

## Discovered / Out of scope

| Found on | Description | Added to plan? |
|---|---|---|
| 2026-06-26 | `src/auth/FirebaseAuth.js`, `src/services/FirebaseService.js`, `src/configs/FirebaseConfig.js` are dead code files (Firebase removed). Should be deleted separately. | No — separate cleanup |
| 2026-06-26 | `src/services/AjaxExample.js` imports axios — likely a dev example file, not production code. | No — separate cleanup |

---

## Session log

| Date | Agent | Steps completed | Notes |
|---|---|---|---|
| 2026-06-26 | Claude Sonnet 4.6 | Audit only — Steps 0 (research) | Plan written. No changes to package.json yet. Steps 1–5 pending approval. |

---

## Done when (overall)

All unused packages removed from `package.json`, devDependencies corrected, `npm test` passes 90/90, `npm run build` succeeds.
