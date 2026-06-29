# Plan: Audience Location Multi-Condition Filter
Date: 2026-06-26
Status: pending approval

## Goal

Two improvements to the Location & Language filter section of the audience segmentation tool:

1. **Bug fix**: "Country name or code" must be disabled when "All Locations" is selected
2. **Feature**: Support independent Residency and Birth location conditions, each with an Include/Exclude toggle — so the user can express rules like "Birth = Venezuela AND Residency ≠ Venezuela"

---

## How the system works today (segmentation architecture)

### Data flow

```
UI filters (audienceFilters state)
    ↓ buildContactSegmentPayload() [AudienceMessaging.js LOB]
    ↓ p_locationtype, p_countrynameorid, p_countrydivisionnameorid
Backend stored procedure (PostgREST)
    ↓ returns up to p_limit (100) rows
normalizeContactSegmentRow() [AudienceMessaging.js LOB]
    ↓ extracts residencyCountryName, birthCountryName, residencyRegionName, birthRegionName from each row
Ant Design Table (GlobalAdminToolsLandingDashboard.js)
```

### What the backend already returns per row

Each contact row already includes BOTH location types:
- `residencyCountryName`, `residencyCountryAlpha3`, `residencyRegionName`
- `birthCountryName`, `birthCountryAlpha3`, `birthRegionName`

This is key: the backend does not need to change to support multi-condition filtering — we can apply a second filter client-side on the returned rows.

### Current backend parameters

| Parameter | Values | Notes |
|---|---|---|
| `p_locationtype` | `'all'`, `'residency'`, `'birth'` | Which location field to match country against |
| `p_countrynameorid` | string or null | Country name or ISO code |
| `p_countrydivisionnameorid` | string or null | Region/division, dependent on country |

### Both conditions go to the backend — no client-side filtering

The backend migration `26_extend_get_contact_segment_dual_location_filters.sql` deployed today adds `p_residency_country`, `p_residency_region`, `p_residency_exclude`, `p_birth_country`, `p_birth_region`, `p_birth_exclude` to `Enrollment.get_contact_segment()` and both `TitulinoApi_v1` wrappers. All filtering happens in PostgreSQL. The frontend sends parameters only.

---

## UI redesign — Location & Language section

### Before
```
[All Locations ▼]  [Country name or code ▼]  [Region ▼]  [Language ▼]  [Level ▼]
```

### After
```
Residency   [Country ▼]  [Region ▼]  [Include ▼]
Birth       [Country ▼]  [Region ▼]  [Include ▼]
            [Language ▼] [Level ▼]
```

- Residency and Birth are always visible as two independent rows — no "All Locations" dropdown needed
- Each row has its own Country select, Region select (dependent on Country), and Include/Exclude toggle
- If a Country is blank, that row is inactive — the row label is greyed out
- Region is disabled until a Country is selected (same behavior as today)
- "All Locations" concept is replaced by simply leaving both rows blank

---

## Steps

### Step 1 — Update state shape in AudienceMessaging.js (LOB)

- [ ] In `getDefaultAudienceFilters()`, replace:
  ```js
  locationType: 'all',
  countryNameOrId: null,
  locationRegionName: null,
  ```
  with:
  ```js
  residencyCountry: null,
  residencyRegion: null,
  residencyExclude: false,
  birthCountry: null,
  birthRegion: null,
  birthExclude: false,
  ```

### Step 2 — Update buildContactSegmentPayload in AudienceMessaging.js (LOB)

- [ ] Map new filter fields directly to backend parameters — no client-side filtering:
  - `residencyCountry` → `p_residency_country`
  - `residencyRegion` → `p_residency_region`
  - `residencyExclude` → `p_residency_exclude`
  - `birthCountry` → `p_birth_country`
  - `birthRegion` → `p_birth_region`
  - `birthExclude` → `p_birth_exclude`
- [ ] Also update `buildContactSegmentCountPayload` with the same new fields (count and segment must always have identical filter parameters)

### Step 3 — Update buildCountryDivisionsPayload in AudienceMessaging.js (LOB)

- [ ] The function currently takes `filters.locationType` — update it to accept a `locationType` parameter directly so it can be called independently for the Residency and Birth country dropdowns

### Step 4 — Update GlobalAdminToolsLandingDashboard.js (view)

- [ ] Remove state references to `audienceFilters.locationType`, `countryNameOrId`, `locationRegionName`
- [ ] Replace the single-row location JSX block (lines 6983–7021) with two rows (Residency + Birth), each containing:
  - Country `<Select>` (searchable, uses `audienceCountryOptions` filtered by type)
  - Region `<Select>` (disabled until country selected)
  - Include/Exclude `<Select>` (options: Include / Exclude, default: Include)
- [ ] After `loadAudienceSegment` receives rows, pipe them through `applyClientSideLocationFilters` before setting `audienceRows`
- [ ] Update `audienceCountryOptions` derivation — call `buildCountryOptionsForLocation` twice (once for 'residency', once for 'birth') instead of passing the single `locationType`

### Step 5 — Documentation

- [ ] Create `docs/audience-segmentation.md` describing:
  - The full filter parameter map (UI field → LOB function → backend param)
  - Which filters are server-side vs client-side
  - The hybrid location strategy and its limitations
  - How to add a new filter field end-to-end (state → LOB → payload → UI)

---

## Files to change

| File | Change |
|---|---|
| `src/lob/AudienceMessaging.js` | Update state shape, payload builder, add client-side filter function |
| `src/components/admin-components/Insights/GlobalAdminToolsLandingDashboard.js` | Redesign location UI block, apply client-side filter after load |

---

## Files to create

| File | Purpose |
|---|---|
| `docs/audience-segmentation.md` | Architecture reference for the segmentation system |

---

---

## Verification

1. Select Residency = Mexico / Include → table shows only Mexico residents
2. Select Residency = Mexico / Include + Birth = Venezuela / Include → table shows contacts who live in Mexico AND were born in Venezuela
3. Select Birth = Venezuela / Include + Residency = Venezuela / Exclude → table shows contacts born in Venezuela who do NOT reside in Venezuela
4. Leave both rows blank → all contacts load (same as "All Locations" today)
5. Select only one country, leave region blank → region stays disabled
6. Select a country, then select a region → region enables and filters correctly
