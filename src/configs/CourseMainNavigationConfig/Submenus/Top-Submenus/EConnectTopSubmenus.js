import { APP_PREFIX_PATH } from '../../../AppConfig';
import { getCourseSubNavigationLowBasic } from '../CourseSubNavigationLowBasic' 
import { getCourseSubNavigationMidBasic } from '../CourseSubNavigationMidBasic';
import { getCourseSubNavigationHighBasic } from '../CourseSubNavigationHighBasic';
import { getLocalizedConfig } from '../ConfigureNavigationLocalization';
import { ICON_LIBRARY_TYPE_CONFIG } from 'configs/IconConfig';
import { COURSE_COLOR_CONFIG, COURSE_ICON_CONFIG } from 'configs/CourseThemeConfig';

export const getTopSubmenuForEnglishConnect = (lang) => {		
	
	return [
		{
			key: 'ec-level-1-eng',
			path: `${APP_PREFIX_PATH}/eng/level-1`,
			title: 'main.upper.nav.level.1',
			sideTitle: 'Lower Beginner',
			icon: COURSE_ICON_CONFIG.lowerBeginner,
			iconType: ICON_LIBRARY_TYPE_CONFIG.hostedSvg,
			color: COURSE_COLOR_CONFIG.lowerBeginner,
			current: false,
			isRootMenuItem: true,
			iconPosition: "upperNav",
			isServiceAvailableForUser: false,
			isToDisplayInNavigation: true,
			isFree: true,
			course: "English",
			topSubmenu:[],
			submenu: [
				...getCourseSubNavigationLowBasic("eng")
			]
		},
		{
			key: 'ec-level-2-eng',
			path: `${APP_PREFIX_PATH}/eng/level-2`,
			title: 'main.upper.nav.level.2',
			sideTitle: 'Mid Beginner',
			icon: COURSE_ICON_CONFIG.midBeginner,
			iconType: ICON_LIBRARY_TYPE_CONFIG.hostedSvg,
			color: COURSE_COLOR_CONFIG.midBeginner,
			current: false,
			isRootMenuItem: true,
			iconPosition: "upperNav",
			isServiceAvailableForUser: false,
			isToDisplayInNavigation: true,
			isFree: true,
			course: "English",
			topSubmenu:[],
			submenu: [
				...getCourseSubNavigationMidBasic("eng")
			]
		},
		{
			key: 'ec-level-3-eng',
			path: `${APP_PREFIX_PATH}/eng/level-3`,
			title: 'main.upper.nav.level.3',
			sideTitle: 'Upper Beginner',
			icon: COURSE_ICON_CONFIG.upperBeginner,
			iconType: ICON_LIBRARY_TYPE_CONFIG.hostedSvg,
			color: COURSE_COLOR_CONFIG.upperBeginner,
			current: false,
			isRootMenuItem: true,
			iconPosition: "upperNav",
			isServiceAvailableForUser: false,
			isToDisplayInNavigation: false,
			isFree: false,
			course: "English",
			topSubmenu:[],
			submenu: [
				...getCourseSubNavigationHighBasic("eng")
			]
		}
	]
}

