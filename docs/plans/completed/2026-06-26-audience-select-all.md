# Plan: Audience Segment — Select All Across Pages

**Created:** 2026-06-26  
**Status:** Complete  
**Working branch:** mergeContact  
**Agent:** Claude Sonnet 4.6

---

## Business brief

> In the Admin Tools messaging section, the audience segment table has a checkbox per row and a "select all" header checkbox. Currently that checkbox only selects the 25 rows visible on the current client-side page. The user wants to be able to select all loaded contacts at once without going page by page. The table shows a count like "Segmento de Audiencia (1434)" indicating the total filtered audience size.

---

## How the current system works (context for the plan)

The table has two layers of pagination:

| Layer | Where | Current value |
|---|---|---|
| Server-side | `p_limit` sent to the API | 100 rows loaded at a time |
| Client-side | Ant Design `pageSize` | 25 rows visible per page |

Ant Design's default "select all" header checkbox only selects the **currently visible page** (25 rows). To select all 100 loaded rows the user must go through 4 pages. To reach all 1434 they would need to load more and repeat.

The selected rows flow to `handleSendAudienceMessage → onSendingAudienceMessage(emailId, selectedAudienceRows, draft)` which calls `buildAudienceMessagePayload` in `src/lob/AudienceMessaging.js`. That function needs the full row objects (contactInternalId, fullName, emailList) — not just IDs.

---

## Scope — what this plan will change

- `src/components/admin-components/Insights/GlobalAdminToolsLandingDashboard.js` — add `selections` array to the existing `rowSelection` config on the audience Table

## Out of scope

- No changes to Redux actions, reducers, services, managers, or LOB files
- No changes to how the message is sent downstream
- Fetching all 1434 rows from the server in one call (a separate future plan if needed)
- Any other table in the app

---

## Guardrail check

- [x] No hard-stop operations
- [x] No credentials in source
- [x] No production database
- [x] Shared components: `GlobalAdminToolsLandingDashboard.js` is a single-use admin component — blast radius is contained to admin tools messaging view
- [x] All steps in scope
- [x] Each step is atomic

---

## Atomic steps

- [x] **Step 1:** Add a `selections` array to the `rowSelection` prop on the audience `<Table>` in `GlobalAdminToolsLandingDashboard.js` with two custom options:
  - **"Select all [N] loaded contacts"** — calls `setSelectedAudienceRowKeys(audienceRows.map(r => r.key))` and `setSelectedAudienceRows(audienceRows)`, selecting every row in the currently loaded dataset regardless of which client-side page is visible
  - **"Clear selection"** — calls `setSelectedAudienceRowKeys([])` and `setSelectedAudienceRows([])`

  Done when: clicking the dropdown arrow next to the header checkbox shows both options; clicking "Select all X loaded contacts" checks all rows across all client-side pages; the selected count in any downstream UI reflects the full loaded count.

---

## What the change looks like

Current `rowSelection`:
```js
rowSelection={{
  selectedRowKeys: selectedAudienceRowKeys,
  onChange: (keys, rows) => {
    setSelectedAudienceRowKeys(keys);
    setSelectedAudienceRows(rows);
  }
}}
```

After (adding `selections`):
```js
rowSelection={{
  selectedRowKeys: selectedAudienceRowKeys,
  onChange: (keys, rows) => {
    setSelectedAudienceRowKeys(keys);
    setSelectedAudienceRows(rows);
  },
  selections: [
    {
      key: 'select-all-loaded',
      text: `Select all ${audienceRows?.length ?? 0} loaded contacts`,
      onSelect: () => {
        setSelectedAudienceRowKeys((audienceRows ?? []).map(r => r.key));
        setSelectedAudienceRows(audienceRows ?? []);
      }
    },
    {
      key: 'clear-all',
      text: 'Clear selection',
      onSelect: () => {
        setSelectedAudienceRowKeys([]);
        setSelectedAudienceRows([]);
      }
    }
  ]
}}
```

---

## Discovered / Out of scope

| Found on | Description | Added to plan? |
|---|---|---|
| 2026-06-26 | If user wants to select ALL 1434 (beyond the loaded 100), a separate plan is needed to either remove the server-side limit or add a "fetch all and select" flow | No — separate plan |

---

## Session log

| Date | Agent | Steps completed | Notes |
|---|---|---|---|
| 2026-06-26 | Claude Sonnet 4.6 | Plan written only | No code changes. Awaiting user approval. |
| 2026-06-26 | Claude Sonnet 4.6 | Step 1 ✅ | Added `selections` array to `rowSelection` in GlobalAdminToolsLandingDashboard.js line 7253. Plan complete. |

---

## Done when (overall)

Clicking the checkbox column dropdown in the audience table shows "Select all N loaded contacts" and "Clear selection" options; selecting all marks every loaded row as checked across all client-side pages; `handleSendAudienceMessage` receives all selected rows correctly.
