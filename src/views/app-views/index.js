import React, { lazy, Suspense } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import Loading from '../../components/shared-components/Loading';
import { APP_PREFIX_PATH } from '../../configs/AppConfig';
import { onCurrentRouteInfo } from '../../redux/actions/Lrn';
import { getLocalizedConfig } from '../../configs/CourseMainNavigationConfig/Submenus/ConfigureNavigationLocalization';
import { retry } from '../../helpers/index';

export const AppViews = (props) => {
	const { course } = props;
	return (
		<>
	<Suspense fallback={<Loading cover="content"/>}>
		<Switch>
			<Route exact path={`${APP_PREFIX_PATH}/${course}/:${getLocalizedConfig(course)?.level}`} component={lazy(() => retry(() => import(`./course-level`)))} />
			<Route path={`${APP_PREFIX_PATH}/${course}/:${getLocalizedConfig(course)?.level}/:${getLocalizedConfig(course)?.chapter}/${getLocalizedConfig(course)?.class}`} component={lazy(() => retry(() => import(`./course-level/chapter/class`)))} />
			<Route path={`${APP_PREFIX_PATH}/${course}/:${getLocalizedConfig(course)?.level}/:${getLocalizedConfig(course)?.chapter}/:${getLocalizedConfig(course)?.modality}`} component={lazy(() => retry(() => import(`./course-level/chapter/practice`)))} />			
			<Route exact path={`${APP_PREFIX_PATH}/switch-course`} component={lazy(() => retry(() => import(`./course-selection`)))} />	
			<Route exact path={`${APP_PREFIX_PATH}/profile/edit-profile`} component={lazy(() => retry(() => import(`./profile/index`)))} />				
			<Route exact path={`${APP_PREFIX_PATH}/logout`} component={lazy(() => import(`./logout`))} />
			<Route exact path={`${APP_PREFIX_PATH}/login`} component={lazy(() => import(`./login`))} />
			{/* // Default to level 1 for any course until they are authorized to save where their progress was and land them there	*/}
			<Redirect from={`${APP_PREFIX_PATH}`} to={`${APP_PREFIX_PATH}/${course}/${getLocalizedConfig(course)?.level}-1`} />
			<Redirect from={`${APP_PREFIX_PATH}/`} to={`${APP_PREFIX_PATH}/${course}/${getLocalizedConfig(course)?.level}-1`} />
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