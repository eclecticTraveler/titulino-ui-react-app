# Facilitator Know Me Dashboard

**Started:** 2026-07-21  
**Status:** Planning complete — ready to implement

## Goal

Add a "Know Me" tab to the Facilitator Dashboard so facilitators can see, at a glance, which students have submitted their Know Me essays, what their AI review status is, and read the full essay + feedback for any student.

## Privacy decision (recorded)

The existing KnowMe submission consent checkbox is sufficient. When a student enrolls in a course and submits their essays, it is understood that their facilitator (their teacher of record for that course) can read the work. No additional consent layer is needed under the current single-organization model. Revisit if/when facilitators from outside the organization are onboarded.

---

## Phase 1 — Core Feature (T1–T9)

### Progress

- [x] T1 — Warehouse: new Sqitch migration
- [x] T2 — titulino-net-api: RepositoryClient method
- [x] T3 — titulino-net-api: LrnManager + DTO
- [x] T4 — titulino-net-api: LrnController endpoint
- [x] T5 — titulino-ui: TitulinoLrnNetService
- [x] T6 — titulino-ui: Redux action
- [x] T7 — titulino-ui: KnowMeStatusTab component
- [x] T8 — titulino-ui: Wire tab into FacilitatorsLandingDashboard
- [x] T9 — Documentation (work log)

---

### T1 — Warehouse: Sqitch migration

**File name:** `Lrn/2026/07/21_facilitator_know_me_status`  
**Sqitch command:**
```
sqitch add Lrn/2026/07/21_facilitator_know_me_status -n "RPC for facilitator to view Know Me AI status by course"
```

**Inner function:**

```sql
CREATE OR REPLACE FUNCTION "Lrn".get_know_me_ai_status_by_course(
    p_course_code_id text
)
RETURNS TABLE (
    "ContactInternalId"   uuid,
    "FullName"            text,
    "ClassNumber"         int,
    "Status"              text,
    "CompletedAt"         timestamp,
    "EssaysJson"          jsonb,
    "CorrectedEssaysJson" jsonb,
    "FeedbackJson"        jsonb
)
LANGUAGE sql STABLE SECURITY INVOKER AS $$
    SELECT DISTINCT ON (cc."ContactInternalId", j."ClassNumber")
        cc."ContactInternalId",
        (e."Names" || ' ' || e."LastNames")::text AS "FullName",
        j."ClassNumber",
        j."Status",
        j."CompletedAt",
        j."EssaysJson",
        j."CorrectedEssaysJson",
        j."FeedbackJson"
    FROM "Enrollment"."Contact_Course" cc
    JOIN "Enrollment"."vm_Enrollee" e ON e."ContactInternalId" = cc."ContactInternalId"
    LEFT JOIN "Lrn"."KnowMeSubmission" s
        ON s."ContactInternalId" = cc."ContactInternalId"
        AND s."CourseCodeId" = cc."CourseCodeId"
    LEFT JOIN "Lrn"."KnowMeAiJob" j
        ON j."SubmissionId" = s."SubmissionId"
    WHERE cc."CourseCodeId" = p_course_code_id
      AND cc."IsEnrolled" = true
    ORDER BY cc."ContactInternalId", j."ClassNumber", j."CreatedAt" DESC NULLS LAST
$$;

GRANT EXECUTE ON FUNCTION "Lrn".get_know_me_ai_status_by_course(text)
    TO postgres, service_role;
```

**API wrapper:**

```sql
CREATE OR REPLACE FUNCTION "TitulinoApi_v1"."GetKnowMeAiStatusByCourse"(
    p_course_code_id text
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    result jsonb;
BEGIN
    SELECT COALESCE(jsonb_agg(row_to_json(r)), '[]')
    INTO result
    FROM "Lrn".get_know_me_ai_status_by_course(p_course_code_id) r;
    RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION "TitulinoApi_v1"."GetKnowMeAiStatusByCourse"(text)
    TO postgres, service_role, titulino_facilitator, titulino_administrator, super_admin;
```

---

### T2 — RepositoryClient

**Interface** (`IRepositoryClient.cs`):
```csharp
Task<string> GetKnowMeAiStatusByCourseAsync(string courseCodeId);
```

**Implementation** (`RepositoryClient.cs`) — same pattern as `GetKnowMeAiJobResultAsync`: POST to `TitulinoApi_v1/GetKnowMeAiStatusByCourse` with `{ p_course_code_id: courseCodeId }`.

---

### T3 — LrnManager + DTO

**DTO** (`DTOs/KnowMeAiStatusEntry.cs`):
```csharp
public class KnowMeAiStatusEntry
{
    public Guid ContactInternalId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public int ClassNumber { get; set; }
    public string? Status { get; set; }
    public DateTime? CompletedAt { get; set; }
    public JsonElement? EssaysJson { get; set; }
    public JsonElement? CorrectedEssaysJson { get; set; }
    public JsonElement? FeedbackJson { get; set; }
}
```

