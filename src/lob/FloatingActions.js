/**
 * IFloatingAction shape
 * {
 *   id:                  string
 *   enabled:             boolean
 *   type:                'facebook-resolver' | 'contact-form' | 'link' | 'resolver' | 'course-resolver'
 *   showUnauthenticated: boolean
 *   showAuthenticated:   boolean
 *   label:               string
 *   url?:                string           (link type — single fixed URL)
 *   defaultUrl?:         string           (facebook-resolver | resolver | course-resolver — fallback URL)
 *   mappings?:           IMapping[]       (resolver type — inline mapping array)
 *   courseMappings?:     ICourseMapping[] (course-resolver type)
 *   imageUrl?:           string           (link type with custom image, no ACTION_ICONS entry)
 * }
 *
 * IMapping shape (used by 'resolver' type actions and by resolveFacebookUrl for 'facebook-resolver')
 * {
 *   nativeLanguage?: string   (ISO code, e.g. 'pt', 'en' — omit for target-only match)
 *   targetLanguage:  string
 *   url:             string
 * }
 *
 * ICourseMapping shape (used by 'course-resolver' type actions)
 * {
 *   courseTheme: string   (e.g. 'meditaciones', 'speeches', 'english-connect')
 *   url:         string
 * }
 *
 * --- Adding a new external link action ---
 * 1. Add JSON entry: { "id": "telegram", "type": "link", "url": "...", ... }
 *    For mapping-based: { "type": "resolver", "defaultUrl": "...", "mappings": [...], ... }
 *    For course-based:  { "type": "course-resolver", "defaultUrl": "...", "courseMappings": [...], ... }
 * 2. Add icon to ACTION_ICONS in FloatingActionMenu/index.js: telegram: <TelegramSvg />
 * 3. Add LESS modifier in _floating-action-menu.less: .floating-action-btn--telegram { background-color: #0088cc; }
 * 4. Add localization key: "floating.telegram.tooltip": "..."
 */

/**
 * T4: Resolve the correct Facebook URL.
 *
 * Priority order:
 *   1. nativeLanguage + targetLanguage exact match
 *   2. targetLanguage-only match (nativeLanguage absent in mapping)
 *   3. defaultUrl
 *
 * Unauthenticated callers should pass null/undefined for both lang IDs
 * so the function naturally falls through to defaultUrl.
 */
export const resolveFacebookUrl = (nativeLangId, targetLangId, mappings = [], defaultUrl = '') => {
  if (!Array.isArray(mappings) || mappings.length === 0) return defaultUrl;

  // Pass 1 — most specific: both languages match
  if (nativeLangId && targetLangId) {
    const specific = mappings.find(
      m => m.nativeLanguage === nativeLangId && m.targetLanguage === targetLangId
    );
    if (specific) return specific.url;
  }

  // Pass 2 — target language only (mapping has no nativeLanguage field)
  if (targetLangId) {
    const byTarget = mappings.find(
      m => !m.nativeLanguage && m.targetLanguage === targetLangId
    );
    if (byTarget) return byTarget.url;
  }

  return defaultUrl;
};

/**
 * Resolve a WhatsApp (or similar) URL by current course theme.
 * Falls back to defaultUrl when courseTheme is absent or has no mapping.
 */
export const resolveCourseUrl = (courseTheme, courseMappings = [], defaultUrl = '') => {
  if (!Array.isArray(courseMappings) || courseMappings.length === 0) return defaultUrl;
  if (courseTheme) {
    const match = courseMappings.find(m => m.courseTheme === courseTheme.toLowerCase());
    if (match) return match.url;
  }
  return defaultUrl;
};

/**
 * T5: Filter the actions array to only those visible to the current user.
 *
 * Rules:
 *   - enabled: false  → always hidden
 *   - showUnauthenticated: false + !isAuthenticated → hidden
 *   - showAuthenticated: false + isAuthenticated → hidden (reserved for future use)
 */
export const resolveVisibleActions = (actions = [], isAuthenticated = false) => {
  if (!Array.isArray(actions)) return [];

  return actions.filter(action => {
    if (!action.enabled) return false;
    if (!isAuthenticated && !action.showUnauthenticated) return false;
    if (isAuthenticated && action.showAuthenticated === false) return false;
    return true;
  });
};

/**
 * Generic URL resolver for 'link', 'resolver', and 'course-resolver' type actions.
 *
 * type: 'course-resolver' → lookup by courseTheme using action.courseMappings + action.defaultUrl
 * type: 'resolver'        → mapping-based lookup using action.mappings + action.defaultUrl
 *                           (same priority logic as resolveFacebookUrl)
 * type: 'link'            → returns action.url (single fixed URL)
 * anything else           → returns action.url ?? action.defaultUrl ?? ''
 */
export const resolveExternalUrl = (action, nativeLangId = null, targetLangId = null, courseTheme = null) => {
  if (!action) return '';
  if (action.type === 'course-resolver') {
    return resolveCourseUrl(
      courseTheme,
      Array.isArray(action.courseMappings) ? action.courseMappings : [],
      action.defaultUrl ?? ''
    );
  }
  if (action.type === 'resolver') {
    return resolveFacebookUrl(
      nativeLangId,
      targetLangId,
      Array.isArray(action.mappings) ? action.mappings : [],
      action.defaultUrl ?? ''
    );
  }
  return action.url ?? action.defaultUrl ?? '';
};

const FloatingActions = {
  resolveFacebookUrl,
  resolveCourseUrl,
  resolveExternalUrl,
  resolveVisibleActions,
};

export default FloatingActions;
