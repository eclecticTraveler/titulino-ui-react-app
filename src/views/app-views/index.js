import React, { lazy, Suspense } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import Loading from '../../components/shared-components/Loading';
import { APP_PREFIX_PATH, DEFAULT_LANDING_COURSE } from '../../configs/AppConfig';
import { onCurrentRouteInfo } from '../../redux/actions/Lrn';
import { getLocalizedConfig } from '../../configs/CourseMainNavigationConfig/Submenus/ConfigureNavigationLocalization';
import TermsConditionsCancelSubscription from "components/admin-components/ModalMessages/TermsConditionsCancelSubscription";
import { retry } from '../../helpers/index';
import { env } from 'configs/EnvironmentConfig';

export const AppViews = (props) => {
	const { course } = props;

	if (!course) {
		return <Loading cover="content" />;
	  }

	return (
		<>
	<Suspense fallback={<Loading cover="content"/>}>
		<Switch>
			<Route exact path={`${APP_PREFIX_PATH}/${course}/:${getLocalizedConfig(course)?.level}`} component={lazy(() => retry(() => import(`./course-level`)))} />
			<Route path={`${APP_PREFIX_PATH}/${course}/:${getLocalizedConfig(course)?.level}/${getLocalizedConfig(course)?.resources}/:${getLocalizedConfig(course)?.modality}`} component={lazy(() => retry(() => import(`./course-level/resources`)))} />
			<Route path={`${APP_PREFIX_PATH}/${course}/:${getLocalizedConfig(course)?.level}/:${getLocalizedConfig(course)?.chapter}/${getLocalizedConfig(course)?.book}`} component={lazy(() => retry(() => import(`./course-level/chapter/book`)))} />
			<Route path={`${APP_PREFIX_PATH}/${course}/:${getLocalizedConfig(course)?.level}/:${getLocalizedConfig(course)?.chapter}/${getLocalizedConfig(course)?.class}`} component={lazy(() => retry(() => import(`./course-level/chapter/class`)))} />
			<Route path={`${APP_PREFIX_PATH}/${course}/:${getLocalizedConfig(course)?.level}/:${getLocalizedConfig(course)?.chapter}/${getLocalizedConfig(course)?.grammarClass}`} component={lazy(() => retry(() => import(`./course-level/chapter/classes`)))} />
			<Route path={`${APP_PREFIX_PATH}/${course}/:${getLocalizedConfig(course)?.level}/:${getLocalizedConfig(course)?.chapter}/${getLocalizedConfig(course)?.speaking}`} component={lazy(() => retry(() => import(`./course-level/chapter/speaking`)))} />
			<Route path={`${APP_PREFIX_PATH}/${course}/:${getLocalizedConfig(course)?.level}/:${getLocalizedConfig(course)?.chapter}/${getLocalizedConfig(course)?.quizletpdf}`} component={lazy(() => retry(() => import(`./course-level/chapter/pdf-render`)))} />		
			<Route path={`${APP_PREFIX_PATH}/${course}/:${getLocalizedConfig(course)?.level}/:${getLocalizedConfig(course)?.chapter}/:${getLocalizedConfig(course)?.modality}`} component={lazy(() => retry(() => import(`./course-level/chapter/practice`)))} />			
			<Route exact path={`${APP_PREFIX_PATH}/terms-conditions`} component={TermsConditionsCancelSubscription} />
			<Route exact path={`${APP_PREFIX_PATH}/enroll`} component={lazy(() => import(`./user/enrollment`))} />
			<Route exact path={`${APP_PREFIX_PATH}/insight`} component={lazy(() => import(`./user/analytics`))} />
			<Route exact path={`${APP_PREFIX_PATH}/switch-course`} component={lazy(() => retry(() => import(`./course-selection`)))} />	
			<Route exact path={`${APP_PREFIX_PATH}/profile/edit-profile`} component={lazy(() => retry(() => import(`./profile/index`)))} />		
			<Route exact path={`${APP_PREFIX_PATH}/session-retrieval`} component={lazy(() => import(`./user/session-retrieval`))} />
			<Route exact path={`${APP_PREFIX_PATH}/logout`} component={lazy(() => import(`./logout`))} />
			{env.IS_SSO_ON && <Route exact path={`${APP_PREFIX_PATH}/login`} component={lazy(() => import(`./user/login`))} />}
			<Route exact path={`${APP_PREFIX_PATH}/signup`} component={lazy(() => import(`./user/redirect-signup`))} />
			{/* // Default to level 1 for any course until they are authorized to save where their progress was and land them there	*/}			
			<Redirect exact from={`${APP_PREFIX_PATH}`} to={`${APP_PREFIX_PATH}/${course}/${getLocalizedConfig(course)?.level}-${DEFAULT_LANDING_COURSE}`} />
		</Switch>
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