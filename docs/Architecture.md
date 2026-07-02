# Architecture — Titulino UI React App

## Overview

Titulino UI is a multi-tenant learning management platform (LMS) built with React 18 and Redux. It delivers interactive courses, analytics dashboards, admin tools, and e-commerce functionality. The app targets multiple languages and user roles (students, facilitators, admins).

---

## Technology Stack

| Concern | Technology |
|---|---|
| UI Framework | React 18, Ant Design 6, Bootstrap 5 |
| State Management | Redux 4, Redux Toolkit 2, Redux-Saga |
| Routing | React Router DOM 7 |
| HTTP Client | Axios 1.7 via redux-axios-middleware |
| Auth | Supabase, Keycloak, reCAPTCHA |
| Payments | Stripe |
| Styling | LESS → CSS via Gulp + PostCSS, Sass |
| i18n | React-Intl 5 |
| Charts | @ant-design/plots 2 |
| Maps | D3-geo, react-simple-maps, react-world-flags |
| Build | Create React App (react-scripts 5) |
| Versioning | standard-version |

---

## Source Directory Structure

```
src/
├── assets/          Static JSON data, fonts, global CSS/LESS
├── auth/            Auth provider configs (Supabase, Keycloak)
├── components/      Reusable UI components (shared + admin-specific)
│   └── layout-components/   Page layout pieces (KnowMe, headers, etc.)
├── configs/         App-wide configuration (theme, environment, Supabase client)
├── constants/       Global constant values
├── helpers/         Pure utility functions
├── hooks/           Custom React hooks
├── lang/            i18n locale files
├── layouts/         Route-level layout wrappers
│   ├── app-layout/          Authenticated app shell
│   └── auth-layout/         Course content / auth shell
├── lob/             Line-of-Business modules (domain logic & transformations)
├── managers/        Orchestration layer (compose services + lob to fulfill use cases)
├── redux/           State management (actions, reducers, sagas, constants, store)
├── services/        External API and storage integrations
├── utils/           Misc utilities
├── views/           Route-level page components
├── App.js           Root component
└── index.js         Entry point
```

---

## Layered Architecture

The system follows a strict four-layer architecture. Each layer has a single responsibility and communicates only with the layer below it.

```
┌──────────────────────────────────────────┐
│  VIEWS (React components / pages)        │  ← reads/writes Redux state
├──────────────────────────────────────────┤
│  REDUX (actions, reducers, sagas)        │  ← dispatches to managers
├──────────────────────────────────────────┤
│  MANAGERS (orchestration functions)      │  ← composes services + lob
├──────────────────────────────────────────┤
│  SERVICES / LOB                          │  ← HTTP calls & data transforms
│   services/  ← API / external integrations│
│   lob/       ← domain data transformations│
└──────────────────────────────────────────┘
```

See [Coding Standards.md](Coding%20Standards.md) for the rules governing each layer.

---

## Routing

React Router DOM 7 is used. Routes are defined in `src/views/index.js` and `src/App.js`.

**Route prefixes** (from `src/configs/AppConfig.js`):

| Prefix | Description |
|---|---|
| `/lrn/*` | Authenticated app — dashboards, admin, enrollment |
| `/lrn-auth/*` | Course learning content (guarded by `RouteInterceptor`) |

Unauthenticated access to `/lrn-auth/*` redirects to `/lrn/login`.

---

## Redux Store Domains

The store is split into slices managed by `combineReducers` in `src/redux/store/index.js`:

| Slice | Contents |
|---|---|
| `auth` | Session tokens, user identity, login state |
| `lrn` | Active course, chapter, user progress |
| `analytics` | Dashboard metrics, demographic data |
| `grant` | User roles and permission flags |
| `shop` | E-commerce products, revenue data |
| `adminTools` | Admin course and user management data |
| `theme` | UI theme, locale, language preference |

Redux-Saga handles async side effects. Redux-Promise and Axios middleware are also included for simpler async actions.

---

## Authentication

