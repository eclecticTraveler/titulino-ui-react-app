# Facilitator Multi-Course Support — Phase 2

**Started:** 2026-07-23  
**Status:** In progress — Phase A active

## Goal

Enable facilitators who teach multiple course sections (different courseCodeIds) to see all their sections and switch between them. Add an admin bird's-eye view of which facilitators are assigned to which courses.

## Ordering rationale — least intrusive first

| Phase | Tasks | What changes | Risk |
|---|---|---|---|
| **A** | P2-T4 | New RPC + new endpoint + new UI table | Zero — pure additions |
| **B** | P2-T1 + P2-T2 | LOB fix + Redux wiring | Low — isolated, backward compat maintained |
| **C** | P2-T3 | Course picker in FacilitatorsLandingDashboard | Highest — large complex component |

---

## Phase A — Admin Bird's-Eye View (pure additions)

### Progress
- [x] A1 — Warehouse: Sqitch migration `Enrollment/2026/07/23_course_facilitators_rpc`
- [x] A2 — titulino-net-api: DTO + EnrollmentManager + Enrollment endpoint
- [x] A3 — titulino-ui: service call + Redux action + CourseFacilitatorsTable component
- [x] A4 — titulino-ui: wire table into Access Management tab

### A1 — Warehouse

**Sqitch command:**
```
sqitch add Enrollment/2026/07/23_course_facilitators_rpc -n "RPC returning all courses with their assigned facilitators for admin view"
```

**Inner function** — `"Enrollment".get_course_facilitators()`:
- Joins `"Enrollment"."UserRole_Course"` + `"Enrollment"."vm_Enrollee"`
- Filters `UserRoleId = 'titulino_facilitator'`
- Returns: `CourseCodeId`, `ContactInternalId`, `FullName`, `EmailAddress`
- SECURITY INVOKER; grants to `postgres, service_role`

**API wrapper** — `"TitulinoApi_v1"."GetCourseFacilitators"()`:
- SECURITY DEFINER; returns `jsonb`
- Grants to `postgres, service_role, titulino_administrator, titulino_super_admin`

### A2 — titulino-net-api

- `DTOs/CourseFacilitatorEntry.cs` — `CourseCodeId`, `ContactInternalId`, `FullName`, `EmailAddress`
- `IEnrollmentManager.cs` — add `Task<IEnumerable<CourseFacilitatorEntry>> GetCourseFacilitatorsAsync()`
- `EnrollmentManager.cs` — parse jsonb array, map to DTOs
- `Repository/`: `SupabaseAdapter`, `IRepositoryClient`, `RepositoryClient` — same pattern as Know Me
- `Endpoints/Enrollment.cs` — `GET /v1/enrollment/facilitators`, auth: `GlobalAccessAdminUser`

### A3 — titulino-ui

- `src/services/Admin/TitulinoAdminNetService.js` *(new)* — `getCourseFacilitators(token)`
- `src/redux/constants/AdminTools.js` — add `ON_FETCHING_COURSE_FACILITATORS`
- `src/managers/AdminToolsManager.js` — add `getCourseFacilitators(emailId)`
- `src/redux/actions/AdminTools.js` — add `onFetchingCourseFacilitators(emailId)`
- `src/components/admin-components/Insights/CourseFacilitatorsTable.js` *(new)* — self-contained connected component; Ant Design Table grouped by CourseCodeId; columns: Course, Facilitator Name, Email; no pagination needed (small data set)

### A4 — Wire into Admin Tools

- Add section to `renderAccessManagement()` in `GlobalAdminToolsLandingDashboard.js`
- Fetch on mount of the Access Management tab (same lazy-load pattern used elsewhere)

---

## Phase B — LOB Fix + Redux Wiring

### Progress
- [x] B1 — LOB: `getFacilitadorCourseCodeIdsForTheme` returns `string[]`; 11 tests written
- [x] B2 — Manager: `resolveFacilitadorCourseCodeId` returns `string[]`
- [x] B3 — Redux: action stores array; reducer adds `facilitadorCourseCodeIds: []`; scalar `facilitadorCourseCodeId` kept as `ids[0]`
- [x] B4 — CourseLevel: passes `courseCodeIds` prop to FacilitatorsLandingDashboard

### Files touched
- `src/lob/LrnConfiguration.js`
- `src/lob/__tests__/LrnConfiguration.test.js` (no existing tests for this function — write from scratch)
- `src/managers/LrnManager.js`
- `src/redux/actions/Lrn.js`
- `src/redux/reducers/Lrn.js`
- `src/views/shared-views/course-level/index.js`

---

## Phase C — Course Picker UI

### Progress
- [ ] C1 — `FacilitatorsLandingDashboard.js` receives `courseCodeIds: string[]` prop
- [ ] C2 — Internal `selectedCourseCodeId` state; auto-selects `courseCodeIds[0]`; no picker shown if only 1 course (zero regression for single-course facilitators)
- [ ] C3 — Ant Design Select rendered above dashboard tabs when `courseCodeIds.length > 1`; switching drives all tabs
- [ ] C4 — `KnowMeStatusTab` receives `selectedCourseCodeId` instead of raw `courseCodeId` prop; re-fetches automatically on change (already wired via useEffect dependency)
- [ ] C5 — Verify all other tab data fetches (progress, enrollees, trends) re-trigger on course switch

---

## Deployment order (all phases)

1. `sqitch deploy` (warehouse) — Phase A
2. Build + deploy titulino-net-api — Phase A
3. Release titulino-ui — Phase A
4. Repeat steps 2–3 for Phase B changes
5. Repeat steps 2–3 for Phase C changes

---

## Next session notes

- After Phase C ships: move this plan to `docs/plans/completed/`
- Phase 3 (third-party/external facilitator) is documented in `docs/plans/active/2026-07-21-facilitator-know-me-dashboard.md` — do not start until Phase 2 is fully deployed and verified
