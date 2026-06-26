import DashboardLayout from '../DashboardLayout';

const { getDashboardCardOrderCacheKey, normalizeDashboardCardOrder } = DashboardLayout;

// ---------------------------------------------------------------------------
// getDashboardCardOrderCacheKey
// ---------------------------------------------------------------------------
describe('getDashboardCardOrderCacheKey', () => {
  it('returns a string', () => {
    expect(typeof getDashboardCardOrderCacheKey('main', 'user@test.com', 'COURSE_01')).toBe('string');
  });

  it('has a DashboardCardOrder_ prefix', () => {
    const key = getDashboardCardOrderCacheKey('main', 'user@test.com', 'COURSE_01');
    expect(key).toMatch(/^DashboardCardOrder_/);
  });

  it('lowercases each of the three input segments after the prefix', () => {
    const key = getDashboardCardOrderCacheKey('MAIN', 'USER@TEST.COM', 'COURSE_01');
    // split off prefix, check each segment is lowercase-encoded
    const parts = key.replace('DashboardCardOrder_', '').split('_');
    parts.forEach(part => expect(part).toBe(part.toLowerCase()));
  });

  it('falls back to "dashboard" when dashboardKey is falsy', () => {
    const key = getDashboardCardOrderCacheKey(null, 'user@test.com', 'COURSE_01');
    expect(key).toContain('dashboard');
  });

  it('falls back to "anonymous" when emailId is falsy', () => {
    const key = getDashboardCardOrderCacheKey('main', null, 'COURSE_01');
    expect(key).toContain('anonymous');
  });

  it('falls back to "global" when courseCodeId is falsy', () => {
    const key = getDashboardCardOrderCacheKey('main', 'user@test.com', null);
    expect(key).toContain('global');
  });

  it('produces the same key for the same inputs', () => {
    const a = getDashboardCardOrderCacheKey('main', 'user@test.com', 'COURSE_01');
    const b = getDashboardCardOrderCacheKey('main', 'user@test.com', 'COURSE_01');
    expect(a).toBe(b);
  });

  it('produces different keys for different emails', () => {
    const a = getDashboardCardOrderCacheKey('main', 'alice@test.com', 'COURSE_01');
    const b = getDashboardCardOrderCacheKey('main', 'bob@test.com', 'COURSE_01');
    expect(a).not.toBe(b);
  });
});

// ---------------------------------------------------------------------------
// normalizeDashboardCardOrder
// ---------------------------------------------------------------------------
describe('normalizeDashboardCardOrder', () => {
  const defaultOrder = ['overview', 'progress', 'activity', 'leaderboard'];

  it('returns the full default order when savedOrder is empty', () => {
    expect(normalizeDashboardCardOrder([], defaultOrder)).toEqual(defaultOrder);
  });

  it('returns the full default order when savedOrder is undefined', () => {
    expect(normalizeDashboardCardOrder(undefined, defaultOrder)).toEqual(defaultOrder);
  });

  it('preserves a saved order that matches the default exactly', () => {
    expect(normalizeDashboardCardOrder([...defaultOrder], defaultOrder)).toEqual(defaultOrder);
  });

  it('preserves a reordered saved list and appends missing entries', () => {
    const saved = ['leaderboard', 'overview'];
    const result = normalizeDashboardCardOrder(saved, defaultOrder);
    expect(result[0]).toBe('leaderboard');
    expect(result[1]).toBe('overview');
    expect(result).toContain('progress');
    expect(result).toContain('activity');
  });

  it('drops saved keys that are not in defaultOrder', () => {
    const saved = ['overview', 'nonexistent_card'];
    const result = normalizeDashboardCardOrder(saved, defaultOrder);
    expect(result).not.toContain('nonexistent_card');
  });

  it('deduplicates repeated keys in savedOrder', () => {
    const saved = ['overview', 'overview', 'progress'];
    const result = normalizeDashboardCardOrder(saved, defaultOrder);
    const overviewCount = result.filter(k => k === 'overview').length;
    expect(overviewCount).toBe(1);
  });

  it('returns defaultOrder when savedOrder is not an array', () => {
    expect(normalizeDashboardCardOrder('overview', defaultOrder)).toEqual(defaultOrder);
    expect(normalizeDashboardCardOrder(null, defaultOrder)).toEqual(defaultOrder);
  });

  it('returns empty array when both inputs are empty', () => {
    expect(normalizeDashboardCardOrder([], [])).toEqual([]);
  });
});
