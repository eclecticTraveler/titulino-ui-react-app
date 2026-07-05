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
  buildCommunicationCategoryKey,
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

  it('normalizes PascalCase DB fields (post-rename columns)', () => {
    const rows = [{
      CommunicationCategoryId: 1,
      CommunicationCategoryKey: 'welcome',
      LocalizationKey: 'messaging.category.welcome',
      IsActive: true
    }];
    const [row] = buildCommunicationCategoryTableModel(rows);
    expect(row.id).toBe(1);
    expect(row.categoryKey).toBe('welcome');
    expect(row.localizationKey).toBe('messaging.category.welcome');
    expect(row.isActive).toBe(true);
  });

  it('normalizes camelCase fields', () => {
    const rows = [{
      communicationCategoryId: 2,
      communicationCategoryKey: 'week1',
      localizationKey: 'messaging.category.week1',
      isActive: true
    }];
    const [row] = buildCommunicationCategoryTableModel(rows);
    expect(row.id).toBe(2);
    expect(row.categoryKey).toBe('week1');
    expect(row.localizationKey).toBe('messaging.category.week1');
  });

  it('sets localizationKey to empty string when absent', () => {
    const rows = [{ CommunicationCategoryId: 3, CommunicationCategoryKey: 'birthday' }];
    const [row] = buildCommunicationCategoryTableModel(rows);
    expect(row.localizationKey).toBe('');
  });

  it('treats IsActive=false as isActive=false', () => {
    const [row] = buildCommunicationCategoryTableModel([{ CommunicationCategoryId: 4, IsActive: false }]);
    expect(row.isActive).toBe(false);
  });

  it('treats missing IsActive as isActive=true', () => {
    const [row] = buildCommunicationCategoryTableModel([{ CommunicationCategoryId: 5 }]);
    expect(row.isActive).toBe(true);
  });

  it('sets key to id when id is present', () => {
    const [row] = buildCommunicationCategoryTableModel([{ CommunicationCategoryId: 7 }]);
    expect(row.key).toBe(7);
  });

  it('sets key to category-{index} when id is absent', () => {
    const [row] = buildCommunicationCategoryTableModel([{ CommunicationCategoryKey: 'na' }]);
    expect(row.key).toBe('category-0');
  });

  it('preserves original row fields via spread', () => {
    const rows = [{ CommunicationCategoryId: 19, ExtraField: 'extra' }];
    const [row] = buildCommunicationCategoryTableModel(rows);
    expect(row.ExtraField).toBe('extra');
  });
});

// ---------------------------------------------------------------------------
// buildCommunicationCategoryKey
// ---------------------------------------------------------------------------
describe('buildCommunicationCategoryKey', () => {
  it('returns empty string for empty input', () => {
    expect(buildCommunicationCategoryKey('')).toBe('');
    expect(buildCommunicationCategoryKey('   ')).toBe('');
  });

  it('lowercases a single word', () => {
    expect(buildCommunicationCategoryKey('Error')).toBe('error');
    expect(buildCommunicationCategoryKey('WELCOME')).toBe('welcome');
  });

  it('camelCases two words', () => {
    expect(buildCommunicationCategoryKey('Special Invitation')).toBe('specialInvitation');
    expect(buildCommunicationCategoryKey('special invitation')).toBe('specialInvitation');
  });

  it('camelCases three words', () => {
    expect(buildCommunicationCategoryKey('after purchase access')).toBe('afterPurchaseAccess');
  });

  it('handles word with trailing number', () => {
    expect(buildCommunicationCategoryKey('week 1')).toBe('week1');
    expect(buildCommunicationCategoryKey('semiotics 2')).toBe('semiotics2');
  });

  it('strips special characters from words', () => {
    expect(buildCommunicationCategoryKey('hello-world')).toBe('helloworld');
    expect(buildCommunicationCategoryKey('foo_bar')).toBe('foobar');
  });

  it('handles extra whitespace between words', () => {
    expect(buildCommunicationCategoryKey('  special   invitation  ')).toBe('specialInvitation');
  });

  it('handles non-string input gracefully', () => {
    expect(buildCommunicationCategoryKey(null)).toBe('');
    expect(buildCommunicationCategoryKey(undefined)).toBe('');
  });

  it('splits camelCase input into words before converting', () => {
    expect(buildCommunicationCategoryKey('testingNowAllAtOnce')).toBe('testingNowAllAtOnce');
    expect(buildCommunicationCategoryKey('specialInvitation')).toBe('specialInvitation');
  });
});

// ---------------------------------------------------------------------------
// buildHistoryCourseOptions
// ---------------------------------------------------------------------------
const {
  buildHistoryCourseOptions,
  buildCommunicationTrackingHistoryTrendData,
  buildCommunicationTrackingHistoryCategoryTotals,
  buildCommunicationTrackingHistoryCourseTotals,
  buildCommunicationTrackingHistoryHeatmapData
} = AudienceMessaging;

