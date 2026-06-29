import AdminTools from '../AdminTools';

const {
  generateCourseCodeId,
  buildCourseUpsertPayload,
  buildEnrollExistingContactToCoursePayload,
  buildUpsertUserRoleCoursePayload,
  buildUpsertUserRoleGlobalPayload,
  extractUploadedCoverImageUrl,
  isValidHttpUrl,
} = AdminTools;

// ---------------------------------------------------------------------------
// generateCourseCodeId
// ---------------------------------------------------------------------------
describe('generateCourseCodeId', () => {
  it('produces UPPER_SNAKE_COURSE_NAME_MMM_YYYY_COURSE_01 for first edition', () => {
    const result = generateCourseCodeId('Supermarket', new Date('2024-09-15'), []);
    expect(result).toBe('SUPERMARKET_SEP_2024_COURSE_01');
  });

  it('increments edition counter globally across all existing IDs regardless of month', () => {
    const existing = ['SUPERMARKET_JAN_2024_COURSE_01'];
    const result = generateCourseCodeId('Supermarket', new Date('2024-09-15'), existing);
    expect(result).toBe('SUPERMARKET_SEP_2024_COURSE_02');
  });

  it('pads edition number to two digits', () => {
    const existing = Array.from({ length: 9 }, (_, i) =>
      `SUPERMARKET_JAN_2024_COURSE_0${i + 1}`
    );
    const result = generateCourseCodeId('Supermarket', new Date('2024-09-15'), existing);
    expect(result).toBe('SUPERMARKET_SEP_2024_COURSE_10');
  });

  it('converts multi-word name to UPPER_SNAKE_CASE', () => {
    // Use local date constructor (year, month-index, day) to avoid UTC-boundary timezone issues
    const result = generateCourseCodeId('Household Items', new Date(2024, 0, 15), []);
    expect(result).toBe('HOUSEHOLD_ITEMS_JAN_2024_COURSE_01');
  });

  it('strips special characters from name', () => {
    const result = generateCourseCodeId('Household Items - Part 1', new Date(2024, 0, 15), []);
    expect(result).toMatch(/^HOUSEHOLD_ITEMS_PART_1_JAN_2024_COURSE_01$/);
  });

  it('returns empty string when courseName is falsy', () => {
    expect(generateCourseCodeId('', new Date(), [])).toBe('');
    expect(generateCourseCodeId(null, new Date(), [])).toBe('');
  });

  it('treats existingIds as optional (defaults to empty)', () => {
    const result = generateCourseCodeId('Supermarket', new Date('2024-09-15'));
    expect(result).toBe('SUPERMARKET_SEP_2024_COURSE_01');
  });

  it('only counts IDs that match the same course name slug', () => {
    const existing = ['OTHER_COURSE_JAN_2024_COURSE_01', 'OTHER_COURSE_JAN_2024_COURSE_02'];
    const result = generateCourseCodeId('Supermarket', new Date('2024-09-15'), existing);
    expect(result).toBe('SUPERMARKET_SEP_2024_COURSE_01');
  });
});

