# Coding Standards — Titulino UI React App

This document defines the mandatory patterns and layer rules for all code in this repository. Any AI agent reading this should follow these rules without deviation.

---

## The Core Rule: Layer Responsibilities

Every feature must follow this exact flow. **Never skip a layer or call downward more than one step.**

```
View  →  Redux  →  Manager  →  Service / LOB
```

| Layer | Location | Responsibility | What it MUST NOT do |
|---|---|---|---|
| **View** | `src/views/` | Render UI, dispatch Redux actions, read Redux state | Call services, call managers, contain business logic |
| **Redux** | `src/redux/` | Hold state, dispatch actions to managers via sagas or thunks | Render UI, contain business logic |
| **Manager** | `src/managers/` | Orchestrate a use case by composing services and LOB modules | Render UI, hold or mutate Redux state directly |
| **Service** | `src/services/` | Make HTTP calls or access external systems | Contain business logic, know about Redux or React |
| **LOB** | `src/lob/` | Transform, validate, format domain data | Make HTTP calls, know about Redux or React |

---

## Layer 1 — Views

**Location:** `src/views/`

Views are React components that represent a full route/page. They are the only layer that renders JSX.

### Rules
- A view reads state from Redux using `useSelector` or the `connect()` HOC.
- A view triggers changes by dispatching Redux actions using `useDispatch` or `mapDispatchToProps`.
- A view must **not** import or call a Manager, Service, or LOB directly.
- Business logic (calculations, transformations, decision trees) belongs in a LOB or Manager — not in a view.
- Complex local UI state that does not need to be shared can use `useState` / `useReducer`.

### Connection patterns

**Functional component (preferred for new code):**
```js
import { useSelector, useDispatch } from 'react-redux';
import { fetchCourseAction } from 'redux/actions/Lrn';

const CourseView = () => {
  const dispatch = useDispatch();
  const courseData = useSelector(state => state.lrn.courseData);

  useEffect(() => {
    dispatch(fetchCourseAction(courseId));
  }, []);

  return <div>{courseData.title}</div>;
};
```

**Class component (legacy, still present in codebase):**
```js
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

const mapStateToProps = (state) => ({ courseData: state.lrn.courseData });
const mapDispatchToProps = (dispatch) => ({
  fetchCourse: bindActionCreators(fetchCourseAction, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(CourseView);
```

---

## Layer 2 — Redux

**Location:** `src/redux/`

```
src/redux/
├── actions/      Action creators (Auth.js, Lrn.js, Shop.js, Analytics.js, ...)
├── constants/    Action type string constants per domain
├── reducers/     Pure state reducers per domain
├── sagas/        Async side-effect handlers
└── store/        Store configuration (configureStore)
```

### Rules
- Reducers must be pure functions. No side effects, no API calls.
- Async work (API calls, manager calls) belongs in sagas or thunks.
- Action type constants are defined in `src/redux/constants/` and imported by both actions and reducers.
- Each domain (lrn, auth, analytics, shop, adminTools, grant, theme) has its own reducer, actions file, and constants file.
- Sagas call managers, not services directly.

### Example action → saga → manager flow
```js
// actions/Lrn.js
export const FETCH_COURSE = 'FETCH_COURSE';
export const fetchCourseAction = (courseId) => ({ type: FETCH_COURSE, payload: courseId });

// sagas/index.js
function* fetchCourseSaga(action) {
  const result = yield call(LrnManager.getCourseData, action.payload);
  yield put({ type: FETCH_COURSE_SUCCESS, payload: result });
}

// reducers/Lrn.js
case FETCH_COURSE_SUCCESS:
  return { ...state, courseData: action.payload };
```

---

## Layer 3 — Managers

**Location:** `src/managers/`

Managers are the **orchestration layer**. A manager function receives inputs, calls one or more services and/or LOB functions, and returns a result. Managers do not hold state.

### Existing managers

| File | Domain |
|---|---|
| `LrnManager.js` | Learning — course progress, enrollment, KnowMe |
| `AdminToolsManager.js` | Admin — courses, users, roles, impersonation |
| `AnalyticsManager.js` | Analytics — dashboards, demographics, progress |

### Rules
- All manager functions are **exported plain async functions** (no class instances, no `new`).
- A manager function may call multiple services and multiple LOB modules in a single operation.
- Use `Promise.all()` to parallelize independent calls.
- Managers own error handling — wrap risky operations in `try/catch` and return safe fallbacks.
- Managers own caching decisions — use `LocalStorageService` when appropriate.
- A manager must **not** dispatch Redux actions or import React hooks.

### Structure example
```js
// managers/LrnManager.js
import TitulinoLrnAuthService from 'services/Lrn/TitulinoLrnAuthService';
import LocalStorageService from 'services/LocalStorageService';
import StudentProgress from 'lob/StudentProgress';
import LrnConfiguration from 'lob/LrnConfiguration';

export const getUserCourseProgress = async (courseId, userId) => {
  const cached = LocalStorageService.getCachedObject(`progress_${userId}_${courseId}`);
  if (cached) return cached;

  const raw = await TitulinoLrnAuthService.fetchProgress(courseId, userId);
  const progress = StudentProgress.calculateUserCourseProgressPercentageForCertificates(raw);
  LocalStorageService.setCachedObject(`progress_${userId}_${courseId}`, progress, 10);
  return progress;
};
```

---

## Layer 4a — Services

**Location:** `src/services/`