**Manager** — parses the jsonb array from the repo, maps each element to `KnowMeAiStatusEntry`, returns `IEnumerable<KnowMeAiStatusEntry>`.

---

### T4 — Controller endpoint

```
GET /api/lrn/know-me-ai-status/{courseCodeId}
```

Auth: roles `titulino_facilitator`, `titulino_administrator`, `super_admin`.  
Returns: `200 OK` with the array of entries.

---

### T5 — UI Service

**File:** `src/services/Lrn/TitulinoLrnNetService.js`

```js
getKnowMeAiStatusByCourse: async (courseCodeId) => {
    // GET /api/lrn/know-me-ai-status/{courseCodeId}
    // returns [] on error
}
```

---

### T6 — Redux action

**File:** `src/redux/actions/Lrn.js`

```js
export const onFetchingKnowMeAiStatusByCourse = (courseCodeId) => async (dispatch) => {
    const result = await TitulinoLrnNetService.getKnowMeAiStatusByCourse(courseCodeId);
    dispatch({ type: KNOW_ME_AI_STATUS_LOADED, payload: result });
    return result;
};
```

State slice: `knowMeAiStatus: []` in the Lrn reducer (or Analytics reducer, whichever owns the facilitator dashboard state).

---

### T7 — KnowMeStatusTab component

**File:** `src/components/admin-components/Insights/KnowMeStatusTab.js`

**Layout:**

1. **Summary bar chart** — X axis: class number. Y axis: count of entries with a non-null Status. Rendered with existing `ColumnBar` component. A separate "total enrolled" reference line so the facilitator can see completion rate at a glance.

2. **Class number filter** — Ant Design Select, options derived from distinct ClassNumbers in the data.

