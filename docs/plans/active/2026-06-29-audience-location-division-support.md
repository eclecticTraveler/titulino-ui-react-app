# Plan: Audience Location UX + Division Support
Date: 2026-06-29
Status: pending approval

## Background

The dual-location filter UI (Residency/Birth rows with Include/Exclude) was built in Dev. The React app calls Supabase RPC directly — there is no C# middleware in this path. The LOB (`AudienceMessaging.js`) already builds the payload with the new parameters (`p_residency_country`, `p_birth_country`, etc.). The only missing piece is that the **Supabase stored procedures** don't yet accept those new parameters.

This plan also adds:
- A "All Locations" visual default state so users understand blank = no filter
- Country division dropdowns populated from enrolled students only, with "Unknown" for contacts missing division data

### Data flow (confirmed)

```
React UI → buildContactSegmentPayload() [LOB]
    ↓ HTTP POST
https://...supabase.co/rest/v1/rpc/GetContactSegment   ← direct, no C# in between
    ↓
Supabase stored procedure (TitulinoApi_v1 schema)
```

The `titulino-communication` C# library is used by the worker/email service, NOT by the React UI for segmentation queries. No C# changes are needed.

---

## Q&A Summary (from session 2026-06-29)

| Question | Answer |
|---|---|
| If Dev rows are left blank = All Locations? | Yes — no parameters sent = all contacts. But needs a visual indicator. |
| Do we need Supabase migrations? | Yes, for the E2E dual-filter and the division support. Not for the UI label. |
| Division support needs a migration? | Yes — update GetCountryDivisions SP to filter by enrolled students, add Unknown row. |
| Does the C# backend need updating? | No — React calls Supabase RPC directly, C# is only in the worker/email path. |

---

## Tasks (easiest → hardest)

### TRACK A — "All Locations" UI label (UI-only, no backend)

- [x] **A1** `GlobalAdminToolsLandingDashboard.js`
  — When both `residencyCountry` and `birthCountry` are `null`, render a passive greyed label *"Todas las Ubicaciones (sin filtro de país)"* above the Residency row. Hide it as soon as either country is set. No state changes, no LOB changes, no backend.

  **Difficulty:** Trivial — 1 file, ~5 lines JSX.

---

### TRACK B — Wire dual-location filter to Supabase (Supabase only)

- [ ] **B1** `Supabase` → stored procedure `TitulinoApi_v1.GetContactSegment` (and its count variant `GetContactSegmentCount`)
  — Add parameters `p_residency_country`, `p_residency_region`, `p_residency_exclude`, `p_birth_country`, `p_birth_region`, `p_birth_exclude`. Apply WHERE conditions for each pair independently. Keep old `p_locationtype` / `p_countrynameorid` parameters until confirmed the UI no longer sends them.

  **Difficulty:** Medium — SQL nullable parameter branching; must be tested against all filter combinations.

---

### TRACK C — Division support from enrolled students

- [x] **C1** `Supabase` → stored procedure `TitulinoApi_v1.GetCountryDivisions`
  — Rewrite to query enrollment data:
  - Accept `p_locationtype` = `'residency'` or `'birth'` (parameter exists today but is ignored for the division lookup — wire it up)
  - Return only distinct divisions where at least one enrolled student exists for the given country + location type
  - If any contacts have `division = NULL` for that country, append a synthetic row `{ "name": "Unknown", "id": "__unknown__" }` at the end
  - Sort real divisions alphabetically; Unknown always last

  **Difficulty:** Medium-hard — JOIN across contact/enrollment tables, NULL sentinel row, ordering.

- [ ] **C2** `GlobalAdminToolsLandingDashboard.js` + `src/lob/AudienceMessaging.js`
  — When user selects "Unknown" in the region dropdown, store `residencyRegion = '__unknown__'` (or `birthRegion`).
  — `buildContactSegmentPayload` detects the sentinel and sends it to the SP so it can match `WHERE division IS NULL`.
  — The dropdown label shows "Unknown" but the value is the sentinel.
  — Also update `loadAudienceCountryDivisions` in the view to pass the correct `locationType` (`'residency'` or `'birth'`) so each row loads the right divisions.

  **Difficulty:** Easy-medium — sentinel value flow through LOB → payload → SP + wiring the locationType on the GetCountryDivisions call.