Services are thin wrappers around external systems (HTTP APIs, localStorage, third-party SDKs).

### Existing services

| File | Purpose |
|---|---|
| `HttpService.js` | Axios client with Bearer token interceptor |
| `TitulinoRestService.js` | Supabase REST/RPC calls (unauthenticated or API-key auth) |
| `TitulinoLrnAuthService.js` | Course-specific authenticated Supabase calls |
| `TitulinoNetService.js` | .NET backend API (enrollment, upload, email, impersonation) |
| `TitulinoShopAuthService.js` | Shop/payment API calls |
| `LocalStorageService.js` | Encrypted localStorage with TTL |
| `GoogleService.js` | Google Sheets/Drive for course theme and badge data |
| `UserService.js` | Current user token helpers |

### Rules
- A service function makes exactly **one external call** per function.
- Services do **not** call other services or LOB modules.
- Services do **not** contain business logic — they only serialize the request and deserialize the response.
- Services do **not** import Redux or React.
- `LocalStorageService` uses AES encryption (CryptoJS) and TTL — always use it for sensitive cached data instead of raw `localStorage`.

### HTTP pattern
```js
// services/TitulinoRestService.js
import HttpService from './HttpService';

const getHeaders = () => ({
  apiKey: process.env.REACT_APP_SUPABASE_ANON_KEY,
  'Content-Profile': 'public'
});

export const getAvailableCourses = () =>
  HttpService.getAxiosClient().get('/GetAvailableCourses', { headers: getHeaders() });
```

---

## Layer 4b — LOB (Line of Business)

**Location:** `src/lob/`

LOB modules contain **domain-specific data transformations and business rules**. They are pure — no HTTP, no Redux, no React.

### Existing LOB modules

| File | Domain |
|---|---|
| `StudentProgress.js` | Progress percentage calculations for certificates |
| `LrnConfiguration.js` | Course code/theme mappings, KnowMe file naming, badge metadata |
| `AdminInsights.js` | Data shape conversions for admin analytics dashboards |
| `AdminTools.js` | Payload builders for course/enrollment admin operations |
| `KnowMeProfiles.js` | Batch profile picture fetching and merging into table models |
| `ImpersonationSession.js` | Impersonation context stored in sessionStorage |
| `WebsitePreferences.js` | User dashboard/UI preference persistence |
| `LoginFootprint.js` | Login event tracking data |

### Rules
- All LOB functions are **pure or near-pure** — same input → same output.
- LOB functions **never** make HTTP calls.
- LOB functions **never** import Redux, React, or services.
- LOB functions transform raw API responses into shapes the UI or manager needs.
- LOB modules are the correct place for: payload builders, field mappers, progress calculators, name formatters, ID generators.

### Structure example
```js
// lob/StudentProgress.js
export const calculateUserCourseProgressPercentageForCertificates = (rawProgress) => {
  const total = rawProgress.categories.length;
  const completed = rawProgress.categories.filter(c => c.completed).length;
  return Math.round((completed / total) * 100);
};
```

---

## File Naming Conventions

| Layer | Convention | Example |
|---|---|---|
| Views | PascalCase folder + `index.js` | `views/app-views/course-level/index.js` |
| Redux actions | PascalCase domain name | `redux/actions/Lrn.js` |
| Redux reducers | PascalCase domain name | `redux/reducers/Lrn.js` |
| Redux constants | PascalCase domain name | `redux/constants/Lrn.js` |
| Managers | PascalCase + `Manager` suffix | `managers/LrnManager.js` |
| Services | PascalCase + `Service` suffix | `services/TitulinoRestService.js` |
| LOB modules | PascalCase domain name | `lob/StudentProgress.js` |
| Components | PascalCase + `.js` | `components/CourseCard.js` |
| Hooks | camelCase + `use` prefix | `hooks/useBodyClass.js` |

---

## State Management Rules

- All **shared app state** lives in Redux — never in component state if two+ components need it.
- Local UI state (open/close modal, hover) stays in `useState` — do not over-Redux.
- Redux slices follow the domain split: `lrn`, `auth`, `analytics`, `grant`, `shop`, `adminTools`, `theme`.
- Do not create new slices without a clear domain reason.

---

## Async / Side Effect Rules

- Complex async flows use **Redux-Saga** (`src/redux/sagas/`).
- Simple one-off async actions may use the built-in redux-promise or axios middleware.
- All saga calls go to **Manager functions** — sagas do not call services directly.
- Managers return resolved data — they do not dispatch Redux actions.

---

## Styling Rules

- Primary styling: LESS files compiled to CSS by Gulp during development (`npm run dev`).
- Component-level overrides: inline styles or CSS modules where needed.
- Global theme variables live in `src/assets/` LESS files.
- Ant Design theme tokens are configured in `src/configs/`.
- Do not use `!important` unless overriding a third-party component with no alternative.

---

## What AI Agents Must Know

1. **Always check the layer.** Before writing code, identify which layer the new code belongs to.
2. **Views only touch Redux.** Never write a view that imports a manager or service.
3. **Managers are the only callers of services.** Sagas call managers; managers call services.
4. **LOBs are pure.** If a function needs HTTP, it is not a LOB — it is a service.
5. **Follow existing naming.** New managers end in `Manager`, new services end in `Service`.
6. **Check for existing patterns first.** Before writing a new service method, search `src/services/` for an existing one.
7. **Caching belongs in managers**, using `LocalStorageService` — not in views or reducers.