// ---------------------------------------------------------------------------
// isValidHttpUrl
// ---------------------------------------------------------------------------
describe('isValidHttpUrl', () => {
  it.each([
    ['https://example.com', true],
    ['http://example.com', true],
    ['https://sub.domain.com/path?q=1', true],
  ])('accepts valid URL "%s"', (url, expected) => {
    expect(isValidHttpUrl(url)).toBe(expected);
  });

  it.each([
    ['ftp://example.com'],
    ['file:///etc/hosts'],
    ['not-a-url'],
    [''],
    [null],
    [undefined],
    [123],
  ])('rejects "%s"', (value) => {
    expect(isValidHttpUrl(value)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// extractUploadedCoverImageUrl
// ---------------------------------------------------------------------------
describe('extractUploadedCoverImageUrl', () => {
  it('returns null for falsy input', () => {
    expect(extractUploadedCoverImageUrl(null)).toBeNull();
    expect(extractUploadedCoverImageUrl(undefined)).toBeNull();
    expect(extractUploadedCoverImageUrl('')).toBeNull();
  });

  it('returns a string URL directly', () => {
    expect(extractUploadedCoverImageUrl('https://cdn.example.com/img.jpg')).toBe(
      'https://cdn.example.com/img.jpg'
    );
  });

  it.each([
    [{ url: 'https://a.com' }, 'https://a.com'],
    [{ Url: 'https://b.com' }, 'https://b.com'],
    [{ imageUrl: 'https://c.com' }, 'https://c.com'],
    [{ ImageUrl: 'https://d.com' }, 'https://d.com'],
    [{ publicUrl: 'https://e.com' }, 'https://e.com'],
    [{ PublicUrl: 'https://f.com' }, 'https://f.com'],
  ])('extracts URL from object property %p', (obj, expected) => {
    expect(extractUploadedCoverImageUrl(obj)).toBe(expected);
  });

  it('returns null when object has no recognised URL property', () => {
    expect(extractUploadedCoverImageUrl({ other: 'https://x.com' })).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// buildCourseUpsertPayload
// ---------------------------------------------------------------------------
describe('buildCourseUpsertPayload', () => {
  it('always returns an array', () => {
    expect(Array.isArray(buildCourseUpsertPayload({}))).toBe(true);
  });

  it('wraps payload in an array of length 1', () => {
    const result = buildCourseUpsertPayload({ CourseCodeId: 'TEST_JAN_2024_COURSE_01' });
    expect(result).toHaveLength(1);
  });

  it('includes supplied CourseCodeId normalised to camelCase courseCodeId', () => {
    const result = buildCourseUpsertPayload({ CourseCodeId: 'TEST_JAN_2024_COURSE_01' });
    expect(result[0]).toMatchObject({ courseCodeId: 'TEST_JAN_2024_COURSE_01' });
  });
});

// ---------------------------------------------------------------------------
// buildEnrollExistingContactToCoursePayload
// ---------------------------------------------------------------------------
describe('buildEnrollExistingContactToCoursePayload', () => {
  const base = {
    contactInternalId: 'c-1',
    emailId: 'user@test.com',
    courseCodeId: 'SUP_SEP_2024_COURSE_01',
    roleId: 'titulino_student',
  };

  it('returns an array of length 1', () => {
    expect(buildEnrollExistingContactToCoursePayload(base)).toHaveLength(1);
  });

  it('defaults userRoleId to roleId when not provided', () => {
    const result = buildEnrollExistingContactToCoursePayload(base);
    expect(result[0].userRoleId).toBe('titulino_student');
  });

  it('uses explicit userRoleId when provided', () => {
    const result = buildEnrollExistingContactToCoursePayload({
      ...base,
      userRoleId: 'titulino_administrator',
    });
    expect(result[0].userRoleId).toBe('titulino_administrator');
  });

  it('defaults userRoleId to "titulino_user" when neither roleId nor userRoleId are provided', () => {
    const result = buildEnrollExistingContactToCoursePayload({
      contactInternalId: 'c-1',
      courseCodeId: 'X',
    });
    expect(result[0].userRoleId).toBe('titulino_user');
  });
});

// ---------------------------------------------------------------------------
// buildUpsertUserRoleGlobalPayload
// ---------------------------------------------------------------------------
describe('buildUpsertUserRoleGlobalPayload', () => {
  it('returns an array of length 1', () => {
    const result = buildUpsertUserRoleGlobalPayload({ contactInternalId: 'c-1', roleId: 'titulino_administrator' });
    expect(result).toHaveLength(1);
  });

  it('defaults isActive to true', () => {
    const result = buildUpsertUserRoleGlobalPayload({ contactInternalId: 'c-1', roleId: 'r' });
    expect(result[0].isActive).toBe(true);
  });

  it('respects explicit isActive false', () => {
    const result = buildUpsertUserRoleGlobalPayload({ contactInternalId: 'c-1', roleId: 'r', isActive: false });
    expect(result[0].isActive).toBe(false);
  });
});
