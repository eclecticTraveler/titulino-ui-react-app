import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { RouteElement } from "utils/routerCompat";
import Loading from '../../components/shared-components/Loading';
import { AUTH_PREFIX_PATH, APP_PREFIX_PATH, DEFAULT_LANDING_COURSE } from '../../configs/AppConfig'
import { getLocalizedConfig } from '../../configs/CourseMainNavigationConfig/Submenus/ConfigureNavigationLocalization';
import TermsConditionsCancelSubscription from "components/admin-components/ModalMessages/TermsConditionsCancelSubscription";
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import { retry } from '../../helpers/index';
import Login from '../auth-views/authentication/login';

// Lazy-loaded route components (hoisted to module scope for stable references)
const Analytics = lazy(() => import(`./user/analytics`));
const SharedCourseLevel = lazy(() => retry(() => import(`../shared-views/course-level`)));
const SharedCourseLevelResources = lazy(() => retry(() => import(`../shared-views/course-level/resources`)));
const SharedCourseLevelBook = lazy(() => retry(() => import(`../shared-views/course-level/chapter/book`)));
const AuthKnowMe = lazy(() => retry(() => import(`./course-level/chapter/know-me`)));
const SharedCourseLevelClass = lazy(() => retry(() => import(`../shared-views/course-level/chapter/class`)));
const AuthGrammarClass = lazy(() => retry(() => import(`./course-level/chapter/classes`)));
const AuthSpeaking = lazy(() => retry(() => import(`./course-level/chapter/speaking`)));
const AuthPdfRender = lazy(() => retry(() => import(`./course-level/chapter/pdf-render`)));
const SharedCourseLevelPractice = lazy(() => retry(() => import(`../shared-views/course-level/chapter/practice`)));
const ShopWindow = lazy(() => retry(() => import(`./shop-window`)));
const Login2 = lazy(() => import(`./authentication/login-2`));
const Register1 = lazy(() => import(`./authentication/register-1`));
const Register2 = lazy(() => import(`./authentication/register-2`));
const ForgotPassword = lazy(() => import(`./authentication/forgot-password`));
const ErrorPage1 = lazy(() => import(`./errors/error-page-1`));
const ErrorPage2 = lazy(() => import(`./errors/error-page-2`));

export const AuthViews = (props) => {
  const { course, token, user } = props;
  const cfg = getLocalizedConfig(course);
  return (
    <Suspense fallback={<Loading cover="page"/>}>
      <Routes>
        <Route path={`insight`} element={<RouteElement component={Analytics} />} />
        <Route path={`${course}/:${cfg?.level}`} element={<RouteElement component={SharedCourseLevel} />} />
        <Route path={`${course}/:${cfg?.level}/${cfg?.resources}/:${cfg?.modality}`} element={<RouteElement component={SharedCourseLevelResources} />} />
        <Route path={`${course}/:${cfg?.level}/:${cfg?.chapter}/${cfg?.book}`} element={<RouteElement component={SharedCourseLevelBook} />} />
        <Route path={`${course}/:${cfg?.level}/:${cfg?.chapter}/${cfg?.knowMe}`} element={<RouteElement component={AuthKnowMe} />} />
        <Route path={`${course}/:${cfg?.level}/:${cfg?.chapter}/${cfg?.class}`} element={<RouteElement component={SharedCourseLevelClass} />} />
        <Route path={`${course}/:${cfg?.level}/:${cfg?.chapter}/${cfg?.grammarClass}`} element={<RouteElement component={AuthGrammarClass} />} />
        <Route path={`${course}/:${cfg?.level}/:${cfg?.chapter}/${cfg?.speaking}`} element={<RouteElement component={AuthSpeaking} />} />
        <Route path={`${course}/:${cfg?.level}/:${cfg?.chapter}/${cfg?.quizletpdf}`} element={<RouteElement component={AuthPdfRender} />} />
        <Route path={`${course}/:${cfg?.level}/:${cfg?.chapter}/:${cfg?.modality}`} element={<RouteElement component={SharedCourseLevelPractice} />} />
        <Route path={`terms-conditions`} element={<TermsConditionsCancelSubscription />} />
        <Route path={`shopping`} element={<RouteElement component={ShopWindow} />} />
        {/* <Route path={`profile/edit-profile`} element={<RouteElement component={...} />} /> */}
        {/* <Route path={`login`} element={<Login />} /> */}
        <Route path={`login-2`} element={<RouteElement component={Login2} />} />
        <Route path={`register-1`} element={<RouteElement component={Register1} />} />
        <Route path={`register-2`} element={<RouteElement component={Register2} />} />
        <Route path={`forgot-password`} element={<RouteElement component={ForgotPassword} />} />
        <Route path={`error-1`} element={<RouteElement component={ErrorPage1} />} />
        <Route path={`error-2`} element={<RouteElement component={ErrorPage2} />} />
        {/* Authenticated users go to landing course on root /lrn-auth */}
        { token ? 
          <Route path="" element={<Navigate to={`${AUTH_PREFIX_PATH}/${course}/${cfg?.level}-${DEFAULT_LANDING_COURSE}`} replace />} />
          :
          // Unauthenticated go to /lrn
          <Route path="" element={<Navigate to={`${APP_PREFIX_PATH}`} replace />} />
        }

        {/* Catch-all fallback for any unknown /lrn-auth/* paths */}
        <Route path="*" element={<Navigate to={`${APP_PREFIX_PATH}`} replace />} />
        
      </Routes>
    </Suspense>
  )
}

const mapStateToProps = ({ theme, auth, grant }) => {
	const { course } =  theme;
  const { token } = auth;
  const { user } = grant;
	return { course, token, user }
};

export default React.memo(connect(mapStateToProps)(AuthViews));

