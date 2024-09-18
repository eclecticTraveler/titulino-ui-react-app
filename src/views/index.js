import React, { useEffect } from "react";
import AppLocale from "../lang";
import useBodyClass from "../hooks/useBodyClass";
import { connect } from "react-redux";
import { IntlProvider } from "react-intl";
import { ConfigProvider } from "antd";
import { DEFAULT_PREFIX_VIEW, APP_PREFIX_PATH } from "../configs/AppConfig";
import { Route, Switch, Redirect, withRouter } from "react-router-dom";
import AuthLayout from '../layouts/auth-layout';
import AppLayout from "../layouts/app-layout";
import CourseSelection from './app-views/course-selection';
import { getWasUserConfigSetFlag, getUserSelectedCourse, getUserNativeLanguage } from '../redux/actions/Lrn';
import { onLocaleChange, onCourseChange, onLoadingUserSelectedTheme } from '../redux/actions/Theme'
import { useThemeSwitcher } from "react-css-theme-switcher";
import { bindActionCreators } from 'redux';

export const Views = (props) => { 
    const { locale, direction, course, selectedCourse, getUserNativeLanguage, onLocaleChange, nativeLanguage,
        wasUserConfigSet, getWasUserConfigSetFlag, getUserSelectedCourse, onCourseChange, currentTheme, onLoadingUserSelectedTheme, subNavPosition } = props;

    const localization = locale ? locale : 'en';
    const currentAppLocale = AppLocale[localization];
    const { switcher, themes } = useThemeSwitcher();

    useBodyClass(`dir-${direction}`);

    // Effect to load user selected theme and locale
    useEffect(() => {
        onLoadingUserSelectedTheme();

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
    }, [wasUserConfigSet, course, currentTheme, nativeLanguage, selectedCourse, onLoadingUserSelectedTheme, switcher, themes, getUserNativeLanguage, onLocaleChange, getUserSelectedCourse, onCourseChange]);

    // Effect to fetch user config flag
    useEffect(() => {
        getWasUserConfigSetFlag();
    }, [getWasUserConfigSetFlag]);

    return (
        <IntlProvider locale={currentAppLocale.locale} messages={currentAppLocale.messages}>
            <ConfigProvider locale={currentAppLocale.antd} direction={direction}>
                <Switch>
                    {!wasUserConfigSet && <CourseSelection />}
                    <Route exact path="/">
                        <Redirect to={APP_PREFIX_PATH ? APP_PREFIX_PATH : DEFAULT_PREFIX_VIEW} />
                    </Route>
                    <Route path={APP_PREFIX_PATH ? APP_PREFIX_PATH : DEFAULT_PREFIX_VIEW}>
                        <AppLayout direction={direction} location={props.location} />
                    </Route>
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

const mapStateToProps = ({ theme, lrn }) => {
    const { wasUserConfigSet, selectedCourse, nativeLanguage } = lrn;
    const { locale, direction, course, currentTheme, subNavPosition } = theme;
    return { locale, direction, course, wasUserConfigSet, selectedCourse, nativeLanguage, currentTheme, subNavPosition };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Views));
