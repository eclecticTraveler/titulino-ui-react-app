# new-course

Creates all source-code and data files for a new course theme. Covers Phases 0–4 and 7–8 of the new-course creation roadmap (`docs/plans/active/2026-07-02-new-course-creation-roadmap.md`).

---

## Step 0 — Collect inputs

Use `AskUserQuestion` to collect the following. Ask all questions in one call (up to 4 per call; split into two calls if needed).

**Call 1:**
- **Theme name** — kebab-case identifier used everywhere (e.g. `meditaciones`, `conversations`, `business-english`). This becomes the URL slug and registry key.
- **courseCodeId** — Has this course already been created in the admin? If yes, provide the ID (format: `COURSE_NAME_MON_YEAR_COURSE_NN`). If no, type "pending" and the skill will leave a `TODO` placeholder.
- **Display names** — What should the nav label say? Provide EN / ES / PT translations (or just the ones needed). If a language won't have this course, leave it blank.
- **Languages** — Which language configs should this course appear in? (English / Spanish / Portuguese — multi-select)

**Call 2:**
- **Number of chapters** — How many chapters does this course have? Default: 11
- **Include intro chapter (Chapter 0)?** — Yes / No. Default: Yes. Intro appears only in the authenticated submenu with a TV icon.
- **Include resources section?** — Yes / No. Default: Yes. Resources appended at the end of authenticated submenu.
- **Course tiers** — Does this course have paid tiers? Options: None / Silver only / Gold only / Silver and Gold. Default: None.
- **Should this course be the default landing** for its language(s)? — Yes / No. Default: No.
- **Course color** — Hex code (e.g. `#3a7bd5`). Leave blank to auto-assign. Cannot reuse an existing color.

**Call 3 — Nav visibility (only if Spanish or Portuguese is selected):**

After reading the current language config(s) in Step 1, present the existing nav items per language and ask:

> For each language config you selected, here are the current visible items (isToDisplayInNavigation: true) and hidden items (false). Which items should be toggled?

Show a list like:
```
Spanish nav (current state):
  ✅ VISIBLE  level-1-spa     — Iniciante Simple
  ✅ VISIBLE  level-2-spa     — Iniciante Medio
  ✅ VISIBLE  level-3-spa     — Iniciante Completo
  + <new-course> will be added as VISIBLE

Portuguese nav (current state):
  ✅ VISIBLE  level-1-por     — Iniciante Basico
  ❌ HIDDEN   level-2-por     — Iniciante Inter
  ✅ VISIBLE  level-3-por     — Iniciante Superior
  + <new-course> will be added as VISIBLE
```

Ask: "Which of these existing items should be toggled? List keys to flip, or say 'none'."

The user's answer determines additional `isToDisplayInNavigation` changes applied in Phase 4c.

---

## Step 1 — Read current state (before writing anything)

Read these files to understand existing values before making changes:

1. `src/configs/CourseThemeConfig.js` — note all existing hex colors in `COURSE_COLOR_CONFIG`
2. `src/services/CentralCourseThemeService.js` — note the highest existing level number in `levelMapping`
3. `src/assets/data/course-theme-registry.data.json` — note existing theme keys
4. `src/configs/AppConfig.js` — note current `DEFAULT_LANDING_COURSE_ENG`, `_SPA`, `_POR`
5. If Spanish selected: read `SpanishCourseMainNavigationConfig.js` — note each item's `key`, `sideTitle`, `isToDisplayInNavigation`, and whether `topSubmenu` / `nameToCourseCodeKey` are present
6. If Portuguese selected: read `PortugueseCourseMainNavigationConfig.js` — same inventory

**Wiring gap detection:** For each Spanish/Portuguese item, note any of these missing fields that English items have:
- `topSubmenu: []` — required by `MenuContentTop.js` (optional chaining means absence works but is inconsistent)
- `nameToCourseCodeKey` — required for `coursesByTheme` tier lookup
- `COURSE_TIERS_CONFIG` import — required for tier-conditional color logic

