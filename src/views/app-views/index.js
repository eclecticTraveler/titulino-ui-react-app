import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { RouteElement } from "utils/routerCompat";
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import Loading from '../../components/shared-components/Loading';
import { APP_PREFIX_PATH, DEFAULT_LANDING_COURSE } from '../../configs/AppConfig';
import { onCurrentRouteInfo } from '../../redux/actions/Lrn';
import { getLocalizedConfig } from '../../configs/CourseMainNavigationConfig/Submenus/ConfigureNavigationLocalization';
import TermsConditionsCancelSubscription from "components/admin-components/ModalMessages/TermsConditionsCancelSubscription";
import PrivacyPolicy  from "components/admin-components/ModalMessages/PrivacyPolicy";
import { retry } from '../../helpers/index';
import { env } from 'configs/EnvironmentConfig';

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
const LoginView = lazy(() => import(`./user/login`));
const LogoutView = lazy(() => import(`./user/logout`));

export const AppViews = (props) => {
	const { course } = props;

	if (!course) {
		return <Loading cover="content" />;
	  }

	const cfg = getLocalizedConfig(course);

	return (
		<>
	<Suspense fallback={<Loading cover="content"/>}>
		<Routes>
			<Route path={`${course}/:${cfg?.level}`} element={<RouteElement component={SharedCourseLevel} />} />
			<Route path={`${course}/:${cfg?.level}/${cfg?.resources}/:${cfg?.modality}`} element={<RouteElement component={SharedCourseLevelResources} />} />
			<Route path={`${course}/:${cfg?.level}/:${cfg?.chapter}/${cfg?.book}`} element={<RouteElement component={SharedCourseLevelBook} />} />
			<Route path={`${course}/:${cfg?.level}/:${cfg?.chapter}/${cfg?.class}`} element={<RouteElement component={SharedCourseLevelClass} />} />
			<Route path={`${course}/:${cfg?.level}/:${cfg?.chapter}/:${cfg?.modality}`} element={<RouteElement component={SharedCourseLevelPractice} />} />
			<Route path={`terms-conditions`} element={<TermsConditionsCancelSubscription />} />
			<Route path={`private-policy`} element={<PrivacyPolicy />} />
			<Route path={`enroll`} element={<RouteElement component={Enrollment} />} />
			<Route path={`signup`} element={<RouteElement component={RedirectSignup} />} />
			<Route path={`switch-course`} element={<RouteElement component={CourseSelectionView} />} />
			<Route path={`session-retrieval`} element={<RouteElement component={SessionRetrieval} />} />
			<Route path={`login`} element={<RouteElement component={LoginView} />} />
			<Route path={`logout`} element={<RouteElement component={LogoutView} />} />
			<Route path="" element={<Navigate to={`${APP_PREFIX_PATH}/${course}/${cfg?.level}-${DEFAULT_LANDING_COURSE}`} replace />} />
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
	const { course } =  theme;
	return { course }
};

export default React.memo(connect(mapStateToProps)(AppViews));

// export default connect(mapStateToProps, mapDispatchToProps)(React.memo(AppViews));