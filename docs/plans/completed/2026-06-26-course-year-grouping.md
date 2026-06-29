# Plan: Course Year Grouping + Year Visibility

**Created:** 2026-06-26  
**Status:** Approved — pending execution  
**Working branch:** mergeContact  
**Agent:** Claude Sonnet 4.6

---

## Business brief

Three UI locations show courses without any year grouping or year label. Users cannot quickly identify which year/cohort a course belongs to. Year is always derived from the course's **start date**.

Changes requested:
1. **Enrollee Insights dropdown** — group courses by year (year as section header), most recent year at top
2. **Admin Tools Contact Summary — Roles & Courses** — add a year tag next to each course code ID badge
3. **Admin Tools Contact Detailed — Courses History grid** — add Year to the Course column and keep sort descending by year

---

## Findings

### Data available per location

| Location | File | Has startDate? | Notes |
|---|---|---|---|
| Enrollee Insights dropdown | `DropdownInsightSelection.js` L88-100 | **No** (not in converter output) | `courseSelectionConverter()` in `AdminInsights.js` strips dates — need to verify if raw `allCourses` Redux data has `StartDate` before adding it |
| Admin Tools Summary — Roles & Courses | `GlobalAdminToolsLandingDashboard.js` L3617-3688 | **Yes** (`startDate` on each row) | Built by `buildContactCourseHistoryRows()` — startDate already available, just not rendered |
| Admin Tools Detailed — Courses History grid | `GlobalAdminToolsLandingDashboard.js` L3968-4036 | **Yes** (`startDate` column exists) | Already sorted descending by startDate — only needs year surfaced visually in Course column |

### Course option shape (current — Insights dropdown)
```js
// AdminInsights.courseSelectionConverter() output:
{
  index: number,
  name: string,        // CourseDetails.course
  value: string,       // CourseCodeId
  isInProgress: boolean
}
// Missing: startDate
```

### Course row shape (current — Admin Tools both sections)
```js
// buildContactCourseHistoryRows() output:
{
  key: string,
  courseCodeId: string,
  title: string,
  imageUrl: string,
  targetLanguageId: string,
  audienceLanguageId: string,
  startDate: string,   // ISO date string — AVAILABLE
  endDate: string,
  roleId: string
}
```

### Pre-coding verification required for Task 1
The raw `analytics.allCourses` data in Redux must be inspected to confirm whether `StartDate` (or equivalent) is present on each course object before adding it to the converter. If not present, a backend change or fallback strategy is needed.

---

## Tasks

Each task is self-contained and can be executed in any order. Tasks 2 and 3 can be done immediately (data is available). Task 1 requires a pre-step verification.

---

### Task 1 — Enrollee Insights Dropdown: Year Group Headers
**Status:** [ ] Not started  
**Complexity:** Medium  
**Depends on:** Pre-step verification (see below)

**Pre-step (do before coding):**
- Read `src/lob/AdminInsights.js` — find `courseSelectionConverter()` and the raw input shape
- Check whether the Redux source (`analytics.allCourses`) carries a `StartDate` or `StartYear` field
- If yes → add `startDate` to the converter output (small LOB change), then proceed
- If no → decide: parse year from CourseCodeId (brittle — `ADMIN_GENERAL_CLASSES` has none) vs backend change (proper)

**Files to change:**
1. `src/lob/AdminInsights.js`
   - `courseSelectionConverter()` — add `startDate` to returned shape (if raw data has it)
2. `src/components/admin-components/Insights/DropdownInsightSelection.js`
   - Replace flat `<Select.Option>` list with `<Select.OptGroup label={year}>` groups
   - Group courses by `new Date(course.startDate).getFullYear()`
   - Sort groups descending (2026 → 2025 → 2024 → ...)
   - Courses with no start date → group under "General" at bottom

