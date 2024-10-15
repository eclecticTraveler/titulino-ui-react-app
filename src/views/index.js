import React, { useEffect } from "react";
import AppLocale from "../lang";
import useBodyClass from "../hooks/useBodyClass";
import { connect } from "react-redux";
import { IntlProvider } from "react-intl";
import { ConfigProvider } from "antd";
import { DEFAULT_PREFIX_VIEW, APP_PREFIX_PATH, AUTH_PREFIX_PATH } from "../configs/AppConfig";
import { Route, Switch, Redirect, withRouter } from "react-router-dom";
import AuthLayout from '../layouts/auth-layout';
import AppLayout from "../layouts/app-layout";
import CourseSelection from './app-views/course-selection';
import { getWasUserConfigSetFlag, getUserSelectedCourse, getUserNativeLanguage } from '../redux/actions/Lrn';
import { onLocaleChange, onCourseChange, onLoadingUserSelectedTheme } from '../redux/actions/Theme'
import { useThemeSwitcher } from "react-css-theme-switcher";
import { bindActionCreators } from 'redux';

function RouteInterceptor({ children, isAuthenticated, ...rest }) {
    const loginPath = `${AUTH_PREFIX_PATH}/test`; /// LOGIN
    console.log("INTER", isAuthenticated);
    // If isAuthenticated then render components passed if not then redirect to pathname or login page
    return (
      <Route
        {...rest}
        render={({ location }) =>
          isAuthenticated ? (
            children
          ) : (
            <Redirect
              to={{
                pathname: loginPath,
                state: { from: location }
              }}
            />
          )
        }
      />
    );
  }

export const Views = (props) => { 
    const { locale, direction, course, selectedCourse, getUserNativeLanguage, onLocaleChange, nativeLanguage, location, token,
        wasUserConfigSet, getWasUserConfigSetFlag, getUserSelectedCourse, onCourseChange, currentTheme, onLoadingUserSelectedTheme, subNavPosition } = props;
    const currentAppLocale = AppLocale[locale];
    const { switcher, themes } = useThemeSwitcher();

    useBodyClass(`dir-${direction}`);

    // Effect to load user selected theme and locale
    useEffect(() => {
        onLoadingUserSelectedTheme();
        getWasUserConfigSetFlag();

        if (currentTheme) {
            switcher({ theme: themes[currentTheme] });
        }

        if (wasUserConfigSet && !course) {
            getUserNativeLanguage();
            if (nativeLanguage) {
                onLocaleChange(nativeLanguage?.localizationId);
            }
            
            getUserSelectedCourse();
            if (selectedCourse) {
                onCourseChange(selectedCourse?.courseAbbreviation);
            }
        }

    }, [getWasUserConfigSetFlag, wasUserConfigSet, course, currentTheme, nativeLanguage, selectedCourse, onLoadingUserSelectedTheme, switcher, themes, getUserNativeLanguage, onLocaleChange, getUserSelectedCourse, onCourseChange]);

    console.log("tokensito",token);


    return (
        <IntlProvider locale={currentAppLocale.locale} messages={currentAppLocale.messages}>
            <ConfigProvider locale={currentAppLocale.antd} direction={direction}>
                <Switch>
                    {!wasUserConfigSet && <CourseSelection />}
                    <Route exact path={DEFAULT_PREFIX_VIEW}>
                        <Redirect to={token ? AUTH_PREFIX_PATH : APP_PREFIX_PATH} />
                    </Route>
                    <Route path={APP_PREFIX_PATH}>
                        <AppLayout direction={direction} location={location} />
                    </Route>
                    {/* <Route path={AUTH_PREFIX_PATH}>
                        <AuthLayout direction={direction} location={location}/>
                    </Route> */}
                    <RouteInterceptor path={AUTH_PREFIX_PATH} isAuthenticated={token}>
                        <AuthLayout direction={direction} location={location}/>
                    </RouteInterceptor>
                </Switch>                            
            </ConfigProvider>
        </IntlProvider>  
    );
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        getWasUserConfigSetFlag,
        getUserSelectedCourse,
        onCourseChange,
        getUserNativeLanguage,
        onLocaleChange,
        onLoadingUserSelectedTheme
    }, dispatch);
}

const mapStateToProps = ({ theme, lrn, auth }) => {
    const { wasUserConfigSet, selectedCourse, nativeLanguage } = lrn;
    const { locale, direction, course, currentTheme, subNavPosition } = theme;
    const { token } = auth;
    return { locale, direction, course, wasUserConfigSet, selectedCourse, nativeLanguage, currentTheme, subNavPosition, token };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Views));