3. **Roster table** — AbstractTable columns:
   - Student name
   - Class number (hidden when filter is active — it's redundant)
   - Status chip: `completed` → green tag, `pending`/`processing` → blue/orange tag, `failed` → red tag, no status → grey "Not submitted"
   - Completed at (formatted date, blank if null)

4. **Expandable row** — renders the same essay card layout as KnowMeV3 completed view:
   - Original answer
   - Corrected version
   - English feedback (summary, grammar notes, vocabulary)
   - Native language feedback (if present)

---

### T8 — Wire tab into FacilitatorsLandingDashboard

- Add `onFetchingKnowMeAiStatusByCourse` to `mapDispatchToProps`
- Add `knowMeAiStatus` to `mapStateToProps`
- Dispatch fetch when the "Know Me" tab becomes active (lazy load, same pattern as avatar hydration)
- Add tab item after Trends, before eBook

---

### T9 — Documentation

- Work log entry `docs/work-logs/2026-07-21.md`
- `docs/Architecture.md` — add new RPC + endpoint to the LRN section
- Mark all tasks complete in this plan file
- Move plan to `docs/plans/completed/`

---

## Phase 2 — Multi-Facilitator Expansion

**Not yet scheduled. Document the path before starting any work.**

### What already works today

The database is already built for multiple facilitators:
- `"Enrollment"."UserRole_Course"` is many-to-many — a course can have N rows with `"UserRoleId" = 'titulino_facilitator'`, one per teacher.
- RLS policies on the Enrollment schema use `"Auth"."vmUserCourseRoles"` to scope each facilitator's readable contact set to their assigned courses.
- The new `GetKnowMeAiStatusByCourse` RPC scopes by `courseCodeId` — any facilitator assigned to that course automatically gets the correct view.
- The `.NET API` endpoint will authorize by checking the caller's JWT role — the same pattern used by all other facilitator endpoints.

**Result: adding a second facilitator to an existing course requires only a row insert into `UserRole_Course`. No code changes.**

### What is NOT built yet

| Gap | Description |
|---|---|
| **No admin UI for facilitator assignment** | Adding a facilitator to a course requires a manual insert into `"Enrollment"."UserRole_Course"`. There is no screen in Admin Tools to do this. |
| **No multi-course switcher for facilitators** | `FacilitatorsLandingDashboard` receives a single `courseCodeId` prop from its parent. If a facilitator is assigned to 2 courses, the parent needs a course-selector UI. Currently unbuilt. |
| **No facilitator self-service** | A facilitator cannot see which courses they are assigned to — they only see the one the system hands them. |

### Phase 2 task list (pre-planning, not sized yet)

- [ ] **P2-T1 — Admin UI: Assign Facilitator to Course**
  A panel in Admin Tools where a super_admin can search for a contact and assign the `titulino_facilitator` role to one or more course codes. Backed by a new Sqitch migration wrapping an upsert into `UserRole_Course`.

- [ ] **P2-T2 — Admin UI: Remove Facilitator from Course**
  Counterpart to P2-T1 — DELETE from `UserRole_Course`. Needs confirm dialog.

- [ ] **P2-T3 — Facilitator Dashboard: Multi-Course Selector**
  When a facilitator has more than one course, show a course picker above the dashboard card (or as a header dropdown). The selected course drives `courseCodeId` for all existing tabs + the new Know Me tab.
  - The list of the facilitator's courses comes from `"TitulinoApi_v1"."GetUserRoles"` (which already returns UserRole_Course rows) or a new thin RPC `GetFacilitatorCourses(email_id text)`.

- [ ] **P2-T4 — Enrollment page: Show Facilitator Name per Course**
  Students on their course enrollment landing page may benefit from seeing who their facilitator is. Low priority.

### RLS note

When a second facilitator is added to a course, RLS on `"Enrollment"."Contact_Course"` and `"Enrollment"."vm_Enrollee"` will automatically restrict each facilitator's PostgREST direct-query access to only their assigned courses. The `.NET API` layer (`SECURITY DEFINER` wrappers) additionally enforces this at the application level via JWT role check. Both layers protect correctly — no additional RLS work is needed for Phase 2.

---

## Phase 3 — Third-Party (External) Facilitator Support

**Not yet scheduled. These concerns do not apply to internal/employee facilitators but become relevant the moment an external person (not employed by Activated Insights) is given facilitator access.**

### What changes when a facilitator is external

An internal facilitator is the teacher of record — they own the relationship with the student, and viewing essays is part of their job. An external facilitator (a partner organization's trainer, a contracted teacher, etc.) is a third party. Two things change:

1. **Privacy boundary**: The student enrolled with Activated Insights, not with the external facilitator. There is no contractual relationship between the student and the third party. Viewing essay content without explicit consent may be a FERPA/GDPR concern depending on jurisdiction and the nature of the data.
2. **Access scope creep risk**: External facilitators should never be able to see data from courses they are not assigned to. The DB enforces this today, but the admin UI that grants them access (P2-T1) must be auditable.

### What needs to be built before onboarding any external facilitator

- [ ] **P3-T1 — Explicit facilitator-viewing consent in the submission form**
  Add a second checkbox to `KnowMeV3.js` (separate from the existing `consent` field):
  > "I allow my facilitator to view my submitted essays and AI feedback."
  - Default: checked (preserves current behavior for internal facilitators).
  - Add `"FacilitatorConsent"` boolean column to `"Lrn"."KnowMeSubmission"` via Sqitch migration, `DEFAULT true`.
  - Update `upsert_know_me_submission` to accept and write the flag.
  - Update `"Lrn".get_know_me_ai_status_by_course` to accept `p_require_consent boolean DEFAULT false`. When `true`, adds `AND s."FacilitatorConsent" = true` to the JOIN. Flip this flag per-course (stored in `Course."CourseDetails"` jsonb) when the course is taught by an external facilitator.

- [ ] **P3-T2 — Facilitator access audit log**
  When `GetKnowMeAiStatusByCourse` is called, log: caller email, courseCodeId, timestamp, and whether essay content was returned. Use the existing `"Log"` schema. This gives a paper trail that a specific facilitator accessed specific student data on a specific date.
  - New Sqitch migration: insert into a `"Log"."FacilitatorDataAccess"` table (or reuse `"Log"."AppEvent"` if it already exists).
  - The `.NET API` `LrnManager.GetKnowMeAiStatusByCourseAsync` calls the logger after fetching results.

- [ ] **P3-T3 — External facilitator onboarding flow**
  External facilitators need an account before they can be assigned a course. Two options:
  - **Option A**: They self-enroll as a student first, then an admin upgrades their role. Low friction but messy (student data in the system).
  - **Option B**: An admin creates a contact record directly (without enrollment) and assigns the facilitator role. Cleaner but requires a new admin UI screen.
  Recommend Option B. Requires: new admin form (name, email → upsert Contact + UserRole_Course in one transaction).

- [ ] **P3-T4 — Data processing agreement (non-technical)**
  Before any external facilitator is given access, a Data Processing Agreement (DPA) or equivalent must be signed. This is a legal/compliance artifact, not a code task. Flag for legal review before P3-T1 is deployed and before any external onboarding begins.

### What already protects correctly today (no changes needed)

- RLS scopes every query to the facilitator's assigned courses only — an external facilitator cannot see data from a course they are not assigned to, even if they guess a courseCodeId.
- The `.NET API` auth policy (`GlobalAccessAdminUserOrFacilitator`) gates the endpoint — an unauthenticated or student-role caller cannot reach it.
- JWT token expiry is enforced — facilitator sessions time out like all other sessions.

### Recommended order

Do Phase 2 (admin UI for assignment, multi-course switcher) first. Only move to Phase 3 when you have a specific external facilitator ready to onboard. P3-T4 (legal) must be started in parallel with P3-T1 (consent flag), not after.
