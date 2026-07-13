# Plan: Enrollment Landing Page

**Status:** IN PROGRESS  
**Branch:** profile-issues  
**Flag:** `IS_ENROLLMENT_LANDING_ON` in `src/configs/EnvironmentConfig.js`

---

## Goal

Replace the root route (`/`) with a context-aware landing page when the flag is `true`. Three states based on auth + enrollment status. When flag is `false`, zero behavior change.

---

## States

### State 1 — Unauthenticated
Split screen 60/40 desktop, stacked mobile:
- **Left**: Logo + headline + 2-line copy + "Enroll Now" → `/lrn-auth/enroll`
- **Right**: "Already have an account?" + Google SSO + Facebook SSO + email fallback → after login, `redirectTo` `/lrn/login?redirect=/` → lands on authenticated hub

### State 2+3 — Authenticated (unified)
Personalized greeting using `user.communicationName`. All available courses as tiles. Per tile:

| Course status | Ribbon | Buttons |
|---|---|---|
| Enrolled + has `coursePath` | "Enrolled" (primary #e79547) | "Go to Course" (primary) + WhatsApp (secondary, if present) |
| Enrolled + no `coursePath` | "Enrolled" (primary #e79547) | WhatsApp only (if present) |
| Not enrolled | "Open for Enrollment" (green) | "Enroll Now" → `/lrn-auth/enroll` |

---

## Data sources

| Data | Source |
|---|---|
| `coursePath` | `CourseDetails` JSONB per Course row (instance-level) — set via SQL UPDATE (see T1) |
| `whatsAppLink` | `CourseDetails.whatsAppLink` JSONB (instance-level, already in DB) |
| `imageUrl`, `course` name, etc. | `CourseDetails` JSONB via `GetAvailableCourses` RPC |
| All courses for hub | Fetched locally via `TitulinoRestService.getAvailableCourses` — NOT Redux (avoids polluting enrollment flow which filters enrolled courses) |
| User enrollment status | `user.userCourses` from `grant` Redux state (keyed by CourseCodeId) |
| User display name | `user.communicationName` from `grant` Redux state |

---

## Component structure

```
src/views/landing/
  index.js                    ← Redux-connected; reads auth.token; routes to correct view
  LandingUnauthenticated.js   ← split screen (State 1)
  LandingAuthenticatedHub.js  ← greeting + tile grid (States 2+3); fetches all courses locally
  CourseStatusTile.js         ← individual tile: ribbon + CTA logic
```

---

## Tasks

- [x] T1: Write SQL UPDATE statements for `coursePath` in `CourseDetails` JSONB (user runs in Supabase SQL editor)
- [x] T2: `IS_ENROLLMENT_LANDING_ON: false` flag in `EnvironmentConfig.js`
- [x] T3: i18n keys in all locale files (`en_US`, `es_US`, `pt_BR`)
- [x] T4: `LandingUnauthenticated` component
- [x] T5: `CourseStatusTile` component
- [x] T6: `LandingAuthenticatedHub` component
- [x] T7: `LandingPage/index.js`
- [x] T8: Wire root route in `src/views/index.js` (`env.IS_ENROLLMENT_LANDING_ON` guard)
- [x] T9: Add `coursePath` text input to Admin Tools course **create** form (already present in `GlobalAdminToolsLandingDashboard.js` line 6479)
- [x] T10: Add `coursePath` text input to Admin Tools course **edit** form (already present at line 6382)
- [x] T11: Post-login redirect → `/` when `IS_ENROLLMENT_LANDING_ON` is true (`src/views/app-views/user/login/index.js` — `getRedirectPath()` fallback)
- [x] T12: Logo click → `<Link to="/">` when `IS_ENROLLMENT_LANDING_ON` is true (`src/components/layout-components/LogoAlt.js`)
- [x] T13: "Inicio" + `<HomeOutlined />` prepended to top nav when `IS_ENROLLMENT_LANDING_ON` is true (`src/components/layout-components/MenuContentTop.js`)

---

## Course path values (T1 SQL — user runs these)

SQL file: `<scratchpad>/set-course-paths.sql`

| Course type | `coursePath` |
|---|---|
| English Connect 1 | `/lrn/en/level-1` |
| English Connect 2 | `/lrn/en/level-2` |
| Speeches of History | `/lrn/en/level-speeches` |
| Meditaciones de una existencia lúcida | `/lrn-auth/es/nivel-meditaciones` |
| Supermarket | `/lrn/en/level-supermarket` |
| Household Items | `/lrn/en/level-household` |
| Work & Jobs | `/lrn/en/level-work-n-jobs` |
| Conversation | *(absent — WhatsApp only)* |

---

## Activation checklist (when ready to go live)

1. Run T1 SQL in Supabase to set `coursePath` on all active courses
2. Complete T9 + T10 (Admin Tools inputs) so future courses can set their own path
3. Flip `IS_ENROLLMENT_LANDING_ON: true` in `EnvironmentConfig.js` and deploy

---

## Notes

- `whatsAppLink` is NEVER rendered in unauthenticated state
- `coursePath` and `whatsAppLink` are both stored in `CourseDetails` JSONB — no migration needed
- Spine bucket `course-theme-registry.data.json` was NOT used for `coursePath` (its structure would break `buildCodeToTheme` which calls `.forEach` on every registry value)
- Admin Tools T9/T10 allow setting `coursePath` per course instance going forward
