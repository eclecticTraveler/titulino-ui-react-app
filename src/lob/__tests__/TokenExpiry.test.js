import TokenExpiry from '../TokenExpiry';

const { isJwtExpired } = TokenExpiry;

const buildJwt = (payload) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.signature`;
};

describe('isJwtExpired', () => {
  it('returns false for a token whose exp is in the future', () => {
    const token = buildJwt({ exp: Math.floor(Date.now() / 1000) + 3600 });
    expect(isJwtExpired(token)).toBe(false);
  });

  it('returns true for a token whose exp is in the past', () => {
    const token = buildJwt({ exp: Math.floor(Date.now() / 1000) - 3600 });
    expect(isJwtExpired(token)).toBe(true);
  });

  it('returns true for a malformed token', () => {
    expect(isJwtExpired('not-a-jwt')).toBe(true);
  });

  it('returns true for a token missing an exp claim', () => {
    const token = buildJwt({ sub: 'user@example.com' });
    expect(isJwtExpired(token)).toBe(true);
  });

  it('returns true for null or undefined', () => {
    expect(isJwtExpired(null)).toBe(true);
    expect(isJwtExpired(undefined)).toBe(true);
  });

  it('returns true for an empty string', () => {
    expect(isJwtExpired('')).toBe(true);
  });
});
