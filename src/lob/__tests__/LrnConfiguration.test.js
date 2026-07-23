import LrnConfiguration from '../LrnConfiguration';

const {
  getCertificationDisplayKey,
  getCourseThemeByCourseCodeId,
  getFacilitadorCourseCodeIdsForTheme,
} = LrnConfiguration;

// Registry shape: { themeName: [courseCodeId1, courseCodeId2, ...] }
const registry = {
  supermarket: ['SUP_SEP_2024_COURSE_01', 'SUP_JAN_2025_COURSE_02'],
  household: ['HH_JAN_2024_COURSE_01'],
};

// ---------------------------------------------------------------------------
// getCertificationDisplayKey
// ---------------------------------------------------------------------------
describe('getCertificationDisplayKey', () => {
  it('returns "Golden" for keys containing "gold"', () => {
    expect(getCertificationDisplayKey('gold')).toBe('Golden');
    expect(getCertificationDisplayKey('Gold')).toBe('Golden');
    expect(getCertificationDisplayKey('GoldCertification')).toBe('Golden');
    expect(getCertificationDisplayKey('GOLDEN_CERT')).toBe('Golden');
  });

  it('returns "Participation" for keys containing "silver"', () => {
    expect(getCertificationDisplayKey('silver')).toBe('Participation');
    expect(getCertificationDisplayKey('Silver')).toBe('Participation');
    expect(getCertificationDisplayKey('SilverCertification')).toBe('Participation');
  });

  it('returns "Participation" for keys containing "participation"', () => {
    expect(getCertificationDisplayKey('participation')).toBe('Participation');
    expect(getCertificationDisplayKey('ParticipationCert')).toBe('Participation');
  });

  it('returns the trimmed original for unrecognised keys', () => {
    expect(getCertificationDisplayKey('Bronze')).toBe('Bronze');
    expect(getCertificationDisplayKey('  Custom  ')).toBe('Custom');
  });

  it('returns empty string for empty input', () => {
    expect(getCertificationDisplayKey('')).toBe('');
  });
});

// ---------------------------------------------------------------------------
// getCourseThemeByCourseCodeId
// ---------------------------------------------------------------------------
describe('getCourseThemeByCourseCodeId', () => {
  it('returns the correct theme for a known courseCodeId', () => {
    expect(getCourseThemeByCourseCodeId('SUP_SEP_2024_COURSE_01', registry)).toBe('supermarket');
    expect(getCourseThemeByCourseCodeId('HH_JAN_2024_COURSE_01', registry)).toBe('household');
  });

  it('finds the second code in a theme list', () => {
    expect(getCourseThemeByCourseCodeId('SUP_JAN_2025_COURSE_02', registry)).toBe('supermarket');
  });

  it('is case-insensitive when looking up courseCodeId', () => {
    expect(getCourseThemeByCourseCodeId('sup_sep_2024_course_01', registry)).toBe('supermarket');
  });

  it('returns null for an unknown courseCodeId', () => {
    expect(getCourseThemeByCourseCodeId('UNKNOWN_COURSE_01', registry)).toBeNull();
  });

  it('returns null when registry is empty', () => {
    expect(getCourseThemeByCourseCodeId('SUP_SEP_2024_COURSE_01', {})).toBeNull();
  });

  it('returns null when courseCodeId is falsy', () => {
    expect(getCourseThemeByCourseCodeId('', registry)).toBeNull();
    expect(getCourseThemeByCourseCodeId(null, registry)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// getFacilitadorCourseCodeIdsForTheme
// ---------------------------------------------------------------------------
describe('getFacilitadorCourseCodeIdsForTheme', () => {
  const userCourses = {
    'EC1A-2026': { userRoleIdForTheCourse: 'titulino_facilitator' },
    'EC1B-2026': { userRoleIdForTheCourse: 'titulino_facilitator' },
    'EC2A-2026': { userRoleIdForTheCourse: 'titulino_student' },
  };

  it('returns [] when userCourses is null', () => {
    expect(getFacilitadorCourseCodeIdsForTheme(null, ['EC1A-2026'])).toEqual([]);
  });

  it('returns [] when userCourses is not an object', () => {
    expect(getFacilitadorCourseCodeIdsForTheme('bad', ['EC1A-2026'])).toEqual([]);
  });

  it('returns [] when courseCodeIds is empty', () => {
    expect(getFacilitadorCourseCodeIdsForTheme(userCourses, [])).toEqual([]);
  });

  it('returns [] when courseCodeIds is not an array', () => {
    expect(getFacilitadorCourseCodeIdsForTheme(userCourses, null)).toEqual([]);
  });

  it('returns the single matching facilitator courseCodeId', () => {
    expect(getFacilitadorCourseCodeIdsForTheme(userCourses, ['EC1A-2026', 'EC2A-2026'])).toEqual(['EC1A-2026']);
  });

  it('returns all matching facilitator courseCodeIds when facilitator teaches multiple sections', () => {
    expect(getFacilitadorCourseCodeIdsForTheme(userCourses, ['EC1A-2026', 'EC1B-2026', 'EC2A-2026'])).toEqual(['EC1A-2026', 'EC1B-2026']);
  });

  it('returns [] when no course in the list matches a facilitator role', () => {
    expect(getFacilitadorCourseCodeIdsForTheme(userCourses, ['EC2A-2026'])).toEqual([]);
  });

  it('returns [] when no course in courseCodeIds is found in userCourses at all', () => {
    expect(getFacilitadorCourseCodeIdsForTheme(userCourses, ['UNKNOWN-001'])).toEqual([]);
  });

  it('global access user: returns all courseCodeIds that exist in userCourses regardless of role', () => {
    expect(getFacilitadorCourseCodeIdsForTheme(userCourses, ['EC1A-2026', 'EC2A-2026', 'UNKNOWN-001'], true))
      .toEqual(['EC1A-2026', 'EC2A-2026']);
  });

  it('global access user: returns [] when none of the courseCodeIds exist in userCourses', () => {
    expect(getFacilitadorCourseCodeIdsForTheme(userCourses, ['UNKNOWN-001'], true)).toEqual([]);
  });

  it('is case-insensitive for courseCodeId matching', () => {
    expect(getFacilitadorCourseCodeIdsForTheme(userCourses, ['ec1a-2026', 'ec1b-2026'])).toEqual(['ec1a-2026', 'ec1b-2026']);
  });
});
