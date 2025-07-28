import React, { lazy, Suspense } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import Loading from '../../components/shared-components/Loading';
import { AUTH_PREFIX_PATH } from '../../configs/AppConfig'
import { getLocalizedConfig } from '../../configs/CourseMainNavigationConfig/Submenus/ConfigureNavigationLocalization';
import TermsConditionsCancelSubscription from "components/admin-components/ModalMessages/TermsConditionsCancelSubscription";
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import { retry } from '../../helpers/index';
import Login from '../auth-views/authentication/login';

export const AuthViews = (props) => {
  const { course } = props;
  return (
    <Suspense fallback={<Loading cover="page"/>}>
      <Switch>
        <Route exact path={`${AUTH_PREFIX_PATH}/insight`} component={lazy(() => import(`./user-auth/analytics`))} />
        <Route path={`${AUTH_PREFIX_PATH}/${course}/:${getLocalizedConfig(course)?.level}/:${getLocalizedConfig(course)?.chapter}/${getLocalizedConfig(course)?.grammarClass}`} component={lazy(() => retry(() => import(`./course-level/chapter/classes`)))} />
        <Route path={`${AUTH_PREFIX_PATH}/${course}/:${getLocalizedConfig(course)?.level}/:${getLocalizedConfig(course)?.chapter}/${getLocalizedConfig(course)?.speaking}`} component={lazy(() => retry(() => import(`./course-level/chapter/speaking`)))} />
        <Route path={`${AUTH_PREFIX_PATH}/${course}/:${getLocalizedConfig(course)?.level}/:${getLocalizedConfig(course)?.chapter}/${getLocalizedConfig(course)?.quizletpdf}`} component={lazy(() => retry(() => import(`./course-level/chapter/pdf-render`)))} />		
        <Route path={`${AUTH_PREFIX_PATH}/${course}/:${getLocalizedConfig(course)?.level}/:${getLocalizedConfig(course)?.chapter}/:${getLocalizedConfig(course)?.modality}`} component={lazy(() => retry(() => import(`./course-level/chapter/practice`)))} />
        {/* <Route exact path={`${AUTH_PREFIX_PATH}/${course}/:${getLocalizedConfig(course)?.level}`} component={lazy(() => retry(() => import(`./authentication/auth-course-level`)))} /> */}
        <Route exact path={`${AUTH_PREFIX_PATH}/terms-conditions`} component={TermsConditionsCancelSubscription} />
        <Route exact path={`${AUTH_PREFIX_PATH}/test`} component={lazy(() => retry(() => import(`./authentication/auth-course-level`)))} />
        {/* <Route path={`${AUTH_PREFIX_PATH}/login`} component={lazy(() => import(`./authentication/login`))} /> */}
        {/* <Route path={`${AUTH_PREFIX_PATH}/login`} component={lazy(() => import(`./authentication/login`))} /> */}
        {/* <Route path={`${AUTH_PREFIX_PATH}/login`} component={Login} /> */}
        <Route path={`${AUTH_PREFIX_PATH}/login-2`} component={lazy(() => import(`./authentication/login-2`))} />
        <Route path={`${AUTH_PREFIX_PATH}/register-1`} component={lazy(() => import(`./authentication/register-1`))} />
        <Route path={`${AUTH_PREFIX_PATH}/register-2`} component={lazy(() => import(`./authentication/register-2`))} />
        <Route path={`${AUTH_PREFIX_PATH}/forgot-password`} component={lazy(() => import(`./authentication/forgot-password`))} />
        <Route path={`${AUTH_PREFIX_PATH}/error-1`} component={lazy(() => import(`./errors/error-page-1`))} />
        <Route path={`${AUTH_PREFIX_PATH}/error-2`} component={lazy(() => import(`./errors/error-page-2`))} />
        {/* <Redirect from={`${AUTH_PREFIX_PATH}`} to={`${AUTH_PREFIX_PATH}/login`} /> */}
        <Redirect from={`${AUTH_PREFIX_PATH}`} to={`${AUTH_PREFIX_PATH}/test`} />
        <Redirect from={`${AUTH_PREFIX_PATH}/`} to={`${AUTH_PREFIX_PATH}/test`} />
      </Switch>
    </Suspense>
  )
}

const mapStateToProps = ({ theme }) => {
	const { course } =  theme;
	return { course }
};

export default React.memo(connect(mapStateToProps)(AuthViews));

