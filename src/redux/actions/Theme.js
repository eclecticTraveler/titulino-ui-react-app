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
  LocalStorageService.setIsCurrentNavCollapsed(navCollapsed);
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
  LocalStorageService.setOnLocale(locale);
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
  LocalStorageService.setCurrentSubnavigationConfiguration(navType);
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
  let subNavPosition = await LocalStorageService.getCurrentSubnavigationConfiguration();
  let isCollapse = await LocalStorageService.getIsCurrentNavCollapsed();
  let locale = await LocalStorageService.getOnLocale();

  if(!currentTheme){
    currentTheme = THEME_CONFIG.currentTheme;
  }
  if(!subNavPosition){
    subNavPosition = THEME_CONFIG.navType;
  }
  if(!locale){
    locale = THEME_CONFIG.locale;
  }

  return {
    type: RETRIEVE_THEME,
    currentTheme,
    subNavPosition,
    isCollapse,
    locale
  };
}

export function onDirectionChange(direction) {
  return {
    type: DIRECTION_CHANGE,
    direction
  };
}