These gaps will be patched in Phase 4c.

**Color validation:** If the user provided a color, confirm it does not already exist in `COURSE_COLOR_CONFIG`. If it does, ask for a different one. If blank, generate a visually distinct hex color that doesn't clash with the existing palette.

**Level number:** The new course gets `max(existing levelMapping values) + 1`.

---

## Step 2 — Present plan and wait for approval

Before writing any code, output a summary like:

```
New course: <theme-name>
courseCodeId: <id or TODO>
Languages: <list>
Chapters: <N> + intro: <yes/no> + resources: <yes/no>
Nav visibility changes: <list items being toggled, or "none">
Tiers: <none / Silver / Gold / Silver+Gold>
Color: #<hex>
Level number: <N>
Default landing: <yes/no — which languages>

Files to create:
  NEW  src/configs/CourseMainNavigationConfig/Submenus/CourseSubNavigation<Name>Theme.js
  NEW  src/configs/CourseMainNavigationConfig/Submenus/AuthCourseSubNavigation<Name>Theme.js

Files to modify:
  MOD  src/configs/CourseThemeConfig.js
  MOD  src/services/CentralCourseThemeService.js
  MOD  src/assets/data/course-theme-registry.data.json
  MOD  src/lang/locales/en_US.json          (if EN display name provided)
  MOD  src/lang/locales/es_US.json          (if ES display name provided)
  MOD  src/lang/locales/pt_BR.json          (if PT display name provided)
  MOD  src/configs/CourseMainNavigationConfig/English/EnglishCourseMainNavigationConfig.js  (if English)
  MOD  src/configs/CourseMainNavigationConfig/Spanish/SpanishCourseMainNavigationConfig.js  (if Spanish)
  MOD  src/configs/CourseMainNavigationConfig/Portuguese/PortugueseCourseMainNavigationConfig.js  (if Portuguese)
  MOD  src/services/DynamicNavigationRouter.js  (if Spanish — fixes coursesByTheme passthrough, always)
  MOD  src/configs/AppConfig.js              (if default landing)

Wiring fixes applied to existing items (Spanish/Portuguese only):
  <for each language: list items getting topSubmenu / nameToCourseCodeKey added>
  <list items getting isToDisplayInNavigation toggled>

Spine data entries to generate (manual fill required for dates/URLs):
  <list each of the 12 spine files>

Proceed?
```

**Do not write any code until the user confirms.**

---

## Step 3 — Execute phases

### Phase 1 — Core config

**`src/configs/CourseThemeConfig.js`**
Add to `COURSE_COLOR_CONFIG`:
```js
<camelCaseTheme>Theme: "<#hex>",
```
Where `<camelCaseTheme>` is the theme name converted to camelCase (e.g. `meditaciones` → `meditacionesTheme`, `business-english` → `businessEnglishTheme`).

**`src/services/CentralCourseThemeService.js`**
Add to `levelMapping`:
```js
"<theme-name>": <levelNumber>,
```

**`src/assets/data/course-theme-registry.data.json`**
Add entry:
```json
"<theme-name>": ["<courseCodeId>"]
```
If courseCodeId is "pending", use `"TODO_<THEME_UPPER>_COURSE_01"` as placeholder.

**`src/assets/data/badge-theme-registry.data.json`** (only if tiers selected)
Add entry:
```json
"<theme-name>": {
    "Participation": {
        "imageUrl": "https://storage.googleapis.com/titulino-bucket/titulino-certificate-badges/<theme-name>/default.png"
    },
    "Golden": {
        "imageUrl": "https://storage.googleapis.com/titulino-bucket/titulino-certificate-badges/<theme-name>/golden.png"
    }
}
```