describe('buildHistoryCourseOptions', () => {
  it('returns empty array for empty input', () => {
    expect(buildHistoryCourseOptions([])).toEqual([]);
  });

  it('returns empty array for non-array input', () => {
    expect(buildHistoryCourseOptions(null)).toEqual([]);
  });

  it('groups courses by year extracted from StartDate', () => {
    const courses = [
      { CourseCodeId: 'COURSE_A', CourseDetails: { course: 'Course A' }, StartDate: '2025-01-01' },
      { CourseCodeId: 'COURSE_B', CourseDetails: { course: 'Course B' }, StartDate: '2026-03-01' }
    ];
    const options = buildHistoryCourseOptions(courses);
    expect(options.map(g => g.label)).toEqual(['2026', '2025']);
    expect(options[0].options[0].value).toBe('COURSE_B');
    expect(options[1].options[0].value).toBe('COURSE_A');
  });

  it('extracts year from courseCodeId when no date available', () => {
    const courses = [{ CourseCodeId: 'WORK_AND_JOBS_JULY_2024_COU', CourseDetails: { course: 'Work' } }];
    const [group] = buildHistoryCourseOptions(courses);
    expect(group.label).toBe('2024');
  });

  it('includes label with course name and courseCodeId', () => {
    const courses = [{ CourseCodeId: 'MY_COURSE', CourseDetails: { course: 'My Course' }, StartDate: '2026-01-01' }];
    const [[group]] = [buildHistoryCourseOptions(courses)];
    expect(group.options[0].label).toBe('My Course — MY_COURSE');
  });

  it('skips courses with no CourseCodeId', () => {
    const courses = [{ CourseDetails: { course: 'No Code' }, StartDate: '2026-01-01' }];
    expect(buildHistoryCourseOptions(courses)).toEqual([]);
  });

  it('uses CourseCodeId as label when no course name available', () => {
    const courses = [{ CourseCodeId: 'BARE_CODE', StartDate: '2025-06-01' }];
    const [group] = buildHistoryCourseOptions(courses);
    expect(group.options[0].label).toBe('BARE_CODE — BARE_CODE');
  });
});

// ---------------------------------------------------------------------------
// buildCommunicationTrackingHistoryTrendData
// ---------------------------------------------------------------------------
describe('buildCommunicationTrackingHistoryTrendData', () => {
  it('returns empty array for empty input', () => {
    expect(buildCommunicationTrackingHistoryTrendData([])).toEqual([]);
  });

  it('returns empty array for non-array input', () => {
    expect(buildCommunicationTrackingHistoryTrendData(null)).toEqual([]);
  });

  it('groups by date and categoryName', () => {
    const rows = [
      { sentAt: '2026-01-10T12:00:00', categoryName: 'welcome' },
      { sentAt: '2026-01-10T14:00:00', categoryName: 'welcome' },
      { sentAt: '2026-01-10T10:00:00', categoryName: 'birthday' }
    ];
    const result = buildCommunicationTrackingHistoryTrendData(rows);
    const welcome = result.find(r => r.categoryName === 'welcome');
    const birthday = result.find(r => r.categoryName === 'birthday');
    expect(welcome).toEqual({ date: '2026-01-10', count: 2, categoryName: 'welcome' });
    expect(birthday).toEqual({ date: '2026-01-10', count: 1, categoryName: 'birthday' });
  });

  it('skips rows with no sentAt', () => {
    const rows = [{ categoryName: 'welcome' }, { sentAt: '2026-02-01', categoryName: 'na' }];
    const result = buildCommunicationTrackingHistoryTrendData(rows);
    expect(result).toHaveLength(1);
    expect(result[0].date).toBe('2026-02-01');
  });

  it('sorts results by date ascending', () => {
    const rows = [
      { sentAt: '2026-03-01', categoryName: 'welcome' },
      { sentAt: '2026-01-01', categoryName: 'welcome' }
    ];
    const result = buildCommunicationTrackingHistoryTrendData(rows);
    expect(result[0].date).toBe('2026-01-01');
    expect(result[1].date).toBe('2026-03-01');
  });

  it('uses em-dash as categoryName when categoryName is absent', () => {
    const rows = [{ sentAt: '2026-01-05' }];
    const [entry] = buildCommunicationTrackingHistoryTrendData(rows);
    expect(entry.categoryName).toBe('—');
  });
});

// ---------------------------------------------------------------------------
// buildCommunicationTrackingHistoryCategoryTotals
// ---------------------------------------------------------------------------
describe('buildCommunicationTrackingHistoryCategoryTotals', () => {
  it('returns empty array for empty input', () => {
    expect(buildCommunicationTrackingHistoryCategoryTotals([])).toEqual([]);
  });

  it('returns empty array for non-array input', () => {
    expect(buildCommunicationTrackingHistoryCategoryTotals(null)).toEqual([]);
  });

  it('counts by categoryName', () => {
    const rows = [
      { categoryName: 'welcome' },
      { categoryName: 'welcome' },
      { categoryName: 'birthday' }
    ];
    const result = buildCommunicationTrackingHistoryCategoryTotals(rows);
    const welcome = result.find(r => r.categoryName === 'welcome');
    const birthday = result.find(r => r.categoryName === 'birthday');
    expect(welcome.count).toBe(2);
    expect(birthday.count).toBe(1);
  });

  it('sorts by count descending', () => {
    const rows = [
      { categoryName: 'a' },
      { categoryName: 'b' },
      { categoryName: 'b' },
      { categoryName: 'b' }
    ];
    const [first, second] = buildCommunicationTrackingHistoryCategoryTotals(rows);
    expect(first.categoryName).toBe('b');
    expect(first.count).toBe(3);
    expect(second.categoryName).toBe('a');
    expect(second.count).toBe(1);
  });

  it('uses em-dash for rows with no categoryName', () => {
    const rows = [{ sentAt: '2026-01-01' }];
    const [entry] = buildCommunicationTrackingHistoryCategoryTotals(rows);
    expect(entry.categoryName).toBe('—');
  });
});