---

### TRACK D — C# library sync (non-blocking, do after B1 + C1 are confirmed working)

The `titulino-communication` C# library is not in the React UI's call path, but it is a typed mirror of the Supabase function signatures. When the SP grows new parameters, the C# should reflect them so the library doesn't drift and is ready when the worker/email service eventually uses these filters.

- [x] **D1** `titulino-communication` → `Models/Insight/Audience/ContactSegmentFilter.cs` and `IContactSegmentFilter.cs`
  — Add properties: `ResidencyCountry`, `ResidencyRegion`, `ResidencyExclude`, `BirthCountry`, `BirthRegion`, `BirthExclude`.

  **Difficulty:** Easy — property additions only.

- [x] **D2** `titulino-communication` → `Repository/Dtos/TitulinoApi_v1/ContactSegmentFilterDTO.cs`
  — Add `[JsonProperty("p_residency_country")]`, `p_residency_region`, `p_residency_exclude`, `p_birth_country`, `p_birth_region`, `p_birth_exclude` with `NullValueHandling.Ignore`.

  **Difficulty:** Easy — mirrors D1 as DTO properties.

- [x] **D3** `titulino-communication` → `Repository/Mapper.cs` → `SerializeContactSegmentFilter()`
  — Map new model fields to new DTO fields.

  **Difficulty:** Easy-medium — same mapping pattern as existing fields.

- [x] **D4** `titulino-communication` → `Repository/Provider/SupabaseAdapter.cs` → `GetContactSegmentCountryDivisionsJsonAsync()`
  — Currently passes `p_locationtype` from `filter.LocationType` which defaults to `"all"`. Add support for passing `'residency'` or `'birth'` explicitly so the C# path can also benefit from the per-type division lookup added in C1.

  **Difficulty:** Easy — small wiring change, same pattern as other adapter methods.

---

## Dependency order

```
A1       — independent, lowest risk, do first
B1       — Supabase: update GetContactSegment + GetContactSegmentCount SPs
C1       — Supabase: update GetCountryDivisions SP  (same session as B1)
C2       — Frontend/LOB: Unknown sentinel + locationType wiring  (after C1 is live)
D1→D2→D3→D4  — C# sync: after B1 + C1 confirmed working, no urgency
```

---

## Files to change

| Repo | File | Track |
|---|---|---|
| titulino-ui | `GlobalAdminToolsLandingDashboard.js` | A1, C2 |
| titulino-ui | `src/lob/AudienceMessaging.js` | C2 |
| Supabase (direct) | `TitulinoApi_v1.GetContactSegment` | B1 |
| Supabase (direct) | `TitulinoApi_v1.GetContactSegmentCount` | B1 |
| Supabase (direct) | `TitulinoApi_v1.GetCountryDivisions` | C1 |
| titulino-communication | `Models/Insight/Audience/ContactSegmentFilter.cs` | D1 |
| titulino-communication | `Models/Insight/Audience/IContactSegmentFilter.cs` | D1 |
| titulino-communication | `Repository/Dtos/TitulinoApi_v1/ContactSegmentFilterDTO.cs` | D2 |
| titulino-communication | `Repository/Mapper.cs` | D3 |
| titulino-communication | `Repository/Provider/SupabaseAdapter.cs` | D4 |

---

## Verification

| Test | Expected |
|---|---|
| Both rows blank | Table loads all contacts; "All Locations" label visible |
| Residency = Mexico, Include | Only Mexico residents |
| Residency = Mexico, Birth = Venezuela | Contacts living in MX born in VE |
| Birth = Venezuela, Residency = Venezuela / Exclude | Born in VE, NOT living in VE |
| Select Argentina → Region dropdown | Only Argentine divisions with enrolled students |
| Select Argentina → Region = Unknown | Contacts with Argentina but no division data |
| Select Argentina, then clear | Region resets, "All Locations" label returns |
