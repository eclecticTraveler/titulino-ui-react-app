import React, { lazy, Suspense } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import Loading from '../../components/shared-components/Loading';
import { AUTH_PREFIX_PATH, APP_PREFIX_PATH, DEFAULT_LANDING_COURSE } from '../../configs/AppConfig'
import { getLocalizedConfig } from '../../configs/CourseMainNavigationConfig/Submenus/ConfigureNavigationLocalization';
import TermsConditionsCancelSubscription from "components/admin-components/ModalMessages/TermsConditionsCancelSubscription";
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import { retry } from '../../helpers/index';
import Login from '../auth-views/authentication/login';

export const AuthViews = (props) => {
  const { course, token, user } = props;
  return (
    <Suspense fallback={<Loading cover="page"/>}>
      <Switch>                
        <Route exact path={`${AUTH_PREFIX_PATH}/insight`} component={lazy(() => import(`./user/analytics`))} />
        <Route exact path={`${AUTH_PREFIX_PATH}/${course}/:${getLocalizedConfig(course)?.level}`} component={lazy(() => retry(() => import(`../shared-views/course-level`)))} />
        <Route path={`${AUTH_PREFIX_PATH}/${course}/:${getLocalizedConfig(course)?.level}/${getLocalizedConfig(course)?.resources}/:${getLocalizedConfig(course)?.modality}`} component={lazy(() => retry(() => import(`../shared-views/course-level/resources`)))} />
        <Route path={`${AUTH_PREFIX_PATH}/${course}/:${getLocalizedConfig(course)?.level}/:${getLocalizedConfig(course)?.chapter}/${getLocalizedConfig(course)?.book}`} component={lazy(() => retry(() => import(`../shared-views/course-level/chapter/book`)))} />
        <Route path={`${AUTH_PREFIX_PATH}/${course}/:${getLocalizedConfig(course)?.level}/:${getLocalizedConfig(course)?.chapter}/${getLocalizedConfig(course)?.knowMe}`} component={lazy(() => retry(() => import(`./course-level/chapter/know-me`)))} />
        <Route path={`${AUTH_PREFIX_PATH}/${course}/:${getLocalizedConfig(course)?.level}/:${getLocalizedConfig(course)?.chapter}/${getLocalizedConfig(course)?.class}`} component={lazy(() => retry(() => import(`../shared-views/course-level/chapter/class`)))} />
        <Route path={`${AUTH_PREFIX_PATH}/${course}/:${getLocalizedConfig(course)?.level}/:${getLocalizedConfig(course)?.chapter}/${getLocalizedConfig(course)?.grammarClass}`} component={lazy(() => retry(() => import(`./course-level/chapter/classes`)))} />
        <Route path={`${AUTH_PREFIX_PATH}/${course}/:${getLocalizedConfig(course)?.level}/:${getLocalizedConfig(course)?.chapter}/${getLocalizedConfig(course)?.speaking}`} component={lazy(() => retry(() => import(`./course-level/chapter/speaking`)))} />
        <Route path={`${AUTH_PREFIX_PATH}/${course}/:${getLocalizedConfig(course)?.level}/:${getLocalizedConfig(course)?.chapter}/${getLocalizedConfig(course)?.quizletpdf}`} component={lazy(() => retry(() => import(`./course-level/chapter/pdf-render`)))} />		
        <Route path={`${AUTH_PREFIX_PATH}/${course}/:${getLocalizedConfig(course)?.level}/:${getLocalizedConfig(course)?.chapter}/:${getLocalizedConfig(course)?.modality}`} component={lazy(() => retry(() => import(`../shared-views/course-level/chapter/practice`)))} />
        <Route exact path={`${AUTH_PREFIX_PATH}/terms-conditions`} component={TermsConditionsCancelSubscription} />
        <Route exact path={`${AUTH_PREFIX_PATH}/shopping`} component={lazy(() => retry(() => import(`./shop-window`)))} />
        {/* <Route exact path={`${AUTH_PREFIX_PATH}/profile/edit-profile`} component={lazy(() => retry(() => import(`./profile/index`)))} />		 */}
        {/* <Route path={`${AUTH_PREFIX_PATH}/login`} component={lazy(() => import(`./authentication/login`))} /> */}
        {/* <Route path={`${AUTH_PREFIX_PATH}/login`} component={lazy(() => import(`./authentication/login`))} /> */}
        {/* <Route path={`${AUTH_PREFIX_PATH}/login`} component={Login} /> */}
        <Route path={`${AUTH_PREFIX_PATH}/login-2`} component={lazy(() => import(`./authentication/login-2`))} />
        <Route path={`${AUTH_PREFIX_PATH}/register-1`} component={lazy(() => import(`./authentication/register-1`))} />
        <Route path={`${AUTH_PREFIX_PATH}/register-2`} component={lazy(() => import(`./authentication/register-2`))} />
        <Route path={`${AUTH_PREFIX_PATH}/forgot-password`} component={lazy(() => import(`./authentication/forgot-password`))} />
        <Route path={`${AUTH_PREFIX_PATH}/error-1`} component={lazy(() => import(`./errors/error-page-1`))} />
        <Route path={`${AUTH_PREFIX_PATH}/error-2`} component={lazy(() => import(`./errors/error-page-2`))} />
        {/* Authenticated users go to landing course on root /lrn-auth */}
        { token ? 
          <Redirect exact from={`${AUTH_PREFIX_PATH}`} to={`${AUTH_PREFIX_PATH}/${course}/${getLocalizedConfig(course)?.level}-${DEFAULT_LANDING_COURSE}`} />
          :
          // Unauthenticated go to /lrn
          <Redirect exact from={`${AUTH_PREFIX_PATH}`} to={`${APP_PREFIX_PATH}`} />
        }

        {/* Catch-all fallback for any unknown /lrn-auth/* paths */}
        <Route path={`${AUTH_PREFIX_PATH}/*`}>
          <Redirect to={`${APP_PREFIX_PATH}`} />
        </Route>
        
      </Switch>
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

