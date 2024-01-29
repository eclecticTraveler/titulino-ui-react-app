import React from "react";
import AppLocale from "../lang";
import useBodyClass from "../hooks/useBodyClass";
import { connect } from "react-redux";
import { IntlProvider } from "react-intl";
import { ConfigProvider } from "antd";
import { DEFAULT_PREFIX_VIEW, APP_PREFIX_PATH, AUTH_PREFIX_PATH } from "../configs/AppConfig";
import { Route, Switch, Redirect, withRouter } from "react-router-dom";
import AuthLayout from '../layouts/auth-layout';
import AppLayout from "../layouts/app-layout";
import RenderOnAuthenticated from '../components/RenderOnAuthenticated';
import CourseSelection from './app-views/course-selection';
import {getWasUserConfigSetFlag, getUserSelectedCourse, getUserNativeLanguage, onKeycloakAuthentication}  from '../redux/actions/Lrn';
import { onLocaleChange, onCourseChange, onLoadingUserSelectedTheme } from '../redux/actions/Theme'
import RenderOnlyOnAuthenticated from "../components/RenderOnlyOnAuthenticated";
import { useKeycloak, KeycloakProvider } from "@react-keycloak/web";
import { useThemeSwitcher } from "react-css-theme-switcher";
import { bindActionCreators } from 'redux';
  
export const Views = (props) => { 
	const { locale, location, direction, course, selectedCourse, getUserNativeLanguage, onLocaleChange, nativeLanguage, onKeycloakAuthentication,
            wasUserConfigSet, getWasUserConfigSetFlag, getUserSelectedCourse, onCourseChange, currentTheme, onLoadingUserSelectedTheme } = props;
    const localization = locale ? locale : 'en';
    const currentAppLocale = AppLocale[localization];
    const { keycloak } = useKeycloak();
    const { switcher, themes } = useThemeSwitcher();
    // console.log("LOCALE")
    // console.log(currentAppLocale)
    useBodyClass(`dir-${direction}`);

    onKeycloakAuthentication(keycloak);

    // Load user selected theme
    onLoadingUserSelectedTheme();
    switcher({ theme: themes[currentTheme] });


    const repopulateConfiguration = () => {
        // Changes lost on a refresh, order of these functions are important
        getUserNativeLanguage(); 
        if(nativeLanguage){
            onLocaleChange(nativeLanguage?.localizationId)
        }
        
        getUserSelectedCourse();    
        if(selectedCourse){
            onCourseChange(selectedCourse?.courseAbbreviation);
        } 
    }

    getWasUserConfigSetFlag();
    (wasUserConfigSet && !course) ?? repopulateConfiguration();    
        return(    
                <IntlProvider 			
                    locale={currentAppLocale.locale}
                    messages={currentAppLocale.messages}>
                        <ConfigProvider locale={currentAppLocale.antd} direction={direction}>
                                <Switch>
                                    {(!wasUserConfigSet) &&                                 
                                    <CourseSelection/>
                                    }
                                    <Route exact path="/">
                                        <Redirect to={APP_PREFIX_PATH ? APP_PREFIX_PATH : DEFAULT_PREFIX_VIEW} />
                                    </Route>
                                    <Route path={APP_PREFIX_PATH ? APP_PREFIX_PATH : DEFAULT_PREFIX_VIEW}>
                                        <AppLayout direction={direction} location={location}/>
                                    </Route>
                                    {/* <KeycloakProvider keycloak={keycloak} onEvent={this.keycloak.logout()}> */}
                                        {/* <AppLayout direction={direction} location={location}/> */}
                                    {/* </KeycloakProvider> */}
                                    {/* <RenderOnlyOnAuthenticated> */}
                                        {/* <AuthLayout direction={direction} /> */}
                                        {/* <AppLayout direction={direction} location={location}/> */}
                                    {/* </RenderOnlyOnAuthenticated> */}
                                </Switch>                            
                    </  ConfigProvider>
                </IntlProvider>  
        )
}


function mapDispatchToProps(dispatch){
	return bindActionCreators({
        getWasUserConfigSetFlag: getWasUserConfigSetFlag,
        getUserSelectedCourse: getUserSelectedCourse,
        onCourseChange: onCourseChange,
        getUserNativeLanguage: getUserNativeLanguage,
        onLocaleChange: onLocaleChange,
        onKeycloakAuthentication: onKeycloakAuthentication,
        onLoadingUserSelectedTheme: onLoadingUserSelectedTheme
	}, dispatch)
}

// This gets triggered first before it goes to the "const Views"
// This connects us with Redux to pass the "props" as if it was a Session
const mapStateToProps = ({ theme, lrn }) => {
    const { wasUserConfigSet, selectedCourse, nativeLanguage } = lrn;
	const { locale, direction, course, currentTheme } =  theme;
	return { locale, direction, course, wasUserConfigSet, selectedCourse, nativeLanguage, currentTheme }
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Views));
