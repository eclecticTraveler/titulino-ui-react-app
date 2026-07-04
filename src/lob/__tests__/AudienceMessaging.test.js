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

  describe('p_exclude_category_id / p_exclude_course_code_id', () => {
    it('includes p_exclude_category_id as a number when excludeCategoryId is provided', () => {
      const payload = buildContactSegmentPayload({ excludeCategoryId: 5 });
      expect(payload.p_exclude_category_id).toBe(5);
    });

    it('includes p_exclude_category_id as a number when excludeCategoryId is a numeric string', () => {
      const payload = buildContactSegmentPayload({ excludeCategoryId: '3' });
      expect(payload.p_exclude_category_id).toBe(3);
    });

    it('omits p_exclude_category_id when excludeCategoryId is null', () => {
      const payload = buildContactSegmentPayload({ excludeCategoryId: null });
      expect(payload).not.toHaveProperty('p_exclude_category_id');
    });

    it('omits p_exclude_category_id when excludeCategoryId is undefined', () => {
      const payload = buildContactSegmentPayload({});
      expect(payload).not.toHaveProperty('p_exclude_category_id');
    });

    it('includes p_exclude_course_code_id when excludeCourseCodeId is provided', () => {
      const payload = buildContactSegmentPayload({ excludeCourseCodeId: 'COURSE-01' });
      expect(payload.p_exclude_course_code_id).toBe('COURSE-01');
    });

    it('omits p_exclude_course_code_id when excludeCourseCodeId is empty string', () => {
      const payload = buildContactSegmentPayload({ excludeCourseCodeId: '' });
      expect(payload).not.toHaveProperty('p_exclude_course_code_id');
    });

    it('omits p_exclude_course_code_id when excludeCourseCodeId is "all"', () => {
      const payload = buildContactSegmentPayload({ excludeCourseCodeId: 'all' });
      expect(payload).not.toHaveProperty('p_exclude_course_code_id');
    });

    it('omits p_exclude_course_code_id when excludeCourseCodeId is null', () => {
      const payload = buildContactSegmentPayload({ excludeCourseCodeId: null });
      expect(payload).not.toHaveProperty('p_exclude_course_code_id');
    });

    it('both params are included together', () => {
      const payload = buildContactSegmentPayload({
        excludeCategoryId: 14,
        excludeCourseCodeId: 'COURSE-01',
      });
      expect(payload.p_exclude_category_id).toBe(14);
      expect(payload.p_exclude_course_code_id).toBe('COURSE-01');
    });
  });
});

// ---------------------------------------------------------------------------
// buildCommunicationTrackingHistoryPayload
// ---------------------------------------------------------------------------
const {
  buildCommunicationCategoryTableModel,
  buildCommunicationTrackingHistoryPayload,
  buildCommunicationTrackingHistoryTableModel
} = AudienceMessaging;

