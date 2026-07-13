import FloatingActions from '../FloatingActions';

const { resolveFacebookUrl, resolveExternalUrl, resolveVisibleActions } = FloatingActions;

const MAPPINGS = [
  { targetLanguage: 'en', url: 'https://www.facebook.com/titulinoingles' },
  { nativeLanguage: 'pt', targetLanguage: 'es', url: 'https://www.facebook.com/titulinoespanhol/' },
  { nativeLanguage: 'en', targetLanguage: 'es', url: 'https://www.facebook.com/titulinospanish/' },
  { targetLanguage: 'es', url: 'https://www.facebook.com/titulinospanish/' },
  { targetLanguage: 'pt', url: 'https://www.facebook.com/titulinoportugues/' },
];

const DEFAULT_URL = 'https://www.facebook.com/titulinoingles';

// ---------------------------------------------------------------------------
// resolveFacebookUrl
// ---------------------------------------------------------------------------
describe('resolveFacebookUrl', () => {
  it('returns defaultUrl when mappings is empty', () => {
    expect(resolveFacebookUrl('pt', 'es', [], DEFAULT_URL)).toBe(DEFAULT_URL);
  });

  it('returns defaultUrl when mappings is undefined', () => {
    expect(resolveFacebookUrl('pt', 'es', undefined, DEFAULT_URL)).toBe(DEFAULT_URL);
  });

  it('matches most-specific: pt native + es target', () => {
    expect(resolveFacebookUrl('pt', 'es', MAPPINGS, DEFAULT_URL))
      .toBe('https://www.facebook.com/titulinoespanhol/');
  });

  it('matches most-specific: en native + es target', () => {
    expect(resolveFacebookUrl('en', 'es', MAPPINGS, DEFAULT_URL))
      .toBe('https://www.facebook.com/titulinospanish/');
  });

  it('falls back to target-only when native has no specific mapping: fr native + es target', () => {
    expect(resolveFacebookUrl('fr', 'es', MAPPINGS, DEFAULT_URL))
      .toBe('https://www.facebook.com/titulinospanish/');
  });

  it('target-only match works when native is null (unauthenticated): en target', () => {
    expect(resolveFacebookUrl(null, 'en', MAPPINGS, DEFAULT_URL))
      .toBe('https://www.facebook.com/titulinoingles');
  });

  it('target-only match works when native is undefined', () => {
    expect(resolveFacebookUrl(undefined, 'pt', MAPPINGS, DEFAULT_URL))
      .toBe('https://www.facebook.com/titulinoportugues/');
  });

  it('returns defaultUrl when target has no match', () => {
    expect(resolveFacebookUrl('en', 'de', MAPPINGS, DEFAULT_URL)).toBe(DEFAULT_URL);
  });

  it('returns defaultUrl when both lang IDs are null (unauthenticated, no match)', () => {
    expect(resolveFacebookUrl(null, null, MAPPINGS, DEFAULT_URL)).toBe(DEFAULT_URL);
  });
});

// ---------------------------------------------------------------------------
// resolveVisibleActions
// ---------------------------------------------------------------------------
const ACTIONS = [
  { id: 'facebook', enabled: true, type: 'facebook-resolver', showUnauthenticated: true,  showAuthenticated: true  },
  { id: 'contact',  enabled: true, type: 'contact-form',      showUnauthenticated: false, showAuthenticated: true  },
  { id: 'slot',     enabled: false, type: 'link',             showUnauthenticated: true,  showAuthenticated: true  },
  { id: 'future',   enabled: true, type: 'link',              showUnauthenticated: true,  showAuthenticated: false  },
];

describe('resolveVisibleActions', () => {
  it('returns empty array when actions is empty', () => {
    expect(resolveVisibleActions([], true)).toEqual([]);
  });

  it('returns empty array when actions is undefined', () => {
    expect(resolveVisibleActions(undefined, true)).toEqual([]);
  });

  describe('authenticated user', () => {
    it('shows facebook (enabled, showAuthenticated true)', () => {
      const ids = resolveVisibleActions(ACTIONS, true).map(a => a.id);
      expect(ids).toContain('facebook');
    });

    it('shows contact (showAuthenticated true)', () => {
      const ids = resolveVisibleActions(ACTIONS, true).map(a => a.id);
      expect(ids).toContain('contact');
    });

    it('hides slot (enabled false)', () => {
      const ids = resolveVisibleActions(ACTIONS, true).map(a => a.id);
      expect(ids).not.toContain('slot');
    });

    it('hides future (showAuthenticated false)', () => {
      const ids = resolveVisibleActions(ACTIONS, true).map(a => a.id);
      expect(ids).not.toContain('future');
    });
  });

  describe('unauthenticated user', () => {
    it('shows facebook (showUnauthenticated true)', () => {
      const ids = resolveVisibleActions(ACTIONS, false).map(a => a.id);
      expect(ids).toContain('facebook');
    });

    it('hides contact (showUnauthenticated false)', () => {
      const ids = resolveVisibleActions(ACTIONS, false).map(a => a.id);
      expect(ids).not.toContain('contact');
    });

    it('hides slot (enabled false)', () => {
      const ids = resolveVisibleActions(ACTIONS, false).map(a => a.id);
      expect(ids).not.toContain('slot');
    });

    it('shows future (showUnauthenticated true, enabled true)', () => {
      const ids = resolveVisibleActions(ACTIONS, false).map(a => a.id);
      expect(ids).toContain('future');
    });
  });
});

// ---------------------------------------------------------------------------
// resolveExternalUrl
// ---------------------------------------------------------------------------
const WA_URL = 'https://chat.whatsapp.com/KP7t1BxxavcIQ1toT5YBtT';

describe('resolveExternalUrl', () => {
  it('returns empty string for null action', () => {
    expect(resolveExternalUrl(null)).toBe('');
  });

  describe('type: link', () => {
    const action = { id: 'whatsapp', type: 'link', url: WA_URL };

    it('returns action.url', () => {
      expect(resolveExternalUrl(action)).toBe(WA_URL);
    });

    it('ignores lang args for single-url type', () => {
      expect(resolveExternalUrl(action, 'pt', 'es')).toBe(WA_URL);
    });

    it('returns empty string when url is missing', () => {
      expect(resolveExternalUrl({ id: 'x', type: 'link' })).toBe('');
    });
  });

  describe('type: resolver (mapping-based)', () => {
    const action = {
      id: 'channel',
      type: 'resolver',
      defaultUrl: 'https://example.com/default',
      mappings: [
        { targetLanguage: 'en', url: 'https://example.com/en' },
        { nativeLanguage: 'pt', targetLanguage: 'es', url: 'https://example.com/pt-es' },
      ],
    };

    it('returns specific match (native+target)', () => {
      expect(resolveExternalUrl(action, 'pt', 'es')).toBe('https://example.com/pt-es');
    });

    it('returns target-only match when no native matches', () => {
      expect(resolveExternalUrl(action, null, 'en')).toBe('https://example.com/en');
    });

    it('returns defaultUrl when no mapping matches', () => {
      expect(resolveExternalUrl(action, 'en', 'pt')).toBe('https://example.com/default');
    });

    it('returns defaultUrl when mappings is absent', () => {
      const noMappings = { id: 'x', type: 'resolver', defaultUrl: 'https://example.com/d' };
      expect(resolveExternalUrl(noMappings, 'pt', 'es')).toBe('https://example.com/d');
    });
  });
});
