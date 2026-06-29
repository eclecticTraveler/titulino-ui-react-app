// AudienceMessaging.js imports antd components for table column renderers.
// Mock antd here so Jest doesn't attempt to resolve its locale internals.
jest.mock('antd', () => ({
  Button: () => null,
  Tag: () => null,
  Tooltip: () => null,
}));

import AudienceMessaging from '../AudienceMessaging';

const { buildContactSegmentPayload, buildCountryDivisionOptions } = AudienceMessaging;

// ---------------------------------------------------------------------------
// buildCountryDivisionOptions
// ---------------------------------------------------------------------------
describe('buildCountryDivisionOptions', () => {
  describe('__unknown__ sentinel', () => {
    const unknownRow = { name: '__unknown__' };

    it('uses unknownLabel for the __unknown__ entry when provided', () => {
      const options = buildCountryDivisionOptions([unknownRow], 'N/A', 'Unknown');
      const entry = options.find(o => o.value === '__unknown__');
      expect(entry).toBeDefined();
      expect(entry.label).toBe('Unknown');
    });

    it('falls back to notAvailableLabel when unknownLabel is null', () => {
      const options = buildCountryDivisionOptions([unknownRow], 'N/A', null);
      const entry = options.find(o => o.value === '__unknown__');
      expect(entry.label).toBe('N/A');
    });

    it('falls back to notAvailableLabel when unknownLabel is omitted (two-arg call)', () => {
      const options = buildCountryDivisionOptions([unknownRow], 'N/A');
      const entry = options.find(o => o.value === '__unknown__');
      expect(entry.label).toBe('N/A');
    });

    it('does not affect the label of normal entries', () => {
      const rows = [{ name: 'Buenos Aires' }, unknownRow];
      const options = buildCountryDivisionOptions(rows, 'N/A', 'Unknown');
      const ba = options.find(o => o.value === 'Buenos Aires');
      expect(ba.label).toBe('Buenos Aires');
    });

    it('preserves __unknown__ as the value (not replaced)', () => {
      const options = buildCountryDivisionOptions([unknownRow], 'N/A', 'Unknown');
      const entry = options.find(o => o.value === '__unknown__');
      expect(entry.value).toBe('__unknown__');
    });
  });

  describe('general behaviour', () => {
    it('returns empty array for empty input', () => {
      expect(buildCountryDivisionOptions([])).toEqual([]);
    });

    it('returns empty array for non-array input', () => {
      expect(buildCountryDivisionOptions(null)).toEqual([]);
      expect(buildCountryDivisionOptions(undefined)).toEqual([]);
    });

    it('accepts primitive string entries', () => {
      const options = buildCountryDivisionOptions(['Jalisco', 'Oaxaca']);
      expect(options.map(o => o.value)).toEqual(expect.arrayContaining(['Jalisco', 'Oaxaca']));
    });

    it('deduplicates entries with the same value', () => {
      const rows = [{ name: 'Jalisco' }, { name: 'Jalisco' }];
      const options = buildCountryDivisionOptions(rows);
      expect(options.filter(o => o.value === 'Jalisco')).toHaveLength(1);
    });

    it('sorts entries alphabetically by label', () => {
      const rows = [{ name: 'Zacatecas' }, { name: 'Aguascalientes' }, { name: 'Jalisco' }];
      const options = buildCountryDivisionOptions(rows);
      expect(options.map(o => o.label)).toEqual(['Aguascalientes', 'Jalisco', 'Zacatecas']);
    });
  });
});

// ---------------------------------------------------------------------------
// buildContactSegmentPayload — region array handling
// ---------------------------------------------------------------------------
describe('buildContactSegmentPayload — region params', () => {
  describe('p_residency_region', () => {
    it('serializes an array of regions as an array (not a string)', () => {
      const payload = buildContactSegmentPayload({
        residencyCountry: 'AR',
        residencyRegion: ['Buenos Aires', 'Córdoba'],
      });
      expect(Array.isArray(payload.p_residency_region)).toBe(true);
      expect(payload.p_residency_region).toEqual(['Buenos Aires', 'Córdoba']);
    });

    it('passes __unknown__ sentinel through as an array element', () => {
      const payload = buildContactSegmentPayload({
        residencyCountry: 'AR',
        residencyRegion: ['__unknown__'],
      });
      expect(payload.p_residency_region).toEqual(['__unknown__']);
    });

    it('handles mixed array with __unknown__ and real regions', () => {
      const payload = buildContactSegmentPayload({
        residencyCountry: 'AR',
        residencyRegion: ['Buenos Aires', '__unknown__'],
      });
      expect(payload.p_residency_region).toEqual(['Buenos Aires', '__unknown__']);
    });

    it('omits p_residency_region when value is null', () => {
      const payload = buildContactSegmentPayload({
        residencyCountry: 'AR',
        residencyRegion: null,
      });
      expect(payload).not.toHaveProperty('p_residency_region');
    });

    it('omits p_residency_region when value is an empty array', () => {
      const payload = buildContactSegmentPayload({
        residencyCountry: 'AR',
        residencyRegion: [],
      });
      expect(payload).not.toHaveProperty('p_residency_region');
    });

    it('omits p_residency_region when value is a non-array (guards against wrong type)', () => {
      const payload = buildContactSegmentPayload({
        residencyCountry: 'AR',
        residencyRegion: 'Buenos Aires',
      });
      expect(payload).not.toHaveProperty('p_residency_region');
    });
  });

  describe('p_birth_region', () => {
    it('serializes an array of birth regions as an array', () => {
      const payload = buildContactSegmentPayload({
        birthCountry: 'MX',
        birthRegion: ['Ciudad de México', 'Jalisco'],
      });
      expect(Array.isArray(payload.p_birth_region)).toBe(true);
      expect(payload.p_birth_region).toEqual(['Ciudad de México', 'Jalisco']);
    });

    it('omits p_birth_region when value is null', () => {
      const payload = buildContactSegmentPayload({
        birthCountry: 'MX',
        birthRegion: null,
      });
      expect(payload).not.toHaveProperty('p_birth_region');
    });
  });

  describe('p_residency_exclude / p_birth_exclude', () => {
    it('includes p_residency_exclude as false when residencyCountry is set and residencyExclude is false', () => {
      const payload = buildContactSegmentPayload({
        residencyCountry: 'AR',
        residencyExclude: false,
      });
      expect(payload.p_residency_exclude).toBe(false);
    });

    it('includes p_birth_exclude as true when birthCountry is set and birthExclude is true', () => {
      const payload = buildContactSegmentPayload({
        birthCountry: 'MX',
        birthExclude: true,
      });
      expect(payload.p_birth_exclude).toBe(true);
    });

    it('omits p_residency_exclude when residencyCountry is not set', () => {
      const payload = buildContactSegmentPayload({ residencyExclude: true });
      expect(payload).not.toHaveProperty('p_residency_exclude');
    });

    it('omits p_birth_exclude when birthCountry is not set', () => {
      const payload = buildContactSegmentPayload({ birthExclude: true });
      expect(payload).not.toHaveProperty('p_birth_exclude');
    });
  });
});
