import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { APP_PREFIX_PATH, AUTH_PREFIX_PATH } from 'configs/AppConfig';
import EmailYearSearchForm from 'components/layout-components/EmailYearSearchForm';

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

export const AuthenticatedProfileGate = ({ children, token, user }) => {
  const { pathname, search } = useLocation();
  const shouldRequestProfile =
    token &&
    user?.emailId &&
    !user?.yearOfBirth &&
    !user?.impersonation?.isImpersonating &&
    !shouldBypassProfileGate(pathname);

  useEffect(() => {
    if (!shouldRequestProfile) return;

    localStorage.setItem('postLoginRedirect', `${pathname}${search || ''}`);
  }, [pathname, search, shouldRequestProfile]);

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

export default connect(mapStateToProps)(AuthenticatedProfileGate);