describe('buildCommunicationTrackingHistoryPayload', () => {
  it('returns only p_limit and p_offset for empty filters', () => {
    const payload = buildCommunicationTrackingHistoryPayload({});
    expect(payload).toEqual({ p_limit: 50, p_offset: 0 });
  });

  it('returns default limit 50 and offset 0 when not specified', () => {
    const payload = buildCommunicationTrackingHistoryPayload();
    expect(payload.p_limit).toBe(50);
    expect(payload.p_offset).toBe(0);
  });

  it('includes p_category_id as a number when categoryId is provided', () => {
    const payload = buildCommunicationTrackingHistoryPayload({ categoryId: 7 });
    expect(payload.p_category_id).toBe(7);
  });

  it('includes p_category_id from numeric string', () => {
    const payload = buildCommunicationTrackingHistoryPayload({ categoryId: '2' });
    expect(payload.p_category_id).toBe(2);
  });

  it('omits p_category_id when categoryId is null', () => {
    const payload = buildCommunicationTrackingHistoryPayload({ categoryId: null });
    expect(payload).not.toHaveProperty('p_category_id');
  });

  it('includes p_course_code_id when courseCodeId is provided', () => {
    const payload = buildCommunicationTrackingHistoryPayload({ courseCodeId: 'COURSE-X' });
    expect(payload.p_course_code_id).toBe('COURSE-X');
  });

  it('omits p_course_code_id when courseCodeId is empty', () => {
    const payload = buildCommunicationTrackingHistoryPayload({ courseCodeId: '' });
    expect(payload).not.toHaveProperty('p_course_code_id');
  });

  it('omits p_course_code_id when courseCodeId is "all"', () => {
    const payload = buildCommunicationTrackingHistoryPayload({ courseCodeId: 'all' });
    expect(payload).not.toHaveProperty('p_course_code_id');
  });

  it('includes p_was_successful true when wasSuccessful is true', () => {
    const payload = buildCommunicationTrackingHistoryPayload({ wasSuccessful: true });
    expect(payload.p_was_successful).toBe(true);
  });

  it('includes p_was_successful false when wasSuccessful is false', () => {
    const payload = buildCommunicationTrackingHistoryPayload({ wasSuccessful: false });
    expect(payload.p_was_successful).toBe(false);
  });

  it('omits p_was_successful when wasSuccessful is null', () => {
    const payload = buildCommunicationTrackingHistoryPayload({ wasSuccessful: null });
    expect(payload).not.toHaveProperty('p_was_successful');
  });

  it('omits p_was_successful when wasSuccessful is undefined', () => {
    const payload = buildCommunicationTrackingHistoryPayload({});
    expect(payload).not.toHaveProperty('p_was_successful');
  });

  it('respects custom limit and offset', () => {
    const payload = buildCommunicationTrackingHistoryPayload({ limit: 20, offset: 40 });
    expect(payload.p_limit).toBe(20);
    expect(payload.p_offset).toBe(40);
  });
});

// ---------------------------------------------------------------------------
// buildCommunicationTrackingHistoryTableModel
// ---------------------------------------------------------------------------
describe('buildCommunicationTrackingHistoryTableModel', () => {
  it('returns an empty array for empty input', () => {
    expect(buildCommunicationTrackingHistoryTableModel([])).toEqual([]);
  });

  it('returns an empty array for non-array input', () => {
    expect(buildCommunicationTrackingHistoryTableModel(null)).toEqual([]);
    expect(buildCommunicationTrackingHistoryTableModel(undefined)).toEqual([]);
  });

  it('normalizes a row with PascalCase keys', () => {
    const rows = [{
      TrackingId: 101,
      ContactExternalId: 'ext-1',
      EmailId: 'test@example.com',
      CourseCodeId: 'COURSE-A',
      CategoryDisplayName: 'Welcome',
      WasSentSuccessful: true,
      SentAt: '2026-07-03T10:00:00Z',
    }];
    const [row] = buildCommunicationTrackingHistoryTableModel(rows);
    expect(row.trackingId).toBe(101);
    expect(row.contactExternalId).toBe('ext-1');
    expect(row.emailId).toBe('test@example.com');
    expect(row.courseCodeId).toBe('COURSE-A');
    expect(row.categoryName).toBe('Welcome');
    expect(row.wasSentSuccessful).toBe(true);
    expect(row.sentAt).toBe('2026-07-03T10:00:00Z');
  });

  it('normalizes a row with camelCase keys', () => {
    const rows = [{
      trackingId: 202,
      emailId: 'other@example.com',
      wasSentSuccessful: false,
      sentAt: '2026-07-03T11:00:00Z',
    }];
    const [row] = buildCommunicationTrackingHistoryTableModel(rows);
    expect(row.trackingId).toBe(202);
    expect(row.emailId).toBe('other@example.com');
    expect(row.wasSentSuccessful).toBe(false);
  });

  it('uses "—" as categoryName when no category field is present', () => {
    const [row] = buildCommunicationTrackingHistoryTableModel([{ TrackingId: 1 }]);
    expect(row.categoryName).toBe('—');
  });

  it('sets key to trackingId when trackingId is present', () => {
    const [row] = buildCommunicationTrackingHistoryTableModel([{ TrackingId: 99 }]);
    expect(row.key).toBe(99);
  });

  it('sets key to tracking-{index} when trackingId is null', () => {
    const [row] = buildCommunicationTrackingHistoryTableModel([{ EmailId: 'x@x.com' }]);
    expect(row.key).toBe('tracking-0');
  });

  it('coerces wasSentSuccessful to a boolean', () => {
    const [truthy] = buildCommunicationTrackingHistoryTableModel([{ WasSentSuccessful: 1 }]);
    const [falsy] = buildCommunicationTrackingHistoryTableModel([{ WasSentSuccessful: 0 }]);
    expect(truthy.wasSentSuccessful).toBe(true);
    expect(falsy.wasSentSuccessful).toBe(false);
  });

  it('preserves original row fields via spread', () => {
    const rows = [{ TrackingId: 5, ExtraField: 'extra' }];
    const [row] = buildCommunicationTrackingHistoryTableModel(rows);
    expect(row.ExtraField).toBe('extra');
  });
});

