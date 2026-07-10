import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useLocation } from 'react-router-dom';
import { APP_PREFIX_PATH, AUTH_PREFIX_PATH } from 'configs/AppConfig';
import EmailYearSearchForm from 'components/layout-components/EmailYearSearchForm';
import { onSessionTokenExpired } from 'redux/actions/Grant';
import { isJwtExpired } from 'lob/TokenExpiry';

const PROFILE_GATE_BYPASS_PATHS = [
  `${APP_PREFIX_PATH}/enroll`,
  `${APP_PREFIX_PATH}/impersonate`,
  `${APP_PREFIX_PATH}/login`,
  `${APP_PREFIX_PATH}/logout`,
  `${APP_PREFIX_PATH}/private-policy`,
  `${APP_PREFIX_PATH}/signup`,
  `${APP_PREFIX_PATH}/terms-conditions`,
  `${AUTH_PREFIX_PATH}/enroll`,
  `${AUTH_PREFIX_PATH}/terms-conditions`,
  `${AUTH_PREFIX_PATH}/login`,
  `${AUTH_PREFIX_PATH}/login-2`,
  `${AUTH_PREFIX_PATH}/register-1`,
  `${AUTH_PREFIX_PATH}/register-2`,
  `${AUTH_PREFIX_PATH}/forgot-password`,
  `${AUTH_PREFIX_PATH}/error-1`,
  `${AUTH_PREFIX_PATH}/error-2`,
];

const shouldBypassProfileGate = (pathname) => (
  PROFILE_GATE_BYPASS_PATHS.some((path) => (
    pathname === path || pathname.startsWith(`${path}/`)
  ))
);

const ENROLL_PATHS = [`${APP_PREFIX_PATH}/enroll`, `${AUTH_PREFIX_PATH}/enroll`];

const isEnrollPath = (pathname) => (
  ENROLL_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))
);

// /enroll is normally bypassed so a genuinely new enrollee (no contactId yet)
// can reach the enrollment form. But a returning, already-known user
// (contactId already resolved) landing there with a dead token should still
// be gated — otherwise they silently get treated like a brand-new signup.
const isGateBypassed = (pathname, user) => (
  isEnrollPath(pathname) ? !user?.contactId : shouldBypassProfileGate(pathname)
);

export const AuthenticatedProfileGate = ({ children, token, user, onSessionTokenExpired }) => {
  const { pathname, search } = useLocation();
  const shouldRequestProfile =
    token &&
    user?.emailId &&
    !user?.yearOfBirth &&
    !user?.impersonation?.isImpersonating &&
    !isGateBypassed(pathname, user);

  const shouldCheckTokenExpiry =
    token &&
    user?.emailId &&
    !!user?.innerToken &&
    !user?.impersonation?.isImpersonating &&
    !isGateBypassed(pathname, user);

  useEffect(() => {
    if (!shouldRequestProfile) return;

    localStorage.setItem('postLoginRedirect', `${pathname}${search || ''}`);
  }, [pathname, search, shouldRequestProfile]);

  // Re-checked on every route change (catches navigating into a view with an
  // already-stale token) and on tab focus/visibility regain (catches leaving
  // the tab open past expiry and coming back) — either path reactively clears
  // the session so `shouldRequestProfile` flips true without a page refresh.
  useEffect(() => {
    if (!shouldCheckTokenExpiry) return undefined;

    const checkTokenExpiry = () => {
      if (document.visibilityState !== 'visible') return;
      if (isJwtExpired(user.innerToken)) {
        onSessionTokenExpired(user.emailId);
      }
    };

    checkTokenExpiry();

    document.addEventListener('visibilitychange', checkTokenExpiry);
    window.addEventListener('focus', checkTokenExpiry);

    return () => {
      document.removeEventListener('visibilitychange', checkTokenExpiry);
      window.removeEventListener('focus', checkTokenExpiry);
    };
  }, [pathname, search, shouldCheckTokenExpiry, user?.innerToken, user?.emailId, onSessionTokenExpired]);

  if (shouldRequestProfile) {
    return (
      <div id="unathenticated-landing-page-margin">
        <EmailYearSearchForm />
      </div>
    );
  }

  return children;
};

const mapStateToProps = ({ auth, grant }) => {
  const { token } = auth;
  const { user } = grant;
  return { token, user };
};

const mapDispatchToProps = (dispatch) => (
  bindActionCreators({ onSessionTokenExpired }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(AuthenticatedProfileGate);
