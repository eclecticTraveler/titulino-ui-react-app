export const isJwtExpired = (token) => {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload?.exp) return true;
    return Date.now() > payload.exp * 1000;
  } catch (error) {
    return true;
  }
};

const TokenExpiry = {
  isJwtExpired
};

export default TokenExpiry;