// ---------------------------------------------------------------------------
// buildCommunicationCategoryTableModel
// ---------------------------------------------------------------------------
describe('buildCommunicationCategoryTableModel', () => {
  it('returns empty array for empty input', () => {
    expect(buildCommunicationCategoryTableModel([])).toEqual([]);
  });

  it('returns empty array for non-array input', () => {
    expect(buildCommunicationCategoryTableModel(null)).toEqual([]);
    expect(buildCommunicationCategoryTableModel(undefined)).toEqual([]);
  });

  it('normalizes PascalCase DB fields to camelCase', () => {
    const rows = [{
      CommunicationCategoryId: 1,
      CommunicationCategoryName: 'welcome',
      DisplayName: 'Welcome',
      is_active: true
    }];
    const [row] = buildCommunicationCategoryTableModel(rows);
    expect(row.id).toBe(1);
    expect(row.categoryKey).toBe('welcome');
    expect(row.displayName).toBe('Welcome');
    expect(row.isActive).toBe(true);
  });

  it('normalizes camelCase fields', () => {
    const rows = [{
      communicationCategoryId: 2,
      communicationCategoryName: 'week1',
      displayName: 'Week 1',
      isActive: true
    }];
    const [row] = buildCommunicationCategoryTableModel(rows);
    expect(row.id).toBe(2);
    expect(row.categoryKey).toBe('week1');
    expect(row.displayName).toBe('Week 1');
  });

  it('falls back to categoryKey as displayName when DisplayName is absent', () => {
    const rows = [{ CommunicationCategoryId: 3, CommunicationCategoryName: 'birthday' }];
    const [row] = buildCommunicationCategoryTableModel(rows);
    expect(row.displayName).toBe('birthday');
  });

  it('treats is_active=false as isActive=false', () => {
    const [row] = buildCommunicationCategoryTableModel([{ CommunicationCategoryId: 4, is_active: false }]);
    expect(row.isActive).toBe(false);
  });

  it('treats missing is_active as isActive=true', () => {
    const [row] = buildCommunicationCategoryTableModel([{ CommunicationCategoryId: 5 }]);
    expect(row.isActive).toBe(true);
  });

  it('sets key to id when id is present', () => {
    const [row] = buildCommunicationCategoryTableModel([{ CommunicationCategoryId: 7 }]);
    expect(row.key).toBe(7);
  });

  it('sets key to category-{index} when id is absent', () => {
    const [row] = buildCommunicationCategoryTableModel([{ CommunicationCategoryName: 'na' }]);
    expect(row.key).toBe('category-0');
  });

  it('preserves original row fields via spread', () => {
    const rows = [{ CommunicationCategoryId: 19, ExtraField: 'extra' }];
    const [row] = buildCommunicationCategoryTableModel(rows);
    expect(row.ExtraField).toBe('extra');
  });
});