**`src/configs/AppConfig.js`** (only if default landing selected)
Update the relevant constant:
- English: `DEFAULT_LANDING_COURSE_ENG = '<theme-name>'`
- Spanish: `DEFAULT_LANDING_COURSE_SPA = '<theme-name>'`
- Portuguese: `DEFAULT_LANDING_COURSE_POR = '<theme-name>'`

---

### Phase 2 — i18n

Add to each locale file where a display name was provided:
```json
"main.upper.nav.theme.level.<camelCaseTheme>": "<Display Name>"
```

Place it after `"main.upper.nav.theme.level.ec"` to keep the nav key group together.

---

### Phase 3 — Submenu files (create two new files)

#### File A: `CourseSubNavigation<PascalName>Theme.js` (unauthenticated)

Replace `<theme-slug>` with the theme name, `<PascalName>` with PascalCase, `<N>` with chapter count.

Use this icon pool for chapters 1–<N>. Assign sequentially; if more than 11 chapters repeat from the start:
```
ch1: faCarrot   ch2: faPepperHot  ch3: faAppleAlt  ch4: faLemon
ch5: faBacon    ch6: faFish       ch7: faBoxArchive ch8: faArchive
ch9: faMoneyBill ch10: faBreadSlice ch11+: faMedal
```

```js
import { APP_PREFIX_PATH } from '../../AppConfig';
import { getLocalizedConfig } from './ConfigureNavigationLocalization';
import { getCoursePracticeInnerSubMenuV2 } from './CoursePracticeInnerSubMenu';
import { ICON_LIBRARY_TYPE_CONFIG } from 'configs/IconConfig';
import {
    fa<Icon1>, fa<Icon2>, /* one per chapter used */
} from '@fortawesome/free-solid-svg-icons';

export const CourseSubNavigation<PascalName>Theme = (lang) => {
    const commonPath = `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-<theme-slug>/${getLocalizedConfig(lang)?.chapter}`;
    return [
        // repeat for each chapter 1..N
        {
            key: 'chapter-sidenav-theme-<theme-slug>-<N>',
            path: `${commonPath}-<N>`,
            title: 'sidenav.chapter.<N>',
            icon: fa<IconN>,
            iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
            breadcrumb: false,
            submenu: [
                ...getCoursePracticeInnerSubMenuV2(lang, '<theme-slug>', <N>)
            ]
        },
    ]
}
```

#### File B: `AuthCourseSubNavigation<PascalName>Theme.js` (authenticated)

Chapter submenu function selection:
- Intro (ch 0): always `getCoursePracticeInnerSubMenuV2Light`
- Odd chapters (1, 3, 5, …): `getAuthCourseInnerSubMenuV3` (passes `course?.courseTierAccess`)
- Even chapters (2, 4, 6, …): `getAuthCourseInnerSubMenuV2` (passes `course?.courseTierAccess`)
- Last chapter (ch N): `getAuthCourseInnerSubMenuNoClassV3` (no tier param)
- If tiers = None: still use the V2/V3 functions — they handle nil tier access gracefully

