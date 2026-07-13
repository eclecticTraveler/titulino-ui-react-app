import React from 'react';
import { connect } from 'react-redux';
import LandingUnauthenticated from './EnrollmentUnauthPanel';
import LandingAuthenticatedHub from './LandingAuthenticatedHub';

const LandingPage = ({ token }) => {
  if (token) {
    return <LandingAuthenticatedHub />;
  }
  return <LandingUnauthenticated />;
};

const mapStateToProps = ({ auth }) => ({ token: auth.token });
export default connect(mapStateToProps)(LandingPage);
