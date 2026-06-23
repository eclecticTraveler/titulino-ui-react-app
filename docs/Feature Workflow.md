# Feature Workflow — Titulino UI React App

This document describes the end-to-end process for planning, building, and shipping a new feature or bug fix. AI agents should follow this workflow when implementing changes.

---

## Step 1 — Understand the Feature

Before writing any code, answer these questions:

1. **Which domain does this feature belong to?**
   Domains: `lrn` (learning), `auth`, `analytics`, `adminTools`, `shop`, `grant`, `theme`

2. **Which layers are affected?**
   View → Redux → Manager → Service / LOB

3. **Does state need to be shared across components?**
   If yes → Redux. If no → local `useState`.

4. **Does the feature need new API calls?**
   If yes → add to an existing Service or create a new one.

5. **Does the feature need data transformation?**
   If yes → add to an existing LOB module or create a new one.

6. **Does the feature need to orchestrate multiple calls?**
   If yes → add to an existing Manager or create a new one.

Refer to [Architecture.md](Architecture.md) for domain map and [Coding Standards.md](Coding%20Standards.md) for layer rules.

---

## Step 2 — Implementation Order

Always build **bottom-up**: start at the data layer and work up to the UI.

```
1. Service (if new API call needed)
2. LOB (if new data transformation needed)
3. Manager (orchestrate service + lob)
4. Redux constants → actions → reducer → saga
5. View (consume Redux state, dispatch actions)
```

Building bottom-up means each layer can be verified before the next one is written.

---

## Step 3 — File Creation Checklist

### New Service function
- [ ] Add function to the appropriate file in `src/services/`
- [ ] Function makes exactly one HTTP call
- [ ] Function does not contain business logic
- [ ] Headers set via the domain's `getHeaders()` helper

### New LOB function
- [ ] Add function to the appropriate file in `src/lob/`
- [ ] Function is pure (no HTTP, no Redux, no React imports)
- [ ] Function is exported as a named export

### New Manager function
- [ ] Add function to the appropriate file in `src/managers/`
- [ ] Function is `async` and exported as a named export
- [ ] Function composes Service + LOB calls
- [ ] Error handling wrapped in `try/catch`
- [ ] Caching considered (`LocalStorageService`)

### New Redux domain action
- [ ] Add action type constant to `src/redux/constants/<Domain>.js`
- [ ] Add action creator to `src/redux/actions/<Domain>.js`
- [ ] Add reducer case to `src/redux/reducers/<Domain>.js`
- [ ] Add saga handler in `src/redux/sagas/index.js` if async
- [ ] Saga calls a Manager function (not a Service directly)

### New View / Page
- [ ] Create folder under `src/views/app-views/<feature>/`
- [ ] Main file is `index.js`
- [ ] Component reads state via `useSelector`
- [ ] Component dispatches via `useDispatch`
- [ ] No Manager, Service, or LOB imports in the view file
- [ ] Add route to `src/views/index.js`

---

## Step 4 — Branch and Commit Strategy

- Create a feature branch from `main`
- Branch name format: `feature/<short-description>` or `fix/<short-description>`
- Commit messages follow conventional commits: `feat:`, `fix:`, `chore:`, `refactor:`
- Keep commits focused — one logical change per commit

---

## Step 5 — Versioning and Release

The project uses `standard-version` for automated versioning.

```bash
npm run release       # bumps version, updates CHANGELOG, tags commit
npm run afterEachRelease  # runs post-release automation script
```

Manual push step:
```bash
git push --follow-tags origin <branch>
```

The `scripts/bumpCacheVersion.js` script updates the cache-busting version used by the app on each release.

---

## Step 6 — Pre-Merge Checklist

- [ ] Code follows the layer rules in [Coding Standards.md](Coding%20Standards.md)
- [ ] No service calls inside views
- [ ] No Redux dispatches inside managers
- [ ] No business logic inside services
- [ ] Environment variables used for all secrets (no hardcoded keys)
- [ ] Existing cached objects use `LocalStorageService` (not raw `localStorage`)
- [ ] Build passes: `npm run build`
- [ ] Tests pass: `npm test`

---

## Common Patterns for New Features

### Pattern A — Read-only data page (new analytics view)

1. Add service method to `TitulinoRestService.js` or `TitulinoLrnAuthService.js`
2. Add LOB transform function in `AdminInsights.js` or a new lob file
3. Add manager function in `AnalyticsManager.js`
4. Add Redux constants, action, reducer case in `analytics` domain
5. Add saga that calls the manager function
6. Create view that selects analytics state and dispatches the fetch action on mount

### Pattern B — Admin operation (create/update/delete)

1. Add service method to `TitulinoNetService.js` or `TitulinoAdminAuthService.js`
2. Add payload builder in `AdminTools.js` LOB
3. Add manager function in `AdminToolsManager.js`
4. Add Redux action + saga
5. View dispatches action on form submit

### Pattern C — Course learning interaction

1. Service call (if needed) in `TitulinoLrnAuthService.js`
2. LOB transform in `LrnConfiguration.js` or `StudentProgress.js`
3. Manager function in `LrnManager.js`
4. Redux `lrn` domain: constants, action, reducer, saga
5. View in `src/views/app-views/course-level/`

---

## Adding a New Course Feature (KnowMe / Profile)

KnowMe is the user profile/onboarding system. Key files:

- View: `src/components/layout-components/KnowMeV1.js`
- LOB: `src/lob/LrnConfiguration.js` (buildSingleFullKnowMeProgressWithCourseCodeId, buildStudentKnowMeFileName)
- Manager: `LrnManager.upsertUserKnowMeProgress()`
- Service: `TitulinoLrnAuthService` + `TitulinoNetService` (for profile picture upload)

Any new KnowMe step follows the same bottom-up pattern.

---

## Environment-Specific Behavior

| File | When used |
|---|---|
| `.env` | Base defaults |
| `.env.development` | `npm start` / `npm run dev` |
| `.env.local` | Local overrides (not committed) |
| `.env.production` | `npm run build` |

Use `process.env.REACT_APP_*` to access variables. Never hardcode API keys, URLs, or secrets.
