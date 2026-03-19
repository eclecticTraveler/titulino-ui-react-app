import React, { useEffect, useCallback, useRef } from "react";
import AppLocale from "../lang";
import useBodyClass from "../hooks/useBodyClass";
import { connect } from "react-redux";
import { IntlProvider } from "react-intl";
import { ConfigProvider } from "antd";
import { DEFAULT_PREFIX_VIEW, APP_PREFIX_PATH, AUTH_PREFIX_PATH } from "../configs/AppConfig";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { withRouter, Redirect } from "utils/routerCompat";
import AuthLayout from '../layouts/auth-layout';
import AppLayout from "../layouts/app-layout";
import CourseSelection from './app-views/course-selection';
import { getWasUserConfigSetFlag, getUserSelectedCourse, getUserNativeLanguage } from '../redux/actions/Lrn';
import { onLocaleChange, onCourseChange, onLoadingUserSelectedTheme } from '../redux/actions/Theme'
import { useThemeSwitcher } from "react-css-theme-switcher";
import { bindActionCreators } from 'redux';
import useSupabaseSessionSync from "hooks/useSupabaseSessionSync";
import EmailYearSearchForm from "components/layout-components/EmailYearSearchForm";
import { authenticated, signIn, onResolvingAuthenticationWhenRefreshing } from "redux/actions/Auth";
import { onAuthenticatingWithSSO, onLoadingAuthenticatedLandingPage } from "redux/actions/Grant";
import TermsConditionsCancelSubscription from "components/admin-components/ModalMessages/TermsConditionsCancelSubscription";
import PrivacyPolicy  from "components/admin-components/ModalMessages/PrivacyPolicy";

import Loading from 'components/shared-components/Loading';
import SupabaseAuthService from "services/SupabaseAuthService";
 
function RouteInterceptor({ children, isAuthenticated }) {
  const { pathname } = useLocation();

  // Save extra params before they are stripped by forwarding to later be used if they match  
  const urlParams = new URLSearchParams(window.location.search); 
  if (urlParams?.size > 0) {	      	  	
        localStorage.setItem("postQueryParams", urlParams);
    }

  // Only protect `/lrn-auth/...` routes
  if (pathname.startsWith(AUTH_PREFIX_PATH) && !isAuthenticated) {    
    // redirect to /lrn/login?redirect=/lrn-auth/whatever
    return (
      <Navigate
        to={{
          pathname: `${APP_PREFIX_PATH}/login`,
          search: `?redirect=${encodeURIComponent(pathname)}`,
        }}
        replace
      />
    );
  }

  // Otherwise just render the children
  return children;
}

export const Views = (props) => { 
    const { locale, direction, course, selectedCourse, getUserNativeLanguage, onLocaleChange, nativeLanguage, location, token, user, authenticated, onAuthenticatingWithSSO, isAuthResolved, onResolvingAuthenticationWhenRefreshing,
        wasUserConfigSet, getWasUserConfigSetFlag, getUserSelectedCourse, onCourseChange, currentTheme, onLoadingUserSelectedTheme, onLoadingAuthenticatedLandingPage } = props;
    const currentAppLocale = AppLocale[locale];
    const { switcher, themes } = useThemeSwitcher();

    // Load the cookie for Authentication if there was any
     useSupabaseSessionSync((session) => {
        // console.log("🧠 Supabase session received in sync hook:", session);
        const userFromSession = session?.user;

        if (!session) {
            // 🚫 No session: dispatch unauthenticated and stop loading
            // onResolvingAuthenticationWhenRefreshing(false);
        }

        if (userFromSession && !user?.emailId) {
            // ✅ User is authenticated and not already in Redux
            authenticated(userFromSession);
            onAuthenticatingWithSSO(userFromSession.email);
            // onResolvingAuthenticationWhenRefreshing(true);
        }
    });

      
    useEffect(() => {
        if(token?.email && !user?.contactId){        
            onLoadingAuthenticatedLandingPage(token?.email);
            onResolvingAuthenticationWhenRefreshing(true);
        }else{
            onResolvingAuthenticationWhenRefreshing(false);
        }
    }, [user?.contactId, token?.email]);

    //   useEffect(() => {
    //     const syncInternalToken = async () => {
    //       await SupabaseAuthService.refreshInternalTokenIfValidSupabase(user?.yearOfBirth);
    //     };
      
    //     if (user?.emailId && user?.yearOfBirth) {
    //         console.log("INN")
    //       syncInternalToken();
    //     }
    //   }, [user?.emailId, user?.yearOfBirth]);
      
    
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

    if (isAuthResolved === undefined) {
        return <Loading cover="content" />;
    }

    return (
        <IntlProvider locale={currentAppLocale.locale} messages={currentAppLocale.messages}>
            <ConfigProvider locale={currentAppLocale.antd} direction={direction}>
                <Routes>
                    <Route path={DEFAULT_PREFIX_VIEW} element={<Navigate to={APP_PREFIX_PATH} replace />} />
                    <Route path={`${APP_PREFIX_PATH}/*`} element={<AppLayout direction={direction} location={location} />} />
                    <Route path={`${AUTH_PREFIX_PATH}/*`} element={
                        <RouteInterceptor isAuthenticated={token}>
                            <AuthLayout direction={direction} location={location} />
                        </RouteInterceptor>
                    } />
                </Routes>                            
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
        onLoadingAuthenticatedLandingPage,
        onResolvingAuthenticationWhenRefreshing
    }, dispatch);
}

const mapStateToProps = ({ theme, lrn, auth, grant }) => {
    const { wasUserConfigSet, selectedCourse, nativeLanguage } = lrn;
    const { locale, direction, course, currentTheme, subNavPosition } = theme;
    const { token, isAuthResolved } = auth;
    const { user } = grant;
    return { locale, direction, course, selectedCourse, nativeLanguage, currentTheme, subNavPosition, token, user, isAuthResolved, wasUserConfigSet };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Views));
