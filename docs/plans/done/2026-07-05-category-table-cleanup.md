# Plan: CommunicationCategory Table Cleanup + Architecture

**Created:** 2026-07-05  
**Status:** TODO — tackle later today  
**Depends on:** `2026-07-03-mensageria-category-tracking.md` (the upsert + create-tab work already done locally)

---

## Background

After writing the `05_add_upsert_communication_category_*` migrations and the Create Category tab, five problems were identified:

1. Orphaned `05_add_create_*` SQL files + undeployed `03_add_update_*` files — all 12 deleted, 2 sqitch.plan entries removed ✅
2. Upsert engine used procedural `IF/ELSE` branching — rewritten with `INSERT ... ON CONFLICT DO UPDATE` via CTE ✅
3. Inner function parameters should use `%TYPE`; API wrapper should accept `jsonb` and deserialize inside (pending)
4. `CommunicationCategory` table has snake_case columns that break PascalCase convention; `display_name` should become `"LocalizationKey"` (pending)
5. Memory entries: column naming ✅, string PK ✅, function permissions ✅

---

## Progress

- [x] T1–T12  Delete all 12 orphaned/undeployed files (6 create + 6 update), remove their 2 sqitch.plan entries
- [x] T_engine Rewrite upsert engine with ON CONFLICT CTE (no IF/ELSE, no DROP statements since update functions never deployed); fix revert to simple DROP
- [x] T_mem   Memory entries: column naming, upsert convention, function permissions
- [x] T8  Superseded — kept individual params on wrapper; composite type + EXCEPTION convention used instead of jsonb
- [x] T9  Superseded — no jsonb wrapper; service payload key renamed to `p_localization_key`
- [x] T10 `titulino-docs/titulino-warehouse/coding-standards.md` — composite type + EXCEPTION convention documented (new section + rule #12)
- [x] T11 `Missive/2026/07/05_rename_category_columns` — renames `CommunicationCategoryName→Key`, `display_name→LocalizationKey`, `is_active→IsActive`; data migration sets LocalizationKey; updates `get_communication_categories`
- [x] T12 `sqitch.plan` — rename → type → engine → wrapper (correct deploy order)
- [x] T13 `buildCommunicationCategoryTableModel` — maps `CommunicationCategoryKey`/`LocalizationKey`/`IsActive`; exposes `localizationKey`
- [x] T14 `communicationCategoryOptions` — label is `t(row.localizationKey)`
- [x] T15 Category manager list tab — translated name preview above editable localizationKey field
- [x] T16 Category manager create tab — Localization Key input (`newCategoryLocalizationKey` state)
- [x] T17 All params renamed: `p_localization_key` in wrapper SQL + service payload; `localizationKey` in manager, action, reducer, dashboard
- [x] T18 23 × 3 locale keys added under `messaging.category.*` (en/es/pt) from live DB data
- [x] T19 Column header + create form i18n keys renamed `displayName` → `localizationKey` in all 3 locales
- [x] T20 LOB tests updated in `AudienceMessaging.test.js` — new column names, `localizationKey` assertions

---

## Key decisions already made

- **LocalizationKey path (B):** `display_name` column becomes `"LocalizationKey"`, stores dot-notation i18n key. UI calls `t(row.localizationKey)` for display. Admins type the key when creating a category and manually add translations.
- **LocalizationKey format:** `messaging.category.{CommunicationCategoryKey}` (e.g., `messaging.category.semiotics_2`)
- **`03_add_update_*` files deleted:** Confirmed via `sqitch status` that `03_add_update_*` were NEVER deployed — they are gone. The `05_add_upsert_*` migration does NOT need to DROP those functions.

---

## Notes for implementation

**T7 ON CONFLICT structure:**
```sql
WITH generated_id AS (
    SELECT CASE
        WHEN p_id IS NULL THEN COALESCE(MAX("CommunicationCategoryId"), -1) + 1
        ELSE p_id
    END AS id
    FROM "Missive"."CommunicationCategory"
)
INSERT INTO "Missive"."CommunicationCategory" (
    "CommunicationCategoryId", "CommunicationCategoryKey", "LocalizationKey", "IsActive"
)
SELECT id, p_key, p_localization_key, p_is_active FROM generated_id
ON CONFLICT ("CommunicationCategoryId") DO UPDATE SET
    "LocalizationKey" = EXCLUDED."LocalizationKey",
    "IsActive"        = EXCLUDED."IsActive"
RETURNING "CommunicationCategoryId";
```
Note: `p_key` is only meaningful on insert; ON CONFLICT path ignores it (PK already exists, key is immutable).

**T11 data migration:**
```sql
UPDATE "Missive"."CommunicationCategory"
SET "LocalizationKey" = 'messaging.category.' || "CommunicationCategoryKey";
```
Run after the rename. Revert restores old values via the revert script.

**T18 — query DB before writing locale files:**
```sql
SELECT "CommunicationCategoryKey", "LocalizationKey" FROM "Missive"."CommunicationCategory" ORDER BY "CommunicationCategoryId";
```
Use existing `display_name` values as EN translations; translate to ES and PT.
