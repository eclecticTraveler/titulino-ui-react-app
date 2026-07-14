import React, { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Navigate, useParams } from "react-router-dom";
import { RouteElement } from "utils/routerCompat";
import { connect } from "react-redux";
import Loading from '../../components/shared-components/Loading';
import { APP_PREFIX_PATH } from '../../configs/AppConfig';
import { env } from '../../configs/EnvironmentConfig';
import { getLocalizedConfig } from '../../configs/CourseMainNavigationConfig/Submenus/ConfigureNavigationLocalization';
import TermsConditionsCancelSubscription from "components/admin-components/ModalMessages/TermsConditionsCancelSubscription";
import PrivacyPolicy  from "components/admin-components/ModalMessages/PrivacyPolicy";
import { retry } from '../../helpers/index';
import { onContentLanguageChange } from 'redux/actions/Theme';

// Switches contentLanguage to match the URL prefix when a cross-language course URL is visited.
// Renders a loading spinner while Redux updates; AppViews re-renders with matching routes immediately after.
const VALID_CONTENT_LANGS = ['en', 'es'];
const CourseLanguageGate = connect(
  ({ theme }) => ({ contentLanguage: theme.contentLanguage }),
  { onContentLanguageChange }
)(function CourseLanguageGate({ contentLanguage, onContentLanguageChange }) {
  const { urlLang } = useParams();
  useEffect(() => {
    if (urlLang && VALID_CONTENT_LANGS.includes(urlLang) && urlLang !== contentLanguage) {
      onContentLanguageChange(urlLang);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlLang]);
  return <Loading cover="content" />;
});

// Lazy-loaded route components (hoisted to module scope for stable references)
const SharedCourseLevel = lazy(() => retry(() => import(`../shared-views/course-level`)));
const SharedCourseLevelResources = lazy(() => retry(() => import(`../shared-views/course-level/resources`)));
const SharedCourseLevelBook = lazy(() => retry(() => import(`../shared-views/course-level/chapter/book`)));
const SharedCourseLevelClass = lazy(() => retry(() => import(`../shared-views/course-level/chapter/class`)));
const SharedCourseLevelPractice = lazy(() => retry(() => import(`../shared-views/course-level/chapter/practice`)));
const Enrollment = lazy(() => import(`./user/enrollment`));
const RedirectSignup = lazy(() => import(`./user/redirect-signup`));
const CourseSelectionView = lazy(() => retry(() => import(`./course-selection`)));
const SessionRetrieval = lazy(() => import(`./user/session-retrieval`));
const ImpersonationLaunch = lazy(() => import(`./user/impersonation`));
const LoginView = lazy(() => import(`./user/login`));
const LogoutView = lazy(() => import(`./user/logout`));
const LandingPage = lazy(() => import(`../landing`));

export const AppViews = (props) => {
	const { contentLanguage } = props;

	if (!contentLanguage) {
		return <Loading cover="content" />;
	  }

	const cfg = getLocalizedConfig(contentLanguage);

	return (
		<>
	<Suspense fallback={<Loading cover="content"/>}>
		<Routes>
			<Route path={`${contentLanguage}/:${cfg?.level}`} element={<RouteElement component={SharedCourseLevel} />} />
			<Route path={`${contentLanguage}/:${cfg?.level}/${cfg?.resources}/:${cfg?.modality}`} element={<RouteElement component={SharedCourseLevelResources} />} />
			<Route path={`${contentLanguage}/:${cfg?.level}/:${cfg?.chapter}/${cfg?.book}`} element={<RouteElement component={SharedCourseLevelBook} />} />
			<Route path={`${contentLanguage}/:${cfg?.level}/:${cfg?.chapter}/${cfg?.class}`} element={<RouteElement component={SharedCourseLevelClass} />} />
			<Route path={`${contentLanguage}/:${cfg?.level}/:${cfg?.chapter}/:${cfg?.modality}`} element={<RouteElement component={SharedCourseLevelPractice} />} />
			<Route path={`terms-conditions`} element={<TermsConditionsCancelSubscription />} />
			<Route path={`private-policy`} element={<PrivacyPolicy />} />
			<Route path={`enroll`} element={<RouteElement component={Enrollment} />} />
			<Route path={`signup`} element={<RouteElement component={RedirectSignup} />} />
			<Route path={`switch-course`} element={<RouteElement component={CourseSelectionView} />} />
			<Route path={`session-retrieval`} element={<RouteElement component={SessionRetrieval} />} />
			<Route path={`impersonate`} element={<RouteElement component={ImpersonationLaunch} />} />
			<Route path={`login`} element={<RouteElement component={LoginView} />} />
			<Route path={`logout`} element={<RouteElement component={LogoutView} />} />
			<Route path={`landing`} element={<RouteElement component={LandingPage} />} />
			{/* Catches cross-language course URLs (e.g. /lrn/en/... when contentLanguage='es') and auto-switches */}
			<Route path=":urlLang/:urlLevel" element={<CourseLanguageGate />} />
			<Route path="" element={<Navigate to={env.IS_ENROLLMENT_LANDING_ON ? `${APP_PREFIX_PATH}/landing` : `${APP_PREFIX_PATH}/${contentLanguage}/${cfg?.level}-${cfg?.defaultLanding}`} replace />} />
		</Routes>
	</Suspense>
	</>
	)
}

// function mapDispatchToProps(dispatch){
// 	return bindActionCreators({
//     onCurrentRouteInfo: onCurrentRouteInfo
// 	}, dispatch)
// }

const mapStateToProps = ({ theme }) => {
	const { contentLanguage } =  theme;
	return { contentLanguage }
};

export default React.memo(connect(mapStateToProps)(AppViews));

// export default connect(mapStateToProps, mapDispatchToProps)(React.memo(AppViews));
