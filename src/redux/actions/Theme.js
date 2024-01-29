import {
  TOGGLE_COLLAPSED_NAV,
  SIDE_NAV_STYLE_CHANGE,
  CHANGE_LOCALE,
  NAV_TYPE_CHANGE,
  TOP_NAV_COLOR_CHANGE,
  HEADER_NAV_COLOR_CHANGE,
  TOGGLE_MOBILE_NAV,
  SWITCH_THEME,
  DIRECTION_CHANGE,
  CHANGE_COURSE,
  RETRIEVE_THEME
} from '../constants/Theme';
import LocalStorageService from "services/LocalStorageService";
import { THEME_CONFIG } from 'configs/AppConfig';

export function toggleCollapsedNav(navCollapsed) {
  return {
    type: TOGGLE_COLLAPSED_NAV,
    navCollapsed
  };
}

export function onNavStyleChange(sideNavTheme) {
  return {
    type: SIDE_NAV_STYLE_CHANGE,
    sideNavTheme
  };
}

export function onLocaleChange(locale) {
  return {
    type: CHANGE_LOCALE,
    locale
  };
}

export function onCourseChange(course) {
  return {
    type: CHANGE_COURSE,
    course
  };
}

export function onNavTypeChange(navType) {
  return {
    type: NAV_TYPE_CHANGE,
    navType
  };
}

export function onTopNavColorChange(topNavColor) {
  return {
    type: TOP_NAV_COLOR_CHANGE,
    topNavColor
  };
}

export function onHeaderNavColorChange(headerNavColor) {
  return {
    type: HEADER_NAV_COLOR_CHANGE,
    headerNavColor
  };
}

export function onMobileNavToggle(mobileNav) {
  return {
    type: TOGGLE_MOBILE_NAV,
    mobileNav
  };
}

export const onSwitchTheme = async (currentTheme) => {
  LocalStorageService.setCurrentThemeConfiguration(currentTheme);
  return {
    type: SWITCH_THEME,
    currentTheme
  };
}

export const onLoadingUserSelectedTheme = async() => {
  let currentTheme = await LocalStorageService.getCurrentThemeConfiguration();
  if(!currentTheme){
    currentTheme = THEME_CONFIG.currentTheme;
  }
  return {
    type: RETRIEVE_THEME,
    currentTheme
  };
}

export function onDirectionChange(direction) {
  return {
    type: DIRECTION_CHANGE,
    direction
  };
}