**Expected result:**
```
2026
  ├── Work & Jobs Part 1 - WORK_AND_JOBS_JULY_2025_COURSE_01
  ├── TEST Von - Part 1 - TEST_VON_PART_1_MAY_2026_COURSE_01
2025
  ├── English Connect 1 - ENGLISHCONNECT_01_JUN_2025_CO...
  ├── English Connect 2 - ENGLISHCONNECT_02_JUN_2025_CO...
2024
  ├── Supermarket - SUPERMARKET_SEP_2024_COURSE_01
General
  ├── Admin - ADMIN_GENERAL_CLASSES
```

---

### Task 2 — Admin Tools Summary: Year Tag Next to Course Code
**Status:** [ ] Not started  
**Complexity:** Small  
**Data available:** Yes — `startDate` already in the row objects

**File to change:**
- `src/components/admin-components/Insights/GlobalAdminToolsLandingDashboard.js`
  - Function: `renderRolesAndCourses()` — L3670-3679
  - Add a small `<Tag>` showing the year extracted from `course.startDate`
  - Position: inline after the course code badge
  - Fallback: if no startDate, render nothing (don't show empty tag)

**Expected result (current):**
```
Facilitator
  [Household Items - Part 1]  [HOUSEHOLD_ITEMS_PART_1_JAN_2025_COURSE_01]
```

**Expected result (after):**
```
Facilitator
  [Household Items - Part 1]  [HOUSEHOLD_ITEMS_PART_1_JAN_2025_COURSE_01]  [2025]
```

---

### Task 3 — Admin Tools Detailed: Year in Course Column
**Status:** [ ] Not started  
**Complexity:** Small  
**Data available:** Yes — `startDate` already in the row objects, column already exists

**File to change:**
- `src/components/admin-components/Insights/GlobalAdminToolsLandingDashboard.js`
  - Function: `renderContactCourseHistory()` — Course column render L3981-3996
  - Add year as a sub-label below the course title within the same Course column cell
  - Extract: `new Date(record.startDate).getFullYear()`
  - Fallback: if no startDate, render nothing below title

**Note on sort:** Grid already sorts descending by startDate — no change needed.

**Expected result (Course column, after):**
```
[thumbnail]  Work & Jobs Part 1
             2025
```
or as a small tag:
```
[thumbnail]  Work & Jobs Part 1  [2025]
```

---

## Execution order

1. **Task 2** (Admin Tools Summary year tag) — simplest, no data gap, safe change
2. **Task 3** (Admin Tools Detailed year in course column) — same file, do immediately after Task 2
3. **Task 1** (Insights dropdown grouping) — requires pre-step verification first

---

## Files summary

| File | Tasks | Change type |
|---|---|---|
| `src/lob/AdminInsights.js` | Task 1 (conditional) | LOB: add `startDate` to converter output |
| `src/components/admin-components/Insights/DropdownInsightSelection.js` | Task 1 | UI: OptGroup year headers |
| `src/components/admin-components/Insights/GlobalAdminToolsLandingDashboard.js` | Tasks 2, 3 | UI: year tag + year in course column |

No Redux, service, or SQL changes required for Tasks 2 and 3.  
Task 1 may require a LOB change depending on pre-step verification result.

---

## Progress tracking

- [x] Task 1 — Pre-step: verify `allCourses` data shape in `AdminInsights.js` — StartDate confirmed present on raw API objects
- [x] Task 1 — LOB: add `startDate` to `courseSelectionConverter()` (`AdminInsights.js:142`)
- [x] Task 1 — UI: `DropdownInsightSelection.js` year OptGroup grouping (L20-30, L95-102)
- [x] Task 2 — UI: year tag in `renderRolesAndCourses()` (L3669-3688, `GlobalAdminToolsLandingDashboard.js`)
- [x] Task 3 — UI: year in Course column in `renderContactCourseHistory()` (L3992-4003, `GlobalAdminToolsLandingDashboard.js`)
- [ ] Commit all three tasks together or in sequence
- [ ] Work log entry updated