```js
import { AUTH_PREFIX_PATH } from '../../AppConfig';
import { getLocalizedConfig } from './ConfigureNavigationLocalization';
import { getCoursePracticeResourcesInnerSubMenu } from './CoursePracticeInnerSubMenu';
import {
    getAuthCourseInnerSubMenuV2,
    getAuthCourseInnerSubMenuV3,
    getAuthCourseInnerSubMenuNoClassV3,
    getCoursePracticeInnerSubMenuV2Light
} from './AuthCourseInnerSubMenu';
import { ICON_LIBRARY_TYPE_CONFIG } from 'configs/IconConfig';
import {
    fa<Icon1>, fa<Icon2>, /* one per chapter used */
    faBoxes, faTv, faMedal,
} from '@fortawesome/free-solid-svg-icons';

export const AuthCourseSubNavigation<PascalName>Theme = (lang, course) => {
    const commonPath = `${AUTH_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-<theme-slug>/${getLocalizedConfig(lang)?.chapter}`;
    const baseMenu = [
        // intro (only if intro chapter = yes)
        {
            key: 'chapter-sidenav-theme-<theme-slug>-intro',
            path: `${commonPath}-0`,
            title: 'sidenav.chapter.intro',
            icon: faTv,
            iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
            breadcrumb: false,
            submenu: [
                ...getCoursePracticeInnerSubMenuV2Light(lang, '<theme-slug>', 0)
            ]
        },
        // chapters 1..N-1 (alternating V3 odd / V2 even)
        {
            key: 'chapter-sidenav-theme-<theme-slug>-<ch>',
            path: `${commonPath}-<ch>`,
            title: 'sidenav.chapter.<ch>',
            icon: fa<IconCh>,
            iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
            breadcrumb: false,
            submenu: [
                ...getAuthCourseInnerSubMenuV3(lang, '<theme-slug>', <ch>, course?.courseTierAccess) // odd
                // or:
                ...getAuthCourseInnerSubMenuV2(lang, '<theme-slug>', <ch>, course?.courseTierAccess) // even
            ]
        },
        // last chapter always uses NoClassV3 + faMedal
        {
            key: 'chapter-sidenav-theme-<theme-slug>-<N>',
            path: `${commonPath}-<N>`,
            title: 'sidenav.chapter.<N>',
            icon: faMedal,
            iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
            breadcrumb: false,
            submenu: [
                ...getAuthCourseInnerSubMenuNoClassV3(lang, '<theme-slug>', <N>)
            ]
        },
    ]

    // resources (only if resources = yes)
    baseMenu.push({
        key: 'chapter-sidenav-theme-<theme-slug>-resources',
        path: `${AUTH_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-<theme-slug>/${getLocalizedConfig(lang)?.resources}`,
        title: 'module.resources',
        icon: faBoxes,
        iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
        breadcrumb: false,
        submenu: [
            ...getCoursePracticeResourcesInnerSubMenu(lang, '<theme-slug>', 'resources')
        ]
    })

    return baseMenu;
}
```

---

### Phase 4 — Top-level navigation config

#### English (`EnglishCourseMainNavigationConfig.js`)

Add imports at the top:
```js
import { CourseSubNavigation<PascalName>Theme } from '../Submenus/CourseSubNavigation<PascalName>Theme';
import { AuthCourseSubNavigation<PascalName>Theme } from '../Submenus/AuthCourseSubNavigation<PascalName>Theme';
```

Add nav item to the array (place it after the hidden items, before the visible items group, so display order is controlled by position):

**With tiers (Silver and/or Gold):**
```js
{
    key: 'level-<theme-slug>-part-eng',
    nameToCourseCodeKey: '<theme-slug>',
    path: `${APP_PREFIX_PATH}/en/level-<theme-slug>`,
    title: 'main.upper.nav.theme.level.<camelCaseTheme>',
    sideTitle: '<EN Display Name>',
    icon: COURSE_ICON_CONFIG.default,
    iconType: ICON_LIBRARY_TYPE_CONFIG.hostedSvg,
    color: isAuthenticated && coursesByTheme['<theme-slug>']?.courseTierAccess === COURSE_TIERS_CONFIG.silver
            ? COURSE_COLOR_CONFIG.silverTier
            : isAuthenticated && coursesByTheme['<theme-slug>']?.courseTierAccess === COURSE_TIERS_CONFIG.gold
            ? COURSE_COLOR_CONFIG.goldTier
            : COURSE_COLOR_CONFIG.<camelCaseTheme>Theme,
    current: false,
    isRootMenuItem: true,
    iconPosition: "upperNav",
    isServiceAvailableForUser: false,
    isToDisplayInNavigation: true,
    isFree: false,
    course: "English",
    topSubmenu: [],
    submenu: [
        ...(isAuthenticated
            ? AuthCourseSubNavigation<PascalName>Theme("en", coursesByTheme['<theme-slug>'])
            : CourseSubNavigation<PascalName>Theme("en")
        )
    ]
},
```

**No tiers:**
```js
{
    key: 'level-<theme-slug>-part-eng',
    nameToCourseCodeKey: '<theme-slug>',
    path: `${APP_PREFIX_PATH}/en/level-<theme-slug>`,
    title: 'main.upper.nav.theme.level.<camelCaseTheme>',
    sideTitle: '<EN Display Name>',
    icon: COURSE_ICON_CONFIG.default,
    iconType: ICON_LIBRARY_TYPE_CONFIG.hostedSvg,
    color: COURSE_COLOR_CONFIG.<camelCaseTheme>Theme,
    current: false,
    isRootMenuItem: true,
    iconPosition: "upperNav",
    isServiceAvailableForUser: false,
    isToDisplayInNavigation: true,
    isFree: false,
    course: "English",
    topSubmenu: [],
    submenu: [
        ...(isAuthenticated
            ? AuthCourseSubNavigation<PascalName>Theme("en", coursesByTheme['<theme-slug>'])
            : CourseSubNavigation<PascalName>Theme("en")
        )
    ]
},
```

#### Spanish (`SpanishCourseMainNavigationConfig.js`)

**⚠️ DynamicNavigationRouter fix required** (if tiers selected OR for future-proofing):
In `src/services/DynamicNavigationRouter.js`, change:
```js
// Before:
case "es":
  return SpanishCourseMainNavigationConfig(isAuthenticated);
// After:
case "es":
  return SpanishCourseMainNavigationConfig(isAuthenticated, coursesByTheme);
```

Add imports at the top of `SpanishCourseMainNavigationConfig.js`:
```js
import { CourseSubNavigation<PascalName>Theme } from '../Submenus/CourseSubNavigation<PascalName>Theme';
import { AuthCourseSubNavigation<PascalName>Theme } from '../Submenus/AuthCourseSubNavigation<PascalName>Theme';
import { COURSE_TIERS_CONFIG } from '../../CourseThemeConfig'; // add only if tiers selected
```

Add nav item (Spanish uses `nivel-` prefix via `getLocalizedConfig`):

**With tiers:**
```js
{
    key: 'level-<theme-slug>-spa',
    nameToCourseCodeKey: '<theme-slug>',
    path: `${APP_PREFIX_PATH}/es/nivel-<theme-slug>`,
    title: 'main.upper.nav.theme.level.<camelCaseTheme>',
    sideTitle: '<ES Display Name>',
    icon: COURSE_ICON_CONFIG.default,
    iconType: ICON_LIBRARY_TYPE_CONFIG.hostedSvg,
    color: isAuthenticated && coursesByTheme?.['<theme-slug>']?.courseTierAccess === COURSE_TIERS_CONFIG.silver
            ? COURSE_COLOR_CONFIG.silverTier
            : isAuthenticated && coursesByTheme?.['<theme-slug>']?.courseTierAccess === COURSE_TIERS_CONFIG.gold
            ? COURSE_COLOR_CONFIG.goldTier
            : COURSE_COLOR_CONFIG.<camelCaseTheme>Theme,
    current: false,
    isRootMenuItem: true,
    iconPosition: "upperNav",
    isServiceAvailableForUser: false,
    isToDisplayInNavigation: true,
    isFree: false,
    course: "Español",
    topSubmenu: [],
    submenu: [
        ...(isAuthenticated
            ? AuthCourseSubNavigation<PascalName>Theme("es", coursesByTheme?.['<theme-slug>'])
            : CourseSubNavigation<PascalName>Theme("es")
        )
    ]
},
```

**No tiers:**
```js
{
    key: 'level-<theme-slug>-spa',
    nameToCourseCodeKey: '<theme-slug>',
    path: `${APP_PREFIX_PATH}/es/nivel-<theme-slug>`,
    title: 'main.upper.nav.theme.level.<camelCaseTheme>',
    sideTitle: '<ES Display Name>',
    icon: COURSE_ICON_CONFIG.default,
    iconType: ICON_LIBRARY_TYPE_CONFIG.hostedSvg,
    color: COURSE_COLOR_CONFIG.<camelCaseTheme>Theme,
    current: false,
    isRootMenuItem: true,
    iconPosition: "upperNav",
    isServiceAvailableForUser: false,
    isToDisplayInNavigation: true,
    isFree: false,
    course: "Español",
    topSubmenu: [],
    submenu: [
        ...(isAuthenticated
            ? AuthCourseSubNavigation<PascalName>Theme("es", undefined)
            : CourseSubNavigation<PascalName>Theme("es")
        )
    ]
},
```

#### Portuguese (`PortugueseCourseMainNavigationConfig.js`)

Same pattern as English but with:
- `key`: `'level-<theme-slug>-por'`
- `path`: `${APP_PREFIX_PATH}/pt/nivel-<theme-slug>`
- `course`: `"Português"` (check existing items to confirm)
- Pass `"pt"` as lang code
- `coursesByTheme` is already passed for Portuguese (no router fix needed)

---

### Phase 4c — Wire Spanish and Portuguese to English capabilities

**Run this phase whenever Spanish or Portuguese is in the selected languages.** It brings existing items in those configs up to parity with English and applies any `isToDisplayInNavigation` changes the user requested.

#### 4c-1: DynamicNavigationRouter.js — Spanish `coursesByTheme` passthrough

Always apply this fix when Spanish is selected, regardless of whether tiers are chosen:

```js
// src/services/DynamicNavigationRouter.js  line ~12
// Before:
case "es":
  return SpanishCourseMainNavigationConfig(isAuthenticated);
// After:
case "es":
  return SpanishCourseMainNavigationConfig(isAuthenticated, coursesByTheme);
```

Portuguese already passes `coursesByTheme` — no change needed there.

#### 4c-2: Add missing imports to the language config file

For each language config that is missing them, add to the import block at the top:

```js
import { COURSE_TIERS_CONFIG } from '../../CourseThemeConfig';  // add if not present
```

`COURSE_COLOR_CONFIG`, `COURSE_ICON_CONFIG`, and `ICON_LIBRARY_TYPE_CONFIG` are already imported in both Spanish and Portuguese configs — do not duplicate them.

#### 4c-3: Patch existing items — add missing structural fields

For each existing item in the language config that is missing any of these fields, add them:

**`topSubmenu: []`** — add after `course: "<Language>"` if absent:
```js
topSubmenu: [],
```

**`nameToCourseCodeKey`** — for level-based items (Nivel 1 / 2 / 3), derive from their existing path slug. Examples:
- `level-1-spa` → `nameToCourseCodeKey: "english-connect-1"` (match the English pattern)
- `level-2-spa` → `nameToCourseCodeKey: "english-connect-2"`
- `level-3-spa` → `nameToCourseCodeKey: "english-connect-3"`

For Portuguese: same logic with `level-1-por`, `level-2-por`, `level-3-por`.

If the correct courseCodeKey is uncertain for an item, add it as a comment `// TODO: confirm nameToCourseCodeKey` and leave the field out rather than guessing.

#### 4c-4: Apply isToDisplayInNavigation changes

For each item the user asked to toggle in Phase 0 Call 3, flip its `isToDisplayInNavigation` value.

**Rules:**
- An item set to `false` is still kept in the config array — it provides routing for the side nav when a user visits that course path.
- An item set to `true` will appear in the top nav; its position in the array controls its left-to-right display order.
- If toggling an item to `false` would leave the language with **zero visible items**, warn the user and ask for confirmation before proceeding.

**Example diff for Spanish:**
```js
// Before:
isToDisplayInNavigation: true,   // level-1-spa — being hidden
// After:
isToDisplayInNavigation: false,  // level-1-spa — hidden; kept for side-nav routing
```

#### 4c-5: Update tier-conditional color logic on existing items (optional)

If tiers are selected for the new course AND the user wants existing items to also show tier colors, add the same conditional color logic to those items. Only do this if explicitly requested — do not change existing items' color logic unless asked.

---

### Phase 7 — Spine data entries

Print the following copy-ready JSON entries. Remind the user: **fields marked `TODO` must be filled manually** (dates, titles, video/PDF/Quizlet URLs). The `courseCodeId` must be real before spine data is deployed.

**1. course-theme-registry.data.json** — add to existing object:
```json
"<theme-slug>": ["<courseCodeId>"]
```

**2. after-purchase-messages.json** — add to array:
```json
{
    "courseCodeId": "<courseCodeId>",
    "accessTier": "Gold",
    "emails": {
        "en": {
            "subject": "TODO: Thank you for purchasing <Display Name>!",
            "bodyUrl": "<courseCodeId>/purchase_gold_en.txt"
        },
        "es": {
            "subject": "TODO: ¡Gracias por adquirir <Display Name>!",
            "bodyUrl": "<courseCodeId>/purchase_gold_es.txt"
        }
    }
}
```

**3. welcome-messages.json** — add to array:
```json
{
    "courseCodeId": "<courseCodeId>",
    "emails": {
        "en": {
            "subject": "TODO: Welcome to <Display Name>!",
            "bodyUrl": "<courseCodeId>/welcome_en.txt"
        },
        "es": {
            "subject": "TODO: ¡Bienvenido a <Display Name>!",
            "bodyUrl": "<courseCodeId>/welcome_es.txt"
        }
    }
}
```

**4. course-theme-registry.data.json** — (already done in Phase 1 above)

**5. badge-theme-registry.data.json** — (only if tiers, done in Phase 1 above)

**6. chapter-class-data.json** — add to array:
```json
{
    "id": "TODO_<NEXT_ID>",
    "level": <levelNumber>,
    "theme": "<theme-slug>",
    "baseLanguages": ["es"],
    "contentLanguageCode": "en",
    "chapters": []
}
```

**7. grammar-class-data.json** — add to array:
```json
{
    "id": "TODO_G<NEXT_ID>",
    "level": <levelNumber>,
    "theme": "<theme-slug>",
    "baseLanguages": ["es"],
    "contentLanguageCode": "en",
    "chapters": []
}
```

**8. chapter-book-data.json** — add to `books` array:
```json
{
    "id": "TODO_<short_id>",
    "theme": "<theme-slug>",
    "bookType": "vocabulary",
    "bookTitle": "TODO: <Display Name> (Free)",
    "baseLanguages": ["es", "pt"],
    "tier": "Free",
    "contentLanguageCode": "en",
    "chapters": []
}
```

**9. pdf-data.json** — add to `pdfs` array:
```json
{
    "provider": "cloud",
    "author": "Quizlet",
    "theme": "<theme-slug>",
    "baseLanguages": ["es"],
    "contentLanguageCode": "en",
    "chapters": []
}
```

**10. quizlet-pratice-data.json** — add to `folders` array:
```json
{
    "id": TODO_NEXT_ID,
    "courseTitle": "titulino-<theme-slug>-part-1",
    "level": <levelNumber>,
    "theme": "<theme-slug>",
    "resourceName": "TODO: Titulino Theme <Display Name> Part 1",
    "baseLanguages": ["es"],
    "contentLanguageCode": "en",
    "courses": []
}
```

**11. know-me-survey-data.json** — add to root object:
```json
"<theme-slug>": {
    "1": {
        "questions": [
            {
                "id": "intro",
                "type": "intro",
                "title": "Know Me — Chapter 1",
                "description": "TODO: Write intro description for <Display Name> Chapter 1.",
                "coverUrl": "TODO: https://images.unsplash.com/..."
            }
        ]
    }
}
```

**12. speaking-practice-data.json** — If user provided words during Phase 0, generate:
```json
{
    "theme": "<theme-slug>",
    "baseLanguages": ["es"],
    "contentLanguageCode": "en",
    "chapters": [
        {
            "chapter": 1,
            "title": "TODO: <Display Name> Chapter 1 title",
            "words": [
                {"word": "<word1>", "image": null},
                {"word": "<word2>", "image": null}
            ]
        }
    ]
}
```
If user skipped words, generate a skeleton with empty `words: []` arrays and note they must be filled manually.

**13. course-progress-data.json** — add to array:
```json
{
    "courseId": "<courseCodeId>",
    "courseGeneralTheme": "<theme-slug>",
    "baseLanguages": ["es"],
    "contentLanguageCode": "en",
    "categories": [
        {
            "categoryId": 1,
            "name": "TODO: Category name",
            "categoryLocalizationKey": "nav.generalGatherings",
            "isToDisplay": true,
            "imageUrl": "TODO: https://images.unsplash.com/...",
            "participationIds": [
                {"participationTypeId": 1, "localizationKey": "nav.live"},
                {"participationTypeId": 2, "localizationKey": "nav.recorded"}
            ],
            "lessons": []
        }
    ]
}
```

---

### Phase 8 — Tests and PR

1. Run `.claude/support-scripts/run-tests.sh` — confirm all tests pass.
2. Run `.claude/support-scripts/run-build.sh` — confirm no build errors.
3. Print a **manual checklist** for the user:
   ```
   ✅ Code changes done — review these before merging:
   
   Spine data (fill manually in titulino-bucket-spine):
   □ after-purchase-messages.json — fill subject lines and body URLs
   □ welcome-messages.json — fill subject lines and body URLs
   □ chapter-class-data.json — add chapter entries and video URLs
   □ grammar-class-data.json — add chapter entries and video URLs
   □ chapter-book-data.json — add chapter/page entries
   □ pdf-data.json — add chapter PDF URLs
   □ quizlet-pratice-data.json — add Quizlet set IDs
   □ know-me-survey-data.json — fill question text and cover images
   □ speaking-practice-data.json — fill chapter words (if skipped)
   □ course-progress-data.json — fill category/lesson details
   
   If courseCodeId was "pending":
   □ Create course in admin UI first
   □ Replace all TODO_<THEME> placeholders with real courseCodeId
   □ Update course-theme-registry.data.json
   ```
4. Stage only the changed source files (not docs, not spine data files if they live outside this repo).
5. Read `.claude/templates/commit-message.md` and commit with `feat: add <theme-name> course nav and config`.
6. Push to current branch.
7. Report: files changed, commit hash, manual steps remaining.

---

## Key rules and warnings

- **Never hardcode API URLs** — all paths use `APP_PREFIX_PATH` / `AUTH_PREFIX_PATH` from `AppConfig.js`.
- **Never test the service layer** — LOB and reducer tests only.
- **Spanish DynamicNavigationRouter** — always fix the `coursesByTheme` passthrough when adding a Spanish course, even if tiers are not selected. It's a 1-line change that enables future tier support without a second PR.
- **Spine data files live outside this repo** — prompt the user for the path to `titulino-bucket-spine` before generating entries; default path is `C:\Users\AlbertoArellano\t-bucket\titulino-bucket-spine\titulino-bucket\titulino-spine-data\`. If path doesn't exist, print entries to the console instead and ask user to paste manually.
- **`topSubmenu: []`** must be present on all new nav items — `MenuContentTop.js` checks `menu?.topSubmenu?.length > 0`.
- **Follow plan-before-coding rule** — Step 2 confirmation is mandatory; do not skip it.
