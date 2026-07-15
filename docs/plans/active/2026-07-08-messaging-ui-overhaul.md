# Messaging UI Overhaul

**Created:** 2026-07-08  
**Branch:** profile-issues  
**Primary file:** `src/components/admin-components/Insights/GlobalAdminToolsLandingDashboard.js`

---

## Problem summary

The messaging section has four compounding UX problems:

1. **No clear workflow** — tabs are ordered Message | Audience | Visualization | Certifications | History with no left-to-right send flow. The Send button lives in the Compose tab even though the user hasn't reviewed their audience yet.
2. **Admin tools cluttering compose** — Category Manager, Variable Manager, Template Manager buttons sit inline under the Category Select, mixing config tools with the write-a-message workflow.
3. **Silent send gate** — `canSendAudienceMessage` is `false` with no explanation. Users don't know which condition (category, content, audience) is blocking them.
4. **No visual structure in compose** — Subject, two separate variable pickers, body textarea, "Load from template" appear as an undifferentiated stack. No labels, no dividers, no clear sections.

---

## Proposed tab structure

One `Tabs` component, two visual groups separated by a non-clickable divider tab item:

```
[Compose] [Audience] [Review]  |  [History] [Certifications] [Setup]
 ←── workflow (left to right) ──   ←── reference & tools ──────────
```

| New Tab | Was | Purpose |
|---|---|---|
| Compose | Message | Write subject + body, pick category/course. No manager buttons. |
| Audience | Audience | Existing audience filters. Unchanged. |
| Review | Visualization | Existing viz + readiness checklist + **Send button** |
| — divider — | — | Visual separator, non-interactive |
| History | History | Unchanged |
| Certifications | Certifications | Unchanged (future: moves to Insights section) |
| Setup | *(new)* | Category Manager, Variable Manager, Template Manager |

---

## Compose tab — new section layout

Replace flat stack with four labeled `Divider` sections:

```
── Routing ──────────────────────────────────────────
  [Category (required) ▼]      [Course Code ID ▼]

── Template ─────────────────────────────────────────   ← only if templates exist
  [Load from template ▼]

── Subject ──────────────────────────────────────────
  [Subject input __________________] [Insert variable ▼]

── Message Body ─────────────────────────────────────
  [Insert variable ▼]   ← small toolbar row above textarea
  [                          textarea                  ]
```

---

## Review tab — readiness checklist

Small checklist panel rendered above the Send button. Each item is a green checkmark (done) or gray circle (not yet):

```
  ✅  Category selected
  ○   Subject — add a subject line
  ✅  Message body
  ○   Audience — go to Audience tab and apply filters (0 selected)
  ○   Course Code ID   ← only if T1 confirms DB requires it
```

Send button stays disabled until all are checked. The checklist replaces the opaque "button is just gray" state.

---

## Progress

- [x] **T1** — DB audit: CourseCodeId is nullable text at all layers — no enforcement needed
- [x] **T2** — Tab restructure: compose / audience / review / | / history / certifications / setup
- [x] **T3** — Setup tab: 3 manager cards (Category, Variable, Template)
- [x] **T4** — Send button + Popconfirm moved to Review tab (inside readiness checklist card)
- [x] **T5** — Compose tab: 4 labeled Divider sections (Routing / Template / Subject / Message Body)
- [x] **T6** — Review tab: pre-send readiness checklist (4 items: category, subject, body, audience)
- [x] **T7** — SKIPPED: CourseCodeId is optional and nullable — "optional" label is correct
- [x] **T8** — Certifications tab Course filter → `audienceCourseGroupedOptions` (grouped by year)
- [x] **T9** — 23 new locale keys added to en/es/pt (tabs, sections, checklist, setup)
- [x] **T10** — 147/147 AudienceMessaging tests pass

---

## Regression test checklist (manual, in browser)

### Compose tab
- [ ] All 4 section dividers visible: Routing / Template / Subject / Message Body
- [ ] Category dropdown works, clears correctly
- [ ] Course Code ID dropdown shows options **grouped by year** (most recent first)
- [ ] Load from template section only appears when templates exist; selecting one fills Subject + Body
- [ ] Subject input + subject variable picker work; inserting a variable adds it at cursor
- [ ] Body variable picker above textarea; inserting a variable adds it at cursor
- [ ] "Show variable preview" toggle works
- [ ] **No Send button** visible in Compose tab
- [ ] **No manager buttons** (Category Manager / Variable Manager / Template Manager) in Compose tab

### Audience tab
- [ ] All existing audience filters work (gender, age, country, course, etc.)
- [ ] Pagination works (page size InputNumber + Pagination component)
- [ ] "Exclude: Category already sent" Select clears correctly (× button works)
- [ ] Audience segment title shows "X of Y" format

### Review tab
- [ ] Checklist card visible at top with 4 items
- [ ] Each item shows green ✅ when done, yellow ⚠ when not done, with a hint
- [ ] Send button present; disabled when any checklist item is not done
- [ ] Send button tooltip shows which condition is blocking when disabled
- [ ] Popconfirm fires on Send click; shows recipient count
- [ ] After confirm, success toast appears and draft resets
- [ ] Visualization summary cards (backend count, loaded rows, selected rows, emails) render below checklist
- [ ] Gender / residency / language level snapshot cards render

### History tab
- [ ] History grid loads and filters (category, course code) work
- [ ] "Apply" button required after filter change (dirty alert visible)
- [ ] Chart and grid populate correctly
- [ ] Export button works

### Certifications tab
- [ ] Course filter shows options **grouped by year**
- [ ] Selecting source (selected vs loaded audience) + filters + Load button loads data
- [ ] Table renders certification rows

### Setup tab
- [ ] 3 manager cards visible (Category, Variable, Template)
- [ ] Clicking "Manage" on each card opens the correct modal
- [ ] All 3 modals open, function, and close correctly (add/edit/save)

### Cross-cutting
- [ ] Switching between tabs does not lose draft content (subject, body, category, course code)
- [ ] Tab divider `|` is non-clickable and does not change active tab
- [ ] All text in Spanish (es_US) and Portuguese (pt_BR) — tab names, section dividers, checklist

---

## Notes

- Manager modals (Category/Variable/Template) are rendered at the component root (lines 9244–9246). They stay there. Only the trigger buttons move to the Setup tab.
- `canSendAudienceMessage` currently = `selectedAudienceRows.length > 0 && hasAudienceMessageDraftContent && categoryId != null`. The checklist mirrors this exactly; T7 may add a 4th condition.
- Certifications tab content is unchanged for now. Its long-term home is a future standalone Insights section (see memory: `project_audience_insights_tab_idea.md`).
- The divider tab item uses `disabled: true` + a custom label render (thin `|` line, no pointer cursor via CSS).
- Course dropdown year-grouping (T8) applies the same pattern already used elsewhere in the app. Extract year from CourseCodeId string (e.g. `COURSE_SEP_2024_01` → 2024) or from a year field on the course object.
