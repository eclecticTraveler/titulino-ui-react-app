# New Course Creation — Roadmap

**Branch:** `feature/know-me-ai-review` (initial research + docs)  
**Started:** 2026-07-02  
**Repos touched (eventual):** titulino-ui · titulino-bucket-spine

---

## What this builds

A complete, repeatable workflow for adding a new course theme to the Titulino platform.
Today it is entirely manual. This roadmap replaces that with:

1. A **`/new-course` CLI skill** — handles all source-code phases from a single interactive command
2. **Path A — Admin UI extension** — spine data and registries become API-backed, wired into the existing course creation form
3. **Path B — DB-driven navigation** — nav config moves to the database; no code deploy needed to add a course (long-term)

---

## Shared inputs (Phase 0 — asked at start of every step)

When running `/new-course` or creating a course via the admin UI, the user is prompted for:

| Input | Details | Default |
|---|---|---|
| Theme name | kebab-case, e.g. `my-new-course` | — (required) |
| courseCodeId | Format: `COURSE_NAME_MON_YEAR_COURSE_NN` | — (required if course exists) |
| Display names | EN / ES / PT labels for the nav | — (required) |
| Number of chapters | Integer | 11 |
| Include intro chapter? | Chapter 0 with `faTv` icon | Yes |
| Include resources section? | Appended to auth submenu | Yes |
| Course color | Hex; validated against existing colors; random if blank | Random |
| Tiers | Gold / Silver / both / none | None |
| Languages | English / Spanish / Portuguese (multi-select) | English |
| Default landing? | Make this the landing course for selected languages | No |
| Speaking practice words | Per-chapter word lists; can skip and fill manually | Skip |

---

## Step 1 — `/new-course` skill

> **Scope:** titulino-ui source code changes only.  
> **When:** Immediately — this is the near-term tool.

### Progress

- [x] **T1** — Write `.claude/commands/new-course.md` with Phase 0 prompts, step-by-step instructions, and file templates
- [ ] **T2** — Phase 1 code changes: `CourseThemeConfig.js`, `CentralCourseThemeService.js`, `course-theme-registry.data.json`, `badge-theme-registry.data.json`; optional `AppConfig.js` for default landing
- [ ] **T3** — Phase 2 i18n: add `main.upper.nav.theme.level.<camelCase>` to `en_US.json`, `es_US.json`, `pt_BR.json`
- [ ] **T4** — Phase 3 new files: generate `CourseSubNavigation<Name>Theme.js` (unauthenticated, N chapters) and `AuthCourseSubNavigation<Name>Theme.js` (authenticated, tier-aware, intro + resources)
- [ ] **T5** — Phase 4 nav config: add import + nav item object to `EnglishCourseMainNavigationConfig.js`; mirror to Spanish / Portuguese configs if selected
- [ ] **T6** — Phase 4b search: add keywords to `SearchAssociation.js` for ES and PT
- [ ] **T7** — Phase 7 spine data: generate copy-ready JSON entries for all 12 spine files, prompt for speaking-practice words, note which fields need manual fill (dates, URLs, Quizlet IDs)
- [ ] **T8** — Phase 8 finish: run `.claude/support-scripts/run-tests.sh`, create PR, print summary of manual steps remaining

---

## Step 2 — Path A: Admin UI extension

> **Scope:** titulino-ui admin tools + titulino-warehouse + titulino-net-api.  
> **When:** Next sprint after Step 1 ships.  
> **Goal:** Phases 0, 1 (registries), 2 (i18n), 7 (spine data) happen automatically on course save.

### Progress

- [ ] **A1** — Design DB schema: `CourseThemeRegistry` table (theme → courseCodeId[]), `BadgeThemeRegistry` table (theme → tier → imageUrl), `CourseI18nLabel` table (theme → lang → label)
- [ ] **A2** — titulino-warehouse: Sqitch migrations for the three new tables
- [ ] **A3** — titulino-net-api: API endpoints for reading/writing theme registry, badge registry, and i18n labels
- [ ] **A4** — titulino-ui: Swap `course-theme-registry.data.json` and `badge-theme-registry.data.json` file imports for API calls in `LrnManager.js`
- [ ] **A5** — titulino-ui: Extend existing course creation form (admin UI) with Phase 0 fields (theme name, courseCodeId, chapter count, color, tiers, languages, default landing)
- [ ] **A6** — titulino-ui: On course save, trigger API calls that write to all 12 spine data endpoints (or equivalent DB tables in titulino-warehouse)
- [ ] **A7** — titulino-ui: Color picker in course form validates hex against existing colors; generates random if blank
- [ ] **A8** — End-to-end test: create a test course via admin UI, verify it appears in nav, verify spine data is populated
- [ ] **A9** — Remaining code-side items (nav JS config files) still handled by `/new-course` skill until Path B lands

