# set-nav-order

Reorder the top navigation menu for a given language course config.

## Usage

Invoke as `/set-nav-order` and describe the desired nav in plain language, e.g.:

> /set-nav-order English: Speeches, EC, Other Courses (Work & Jobs / Household / Supermarket)

> /set-nav-order Spanish: Discursos, EC, Otros Cursos (Trabajo y Oficios / Artículos del hogar / Supermercado)

> /set-nav-order Portuguese: Discursos, EC, Outros Cursos (Trabalho e empregos / Itens domésticos / Supermercado)

---

## Config files by language

| Language   | Config file |
|------------|-------------|
| English    | `src/configs/CourseMainNavigationConfig/English/EnglishCourseMainNavigationConfig.js` |
| Spanish    | `src/configs/CourseMainNavigationConfig/Spanish/SpanishCourseMainNavigationConfig.js` |
| Portuguese | `src/configs/CourseMainNavigationConfig/Portuguese/PortugueseCourseMainNavigationConfig.js` |

i18n locale files (all three must be updated when adding a new i18n key):
- `src/lang/locales/en_US.json`
- `src/lang/locales/es_US.json`
- `src/lang/locales/pt_BR.json`

---

## How the top nav is rendered

**Component:** `src/components/layout-components/MenuContentTop.js`

Key rules:
1. Only items with `isToDisplayInNavigation: true` appear in the top nav (filtered at line 110).
2. An item becomes a **dropdown** when `topSubmenu.length > 0`. Children use `path` for navigation.
3. An item is a **direct link** when `topSubmenu` is empty — it uses `menu.path`.
4. The `submenu` field is used by the **side nav** (`MenuContent.js`), not the top nav. Keep it intact on all items so the side nav renders correctly when a user visits that course route.

---

## Steps

1. Read the target language config file.

2. Identify the course items by their `key` or `sideTitle`. Current known keys:

   | sideTitle        | key (English)                  | i18n key                                     |
   |------------------|-------------------------------|----------------------------------------------|
   | Speeches         | `level-speeches-part-eng`     | `main.upper.nav.theme.level.speeches`        |
   | Work & Jobs      | `level-work-and-jobs-part-eng`| `main.upper.nav.theme.level.workNjobs`       |
   | Household        | `level-household-part-eng`    | `main.upper.nav.theme.level.household`       |
   | Supermarket      | `level-supermarket-eng`       | `main.upper.nav.theme.level.supermarket`     |
   | EC / Connect     | `level-connect-eng-general`   | `main.upper.nav.theme.level.ec`              |
   | Other Courses    | `level-other-courses-eng`     | `main.upper.nav.theme.level.otherCourses`    |

3. Apply the new order:
   - Items that appear directly in the top nav: set `isToDisplayInNavigation: true`, place them after the hidden items in the array (array order = display order for visible items).
   - Items grouped into a dropdown: set `isToDisplayInNavigation: false` on the original item (so the side nav still works), and list them as `topSubmenu` children of the parent group item.
   - Items not mentioned: keep them in the array with `isToDisplayInNavigation: false`.

4. If a **new group label** is introduced (e.g. "Other Courses"):
   - Add an i18n key `main.upper.nav.theme.level.<camelCaseLabel>` to all three locale files.
   - Create a new config object in the array with:
     ```js
     {
       key: 'level-<label>-<langCode>',
       title: 'main.upper.nav.theme.level.<camelCaseLabel>',
       sideTitle: '<Label>',
       icon: COURSE_ICON_CONFIG.default,
       iconType: ICON_LIBRARY_TYPE_CONFIG.hostedSvg,
       color: COURSE_COLOR_CONFIG.defaultBlueBasic,
       isRootMenuItem: true,
       iconPosition: "upperNav",
       isServiceAvailableForUser: false,
       isToDisplayInNavigation: true,
       isFree: false,
       course: "<Language>",
       topSubmenu: [ /* link-only children here */ ],
       submenu: []
     }
     ```
   - Each child in `topSubmenu` needs: `key`, `path`, `title`, `icon`, `iconPosition`, `topSubmenu: []`.

5. Do **not** touch:
   - The `submenu` arrays of any existing item (side nav depends on them).
   - Spanish or Portuguese configs unless the request targets them.
   - Any routes, Redux actions, or services.

6. Present the planned order as a numbered list and wait for approval before writing code (per the plan-before-coding rule).