// ---------------------------------------------------------------------------
// buildCommunicationTrackingHistoryCourseTotals
// ---------------------------------------------------------------------------
describe('buildCommunicationTrackingHistoryCourseTotals', () => {
  it('returns empty array for empty input', () => {
    expect(buildCommunicationTrackingHistoryCourseTotals([])).toEqual([]);
  });

  it('returns empty array for non-array input', () => {
    expect(buildCommunicationTrackingHistoryCourseTotals(null)).toEqual([]);
  });

  it('counts by courseCodeId', () => {
    const rows = [
      { courseCodeId: 'COURSE_A' },
      { courseCodeId: 'COURSE_A' },
      { courseCodeId: 'COURSE_B' }
    ];
    const result = buildCommunicationTrackingHistoryCourseTotals(rows);
    const a = result.find(r => r.courseCodeId === 'COURSE_A');
    const b = result.find(r => r.courseCodeId === 'COURSE_B');
    expect(a.count).toBe(2);
    expect(b.count).toBe(1);
  });

  it('sorts by count descending', () => {
    const rows = [
      { courseCodeId: 'C1' },
      { courseCodeId: 'C2' },
      { courseCodeId: 'C2' },
      { courseCodeId: 'C2' }
    ];
    const [first, second] = buildCommunicationTrackingHistoryCourseTotals(rows);
    expect(first.courseCodeId).toBe('C2');
    expect(first.count).toBe(3);
    expect(second.courseCodeId).toBe('C1');
    expect(second.count).toBe(1);
  });

  it('skips rows with no courseCodeId', () => {
    const rows = [
      { courseCodeId: 'C1' },
      { categoryName: 'welcome' },
      { courseCodeId: null }
    ];
    const result = buildCommunicationTrackingHistoryCourseTotals(rows);
    expect(result).toHaveLength(1);
    expect(result[0].courseCodeId).toBe('C1');
  });
});

// ---------------------------------------------------------------------------
// buildCommunicationTrackingHistoryHeatmapData
// ---------------------------------------------------------------------------
describe('buildCommunicationTrackingHistoryHeatmapData', () => {
  it('returns empty array for empty input', () => {
    expect(buildCommunicationTrackingHistoryHeatmapData([])).toEqual([]);
  });

  it('returns empty array for non-array input', () => {
    expect(buildCommunicationTrackingHistoryHeatmapData(null)).toEqual([]);
  });

  it('groups by courseCodeId and categoryName', () => {
    const rows = [
      { courseCodeId: 'C1', categoryName: 'Birthday' },
      { courseCodeId: 'C1', categoryName: 'Birthday' },
      { courseCodeId: 'C1', categoryName: 'Welcome' },
      { courseCodeId: 'C2', categoryName: 'Birthday' },
    ];
    const result = buildCommunicationTrackingHistoryHeatmapData(rows);
    expect(result).toHaveLength(3);
    const c1Birthday = result.find(r => r.course === 'C1' && r.category === 'Birthday');
    const c1Welcome = result.find(r => r.course === 'C1' && r.category === 'Welcome');
    const c2Birthday = result.find(r => r.course === 'C2' && r.category === 'Birthday');
    expect(c1Birthday.count).toBe(2);
    expect(c1Welcome.count).toBe(1);
    expect(c2Birthday.count).toBe(1);
  });

  it('skips rows missing courseCodeId or categoryName', () => {
    const rows = [
      { courseCodeId: 'C1', categoryName: 'Birthday' },
      { courseCodeId: 'C1' },
      { categoryName: 'Birthday' },
      { courseCodeId: null, categoryName: 'Birthday' },
    ];
    const result = buildCommunicationTrackingHistoryHeatmapData(rows);
    expect(result).toHaveLength(1);
    expect(result[0].course).toBe('C1');
    expect(result[0].category).toBe('Birthday');
    expect(result[0].count).toBe(1);
  });

  it('returns { course, category, count } shape', () => {
    const rows = [{ courseCodeId: 'COURSE_A', categoryName: 'Welcome' }];
    const [entry] = buildCommunicationTrackingHistoryHeatmapData(rows);
    expect(entry).toEqual({ course: 'COURSE_A', category: 'Welcome', count: 1 });
  });
});
