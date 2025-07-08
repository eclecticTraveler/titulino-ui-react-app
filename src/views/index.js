import React, { useEffect, useCallback } from "react";
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
import useSupabaseSessionSync from "hooks/useSupabaseSessionSync";
import EmailYearSearchForm from "components/layout-components/EmailYearSearchForm";
import { authenticated, signIn } from "redux/actions/Auth";
import { onAuthenticatingWithSSO, onLoadingAuthenticatedLandingPage } from "redux/actions/Grant";
import SupabaseAuthService from "services/SupabaseAuthService";

function RouteInterceptor({ children, isAuthenticated, ...rest }) {
    const loginPath = `${APP_PREFIX_PATH}/test`; /// LOGIN
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
    const { locale, direction, course, selectedCourse, getUserNativeLanguage, onLocaleChange, nativeLanguage, location, token, user, authenticated, onAuthenticatingWithSSO,
        wasUserConfigSet, getWasUserConfigSetFlag, getUserSelectedCourse, onCourseChange, currentTheme, onLoadingUserSelectedTheme, onLoadingAuthenticatedLandingPage, subNavPosition, signIn } = props;
    const currentAppLocale = AppLocale[locale];
    const { switcher, themes } = useThemeSwitcher();
    
    // Load the cookie for Authentication if there was any
    useSupabaseSessionSync((session) => {
        if(!user?.emailId){
            authenticated(session?.user);
            onAuthenticatingWithSSO(session?.user?.email);
        }
        console.log("--->user", user?.contactId)

    });
      
    useEffect(() => {
        if(token?.email && !user?.contactId){  
        console.log("--->inside Effect", user?.contactId)          
        onLoadingAuthenticatedLandingPage(token?.email);
    }
    }, [user?.contactId]);

    //   useEffect(() => {
    //     const syncInternalToken = async () => {
    //       await SupabaseAuthService.refreshInternalTokenIfValidSupabase(user?.yearOfBirth);
    //     };
      
    //     if (user?.email && user?.yearOfBirth) {
    //         console.log("INN")
    //       syncInternalToken();
    //     }
    //   }, [user?.email, user?.yearOfBirth]);
      
    
    useBodyClass(`dir-${direction}`);

    // Effect to load user selected theme and locale
    useEffect(() => {
        onLoadingUserSelectedTheme();
        if((!wasUserConfigSet) || wasUserConfigSet === false){
            getWasUserConfigSetFlag();
        }
 

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

    if(!wasUserConfigSet){
        return (
            <IntlProvider locale={currentAppLocale.locale} messages={currentAppLocale.messages}>
                <ConfigProvider locale={currentAppLocale.antd} direction={direction}>
                    <CourseSelection />
                </ConfigProvider>
            </IntlProvider>
        )
    }

    return (
        <IntlProvider locale={currentAppLocale.locale} messages={currentAppLocale.messages}>
            <ConfigProvider locale={currentAppLocale.antd} direction={direction}>
                <Switch>
                    <Route exact path={DEFAULT_PREFIX_VIEW}>
                        <Redirect to={APP_PREFIX_PATH} />
                    </Route>
                    <Route path={APP_PREFIX_PATH}>
                        <AppLayout direction={direction} location={location} />
                    </Route>
                    {/* <RouteInterceptor path={AUTH_PREFIX_PATH} isAuthenticated={token}>
                        <AuthLayout direction={direction} location={location}/>
                    </RouteInterceptor> */}
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
        onLoadingUserSelectedTheme,
        onAuthenticatingWithSSO,
        authenticated,
        signIn,
        onLoadingAuthenticatedLandingPage
    }, dispatch);
}

const mapStateToProps = ({ theme, lrn, auth, grant }) => {
    const { wasUserConfigSet, selectedCourse, nativeLanguage } = lrn;
    const { locale, direction, course, currentTheme, subNavPosition } = theme;
    const { token } = auth;
    const { user } = grant;
    return { locale, direction, course, wasUserConfigSet, selectedCourse, nativeLanguage, currentTheme, subNavPosition, token, user };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Views));