- **Supabase** — primary auth provider; manages user sessions and tokens
- **Keycloak** — enterprise SSO via `@react-keycloak/web`
- **reCAPTCHA** — bot protection on registration/login forms
- **Impersonation** — admins can impersonate any student; session stored in `sessionStorage` via `ImpersonationSession` LOB

Tokens are injected into every HTTP request via the `HttpService` Axios interceptor.

---

## Key Feature Areas

| Feature | Location |
|---|---|
| Course selection | `src/views/app-views/course-selection/` |
| Course learning (book, video, quiz, resources) | `src/views/app-views/course-level/` |
| Personal analytics | `src/views/app-views/user/analytics/` |
| Enrollment flow | `src/views/app-views/user/enrollment/` |
| Admin dashboard | `src/views/app-views/admin-*` |
| KnowMe survey + AI essay review | `src/components/layout-components/KnowMeV3.js` |
| Admin impersonation | `src/views/app-views/user/impersonation/` |

---

## External Integrations

| Integration | Purpose |
|---|---|
| Supabase REST (PostgREST) | Primary data API (`/rest/v1/rpc`) |
| TitulinoNet (.NET backend) | Enrollment, profile upload, email, impersonation, AI result endpoint |
| TitulinoWorkerService (.NET background worker) | Polls `Lrn.KnowMeAiJob` table every 30 s; calls Gemini/OpenAI to correct Know Me essays; writes results back to DB |
| Google Sheets / Drive | Course themes, badge metadata, survey questions |
| Stripe | Payment processing |
| Firebase | (referenced, exact usage TBD) |

---

## AI Essay Review — Background Job Flow

The Know Me survey triggers an AI correction job when a student submits. The full flow spans four systems:

```
UI submits → Supabase RPC UpsertAuthenticatedKnowMeSubmission
  └─► RPC also inserts Lrn.KnowMeAiJob row (status = pending)

TitulinoWorkerService polls DB every 30 s
  → claims next pending job atomically (FOR UPDATE SKIP LOCKED)
  → derives NativeLanguageId from Enrollment.Course at claim time
  → calls Gemini (with OpenAI fallback) per essay question
  → prompt requests: corrected text + English feedback + native language feedback
  → writes CorrectedEssaysJson + FeedbackJson to KnowMeAiJob row
  → marks status = completed (or failed)

UI polls GET /v1/lrn/know-me/ai-result every 10 s
  → TitulinoNet API calls Supabase RPC GetKnowMeAiJobResult
  → returns: Status, OriginalEssays, CorrectedEssaysJson, FeedbackJson
  → KnowMeV3 renders per-question cards: original → corrected → EN feedback → native feedback
```

`FeedbackJson` shape per question:
```json
{
  "q2_bio": {
    "summary": "…",
    "grammarNotes": ["…"],
    "vocabularySuggestions": ["…"],
    "nativeSummary": "…",
    "nativeGrammarNotes": ["…"],
    "nativeVocabularySuggestions": ["…"]
  }
}
```

`NativeLanguageId` is stored as an ISO code (`"es"`, `"pt"`) on `Enrollment.Course`. The worker maps it to a full language name before injecting into the AI prompt.

---

## Environment Configuration

Config values are loaded from `.env.*` files and exported by `src/configs/EnvironmentConfig.js`.

Key variables:

| Variable | Purpose |
|---|---|
| `REACT_APP_SUPABASE_URL` | Supabase project URL |
| `REACT_APP_SUPABASE_ANON_KEY` | Supabase anon key |
| `REACT_APP_SUPABASE_BASE_API_URL` | Supabase RPC base URL |
| `REACT_APP_BACKEND_NET_TITULINO_API_KEY` | .NET backend API key |
| `REACT_APP_STORAGE_KEY` | AES encryption key for LocalStorageService |
| `REACT_APP_STRIPE_PUBLISHABLE_KEY` | Stripe client key |
| `REACT_APP_RECAPTCHA_SITE_KEY` | reCAPTCHA site key |
