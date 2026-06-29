# Plan: Contact Roles & Courses Display Fix
Date: 2026-06-26
Status: pending approval

## Problem

The Summary tab "Roles & Courses" section and the Detailed tab "Courses" table show different course sets for the same contact. Courses with no role assignment (e.g. Supermarket — shows as "Unknown" role in Detailed) appear in Detailed but are silently dropped from Summary.

---

## Root cause

### Two different data sources for the same data

| Tab | Function | Source |
|---|---|---|
| Summary → Roles & Courses | `renderRolesAndCourses(roles, courses)` | `selectedContact.UserCourseRoles` ONLY |
| Detailed → Courses table | `buildContactCourseHistoryRows(contact, allRawCourses)` | Merges `CoursesHistory` + `UserCourseRoles` |

### What each source contains (from `Enrollment.vm_ContactProfile`)

**`CoursesHistory`** — aggregated from `Enrollment.Contact_Course`:
- Every course the contact was ever enrolled in
- No status filtering — includes past, present, and future enrollments

**`UserCourseRoles`** — aggregated from `Enrollment.UserRole_Course`:
- Only courses where a role was explicitly assigned (`UserRoleId` exists)
- A course can exist in `Contact_Course` without a corresponding row in `UserRole_Course`

### Why Supermarket disappears from Summary

Supermarket has an enrollment in `Contact_Course` → appears in `CoursesHistory`.
Supermarket has no matching entry in `UserRole_Course` (role = "Unknown") → does NOT appear in `UserCourseRoles`.
`renderRolesAndCourses` only reads `UserCourseRoles` → Supermarket is silently dropped.

---

## Backend DDL reference

**View:** `Enrollment.vm_ContactProfile`
**File:** `deploy/Enrollment/2026/05/05_add_new_view_unfiltered_contacts_1.sql`

```sql
-- CoursesHistory: all Contact_Course enrollments
SELECT jsonb_agg(...)
FROM Enrollment.Contact_Course ccs
JOIN Enrollment.Course csc ON ccs.CourseCodeId = csc.CourseCodeId
WHERE ccs.ContactInternalId = c.ContactInternalId

-- UserCourseRoles: only UserRole_Course assignments
SELECT jsonb_agg(...)
FROM Enrollment.UserRole_Course urc
JOIN Enrollment.UserRole ur ON ur.UserRoleId = urc.UserRoleId
WHERE urc.ContactInternalId = c.ContactInternalId
```

No WHERE clause filtering on either — both return everything they have. The gap is structural: not every enrollment gets a role assignment.

---

## Fix

### Step 1 — Summary tab: use the same merged dataset as Detailed

- [ ] In `renderRolesAndCourses(roles, courses)` (line ~3612), change the data source so it reads from the already-merged `buildContactCourseHistoryRows(selectedContact, allRawCourses)` result
- [ ] Courses with no role assignment should still appear in Summary — grouped under a generic "Student" or "Unknown" role bucket rather than being dropped
- [ ] The role grouping logic (`UserRoleId → UserRolePriority`) should still apply for courses that DO have a role; courses without a role go at the end

### Step 2 — Sort courses by most recent start date first

- [ ] In `buildContactCourseHistoryRows`, add a sort step after deduplication: sort by `startDate` descending (most recent first)
- [ ] Apply the same sort in `renderRolesAndCourses` so the Summary tags also reflect recency order

### Step 3 — Add course count to Summary section header

- [ ] The Summary "Roles & Courses" section should show the total count of courses so it is immediately obvious if courses are missing (e.g., "Roles & Courses (5)")

---

## Files to change

| File | Change |
|---|---|
| `src/components/admin-components/Insights/GlobalAdminToolsLandingDashboard.js` | Steps 1, 2, 3 |
| `src/lob/` | Step 2 sort — if `buildContactCourseHistoryRows` lives here, add sort there |

---

## Verification

1. Open the contact shown in screenshots (Carla Gisel Ross)
2. Summary → Roles & Courses: should show 5 courses including Supermarket
3. Detailed → Courses: should show same 5 courses in same order (most recent first)
4. A contact with no role assignments but with enrollments should still show courses in Summary
5. Course count in Summary header matches Detailed count
