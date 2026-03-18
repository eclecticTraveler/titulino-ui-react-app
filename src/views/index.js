import React, { useEffect, useCallback, useRef } from "react";
import AppLocale from "../lang";
import useBodyClass from "../hooks/useBodyClass";
import { connect } from "react-redux";
import { IntlProvider } from "react-intl";
import { ConfigProvider, theme as antdTheme } from "antd";
import { DEFAULT_PREFIX_VIEW, APP_PREFIX_PATH, AUTH_PREFIX_PATH } from "../configs/AppConfig";
import { Route, Switch, Redirect, withRouter, useLocation  } from 'utils/routerCompat';
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
 
function RouteInterceptor({ children, isAuthenticated, ...rest }) {
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
      <Redirect
        to={{
          pathname: `${APP_PREFIX_PATH}/login`,
          search: `?redirect=${encodeURIComponent(pathname)}`,
        }}
      />
    );
  }

  // Otherwise just render the route as normal
  return <Route {...rest} render={() => children} />;
}

export const Views = (props) => { 
    const { locale, direction, course, selectedCourse, getUserNativeLanguage, onLocaleChange, nativeLanguage, location, token, user, authenticated, onAuthenticatingWithSSO, isAuthResolved, onResolvingAuthenticationWhenRefreshing,
        wasUserConfigSet, getWasUserConfigSetFlag, getUserSelectedCourse, onCourseChange, currentTheme, onLoadingUserSelectedTheme, onLoadingAuthenticatedLandingPage } = props;
    const currentAppLocale = AppLocale[locale];
    const { switcher, themes } = useThemeSwitcher();
    const titulinoBaseColor = "#e79547";
    const isDark = currentTheme === "dark";
    const darkTokens = isDark ? {
        colorBgBase: "#1b2531",
        colorBgContainer: "#283142",
        colorBgLayout: "#1b2531",
        colorBgElevated: "#455572",
        colorText: "#b4bed2",
        colorTextSecondary: "#72849a",
        colorTextHeading: "#d6d7dc",
        colorBorder: "#4d5b75",
        colorBorderSecondary: "#4d5b75",
        colorTextPlaceholder: "#617190",
        colorTextDisabled: "#9ea8bb",
        colorBgContainerDisabled: "#586379",
        controlItemBgHover: "#364663",
        colorFillSecondary: "#364663",
        colorBgSpotlight: "#283142",
        colorSplit: "#4d5b75",
        boxShadow: "0 3px 6px -4px rgba(0,0,0,0.12), 0 6px 16px 0 rgba(0,0,0,0.58), 0 9px 28px 8px rgba(0,0,0,0.15)",
    } : {};
    const archivoFont = "'Archivo', Helvetica, sans-serif";
    const configProviderTheme = {
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
            colorPrimary: titulinoBaseColor,
            fontFamily: archivoFont,
            ...darkTokens,
        },
        components: {
            Tabs: {
                itemSelectedColor: titulinoBaseColor,
                itemActiveColor: titulinoBaseColor,
                itemHoverColor: titulinoBaseColor,
                inkBarColor: titulinoBaseColor,
                cardBg: isDark ? '#283142' : undefined,
                titleFontSize: 14,
            },
            Checkbox: {
                colorPrimary: titulinoBaseColor,
                colorPrimaryHover: titulinoBaseColor,
            },
            Menu: {
                itemHoverColor: titulinoBaseColor,
                itemSelectedColor: titulinoBaseColor,
                subMenuItemBg: 'transparent',
                ...(isDark ? {
                    colorItemBg: '#283142',
                    darkItemBg: '#283142',
                    itemHoverBg: '#364663',
                    darkItemHoverBg: '#364663',
                    itemSelectedBg: '#364663',
                    darkItemSelectedBg: '#364663',
                    itemColor: '#b4bed2',
                    darkItemColor: '#b4bed2',
                    itemHoverColor: titulinoBaseColor,
                    darkItemHoverColor: titulinoBaseColor,
                } : {}),
            },
            ...(isDark ? {
                Table: {
                    headerBg: "#283142",
                    rowHoverBg: "#364663",
                    headerSortActiveBg: "#424242",
                    headerSortHoverBg: "#424242",
                    footerBg: "#3b4962",
                    colorBgContainer: "#283142",
                },
                Layout: {
                    headerBg: "#283142",
                    bodyBg: "#1b2531",
                    siderBg: "#283142",
                },
                Card: {
                    colorBgContainer: "#283142",
                },
                Input: {
                    colorBgContainer: "#283142",
                    addonBg: "#3b4962",
                },
                Select: {
                    colorBgContainer: "#283142",
                    colorBgElevated: "#455572",
                    optionActiveBg: "#364663",
                },
                Modal: {
                    contentBg: "#283142",
                    headerBg: "#283142",
                },
                Dropdown: {
                    colorBgElevated: "#455572",
                },
                Popover: {
                    colorBgElevated: "#455572",
                },
            } : {}),
        },
    };

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
    useBodyClass(currentTheme === 'dark' ? 'dark' : 'light');

    // Switch CSS theme file when currentTheme changes
    useEffect(() => {
        if (currentTheme) {
            switcher({ theme: themes[currentTheme] });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentTheme]);

    // Effect to load user selected theme and locale
    useEffect(() => {
        onLoadingUserSelectedTheme();        
        if((!wasUserConfigSet) || wasUserConfigSet === false){                 
            getWasUserConfigSetFlag();            
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

    }, [getWasUserConfigSetFlag, wasUserConfigSet, course, currentTheme, nativeLanguage, selectedCourse, onLoadingUserSelectedTheme, getUserNativeLanguage, onLocaleChange, getUserSelectedCourse, onCourseChange]);          


    if(!wasUserConfigSet){
        return (
            <IntlProvider locale={currentAppLocale.locale} messages={currentAppLocale.messages}>
                <ConfigProvider locale={currentAppLocale.antd} direction={direction} theme={configProviderTheme}>
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
            <ConfigProvider locale={currentAppLocale.antd} direction={direction} theme={configProviderTheme}>
                <Switch>
                    <Route exact path={DEFAULT_PREFIX_VIEW}>
                        <Redirect to={APP_PREFIX_PATH} />
                    </Route>
                    <Route path={APP_PREFIX_PATH}>
                        <AppLayout direction={direction} location={location} />
                    </Route>
                    <RouteInterceptor path={AUTH_PREFIX_PATH} isAuthenticated={token}>
                        <AuthLayout direction={direction} location={location} />
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

