import { useCallback } from 'react';
import { isJwtExpired } from 'lob/TokenExpiry';

// Call ensureValidSession() right before firing an authenticated request.
// Returns false (and reactively clears the session, re-showing the year-of-birth
// prompt) if the token is already dead — the caller should bail out instead of
// making a doomed call. Takes user/onSessionTokenExpired as arguments (matching
// this codebase's connect()-only convention) rather than reading the store itself.
export default function useSessionTokenExpiryGuard(user, onSessionTokenExpired) {
  return useCallback(() => {
    if (isJwtExpired(user?.innerToken)) {
      onSessionTokenExpired(user?.emailId);
      return false;
    }
    return true;
  }, [user?.innerToken, user?.emailId, onSessionTokenExpired]);
}
