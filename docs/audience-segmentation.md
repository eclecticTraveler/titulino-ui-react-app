# Audience Segmentation — Frontend Contract

Reference document for any agent or developer working on the Admin Tools messaging / audience segmentation feature.

---

## Guiding principle

**Business rules belong in PostgreSQL. The frontend describes intent; the backend determines eligibility.**

Never implement filtering, sorting, or pagination logic in JavaScript as a substitute for a backend filter. If a filter capability is missing, extend the stored procedure first, then expose it through the frontend. See CLAUDE.md rule #8.

---

## Architecture

```
Admin Tools UI (GlobalAdminToolsLandingDashboard.js)
    ↓ dispatch(onLoadingContactSegment)
Redux Action (AdminTools.js)
    ↓ await Manager
AdminToolsManager.getContactSegment()
    ↓ buildContactSegmentPayload(filters)  ← LOB: AudienceMessaging.js
TitulinoAdminAuthService.getContactSegment()
    ↓ POST /GetContactSegment
TitulinoApi_v1.GetContactSegment()         ← PostgREST wrapper (SECURITY DEFINER)
    ↓
Enrollment.get_contact_segment()           ← Business logic lives here
    ↓
Enrollment.vm_Enrollee view
```

`GetContactSegmentCount` mirrors this flow and is always called alongside `GetContactSegment` for pagination.

---

## Full parameter map

### Demographics

| UI field | Filter state key | Backend param | Notes |
|---|---|---|---|
| Gender dropdown | `sex` | `p_sex` | `'all'` → omitted |
| Min Age | `minAge` | `p_minage` | null → omitted |
| Max Age | `maxAge` | `p_maxage` | null → omitted |

### Location — Legacy (still supported, backward compatible)

| UI field | Filter state key | Backend param | Notes |
|---|---|---|---|
| Location Type | `locationType` | `p_locationtype` | `'all'`, `'residency'`, `'birth'` |
| Country | `countryNameOrId` | `p_countrynameorid` | name, native name, or ISO alpha-3 |
| Region | `locationRegionName` | `p_countrydivisionnameorid` | dependent on country |

### Location — Dual Filter (new, preferred)

| UI field | Filter state key | Backend param | Notes |
|---|---|---|---|
| Residency country | `residencyCountry` | `p_residency_country` | name, native name, or alpha-3 |
| Residency region | `residencyRegion` | `p_residency_region` | optional, scoped to residency country |
| Residency mode | `residencyExclude` | `p_residency_exclude` | `false` = include (default), `true` = exclude |
| Birth country | `birthCountry` | `p_birth_country` | name, native name, or alpha-3 |
| Birth region | `birthRegion` | `p_birth_region` | optional, scoped to birth country |
| Birth mode | `birthExclude` | `p_birth_exclude` | `false` = include (default), `true` = exclude |

When both residency and birth filters are set, the backend combines them with AND logic.

If none of the new dual-filter params are supplied, the backend falls back to the legacy `p_locationtype` / `p_countrynameorid` behavior automatically.

### Language

| UI field | Filter state key | Backend param | Notes |
|---|---|---|---|
| Language | `languageId` | `p_languageid` | `'all'` → omitted |
| Language Level | `languageLevel` | `p_languagelevel` | `'all'` → omitted |

### Courses & Engagement

| UI field | Filter state key | Backend param | Notes |
|---|---|---|---|
| Enrolled in courses | `courseCodeIds` | `p_coursecodeids` | string array |
| Match all courses | `matchAllCourses` | `p_matchallcourses` | boolean |
| Exclude courses | `excludeCourseCodeIds` | `p_excludecoursecodeids` | string array |
| Has progress | `hasProgress` | `p_hasprogress` | boolean or null |
| Has certifications | `hasCertifications` | `p_hascertifications` | boolean or null |
| Has purchases | `hasPurchases` | `p_haspurchases` | boolean or null |

### Search & Pagination

| UI field | Filter state key | Backend param | Notes |
|---|---|---|---|
| Search box | `searchText` | `p_search` | name, email, or external ID |
| (internal) | `limit` | `p_limit` | default 100 — server-side page size |
| (internal) | `offset` | `p_offset` | default 0 |

---

## LOB functions (AudienceMessaging.js)

| Function | Purpose |
|---|---|
| `getDefaultAudienceFilters()` | Initial filter state — single source of truth for defaults |
| `buildContactSegmentPayload(filters)` | Maps filter state → backend params; strips nulls and 'all' values |
| `buildContactSegmentCountPayload(filters)` | Same as above minus `p_limit` / `p_offset` |
| `normalizeContactSegmentRow(row)` | Extracts both residency and birth location fields from each returned row |
| `buildMetadataOptions(metadata)` | Builds dropdown option arrays for location types, languages, levels |
| `buildCountryOptionsForLocation(meta, rows, locationType)` | Filters country list by location type |
| `buildCountryDivisionsPayload(filters)` | Payload for fetching regions under a selected country |

---

## Row data shape (after normalization)

Each contact row contains both location types — this is what the backend returns:

```
residencyCountryName      residencyCountryAlpha3      residencyRegionName
birthCountryName          birthCountryAlpha3           birthRegionName
```

---

## Example filter combinations

| Goal | Frontend state |
|---|---|
| Everyone in Mexico (residency) | `residencyCountry: 'Mexico', residencyExclude: false` |
| Everyone born in Venezuela | `birthCountry: 'Venezuela', birthExclude: false` |
| Born in Venezuela, NOT living there | `birthCountry: 'Venezuela', birthExclude: false, residencyCountry: 'Venezuela', residencyExclude: true` |
| Living in USA, born in Mexico | `residencyCountry: 'USA', residencyExclude: false, birthCountry: 'Mexico', birthExclude: false` |
| Exclude everyone from Brazil (either location) | Use two separate queries or legacy `p_locationtype: 'all'` |

---

## How to add a new filter field

1. Extend `Enrollment.get_contact_segment()` in the warehouse with the new parameter
2. Extend `TitulinoApi_v1.GetContactSegment()` and `GetContactSegmentCount()` wrappers
3. Add the field to `getDefaultAudienceFilters()` in `AudienceMessaging.js`
4. Add the mapping in `buildContactSegmentPayload()` and `buildContactSegmentCountPayload()`
5. Add the UI control in `GlobalAdminToolsLandingDashboard.js`
6. Update this document

**Do not add a step between 2 and 3 that filters the result in JavaScript.**

---

## Future filter candidates (from backend contract)

These are already planned in the backend contract and can be added following the pattern above:

- Preferred Language / Native Language
- Enrollment Status
- Certification Status
- Purchase History
- Activity Date
- Missionary Status / Ward / Stake
- Country Group / Region Group
- Timezone
- Age Buckets
- Communication Health (Active / Inactive / Opt-Out / Broken)
- Duplicate Risk Score