---

## Step 3 — Path B: DB-driven navigation

> **Scope:** titulino-ui + titulino-net-api + titulino-warehouse.  
> **When:** Future — when course additions are frequent enough that JS file changes are the bottleneck.  
> **Goal:** Adding a new course requires zero code deploys. Admin UI handles everything end-to-end.

### Progress

- [ ] **B1** — Design DB schema: `CourseNavConfig` table (language, theme, field set matching current JS nav item shape); `CourseChapterNav` table (chapter entries + submenu type); `CourseNavTier` table (tier → color override)
- [ ] **B2** — titulino-warehouse: Sqitch migrations for nav config tables
- [ ] **B3** — Migrate existing English / Spanish / Portuguese nav configs to DB (one-time data migration script)
- [ ] **B4** — titulino-net-api: `GET /nav/course-navigation?lang={code}&isAuthenticated={bool}` endpoint — returns nav config shaped identically to current JS array
- [ ] **B5** — titulino-ui: Refactor `DynamicNavigationRouter.js` — replace `switch(lang)` + JS imports with a single API call; cache the result in Redux alongside `dynamicUpperMainNavigation`
- [ ] **B6** — titulino-ui: Remove `CourseMainNavigationConfig/` JS files after verifying all nav is DB-driven (keep as backup until confidence is high)
- [ ] **B7** — titulino-ui: Admin UI — add nav config editor section to course creation form (chapter count, submenu types, tier-gating toggles)
- [ ] **B8** — Performance: add Redis or in-memory cache for nav config on the API (nav is read-heavy, write-rare)
- [ ] **B9** — End-to-end test: create course via admin UI, verify nav appears without any code deploy

---

## File reference (Step 1 — code changes per phase)

| Phase | File | Action |
|---|---|---|
| 1 | `src/configs/CourseThemeConfig.js` | Add `<theme>Theme: "#hex"` to `COURSE_COLOR_CONFIG` |
| 1 | `src/services/CentralCourseThemeService.js` | Add `"<theme>": <levelNumber>` to `levelMapping` |
| 1 | `src/assets/data/course-theme-registry.data.json` | Add `"<theme>": ["<courseCodeId>"]` |
| 1 | `src/assets/data/badge-theme-registry.data.json` | Add theme → Participation/Golden image URLs |
| 1 | `src/configs/AppConfig.js` | Update `DEFAULT_LANDING_COURSE_ENG` if default landing |
| 2 | `src/lang/locales/en_US.json` | `"main.upper.nav.theme.level.<camelCase>": "<EN label>"` |
| 2 | `src/lang/locales/es_US.json` | Spanish label |
| 2 | `src/lang/locales/pt_BR.json` | Portuguese label |
| 3 | `CourseSubNavigation<Name>Theme.js` | New file — unauthenticated chapter nav |
| 3 | `AuthCourseSubNavigation<Name>Theme.js` | New file — authenticated, tier-aware |
| 4 | `EnglishCourseMainNavigationConfig.js` | Import + add nav item object |
| 4 | `SpanishCourseMainNavigationConfig.js` | If Spanish is selected |
| 4 | `PortugueseCourseMainNavigationConfig.js` | If Portuguese is selected |
| 4 | `SearchAssociation.js` | ES + PT keyword arrays |
| 7 | 12 spine JSON files | Generated entries; manual fill for dates/URLs/words |

---

## Notes

- **Phase 5 (new content type) and Phase 6 (Redux)** are intentionally omitted from all three steps — they only apply when a brand-new content format is invented, not for adding a standard course. Document separately when that arises.
- **DEFAULT_LANDING_COURSE for non-English languages** is a separate open question. Spanish and Portuguese currently default to `nivel-1`. If a new English course becomes the landing, the per-language constants in `AppConfig.js` isolate the impact. Full language-aware landing routing is a future design problem.
- **Speaking practice words** — the skill will prompt the user chapter by chapter. If words aren't available yet, that entry is left as a skeleton with placeholder titles and an empty `words` array.
