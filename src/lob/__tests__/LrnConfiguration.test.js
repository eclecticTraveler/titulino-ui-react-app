import LrnConfiguration from '../LrnConfiguration';

const {
  getCertificationDisplayKey,
  getCourseThemeByCourseCodeId,
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
