import { APP_PREFIX_PATH } from '../../AppConfig'
import { getCourseSubNavigationLowBasic } from '../Submenus/CourseSubNavigationLowBasic' 
import { getCourseSubNavigationMidBasic } from '../Submenus/CourseSubNavigationMidBasic';
import { getCourseSubNavigationHighBasic } from '../Submenus/CourseSubNavigationHighBasic';
import { CourseSubNavigationHouseholdTheme } from '../Submenus/CourseSubNavigationHouseholdTheme';
import { CourseSubNavigationWorkNJobsTheme } from '../Submenus/CourseSubNavigationWorkNJobsTheme';
import { CourseSubNavigationSupermarketTheme } from '../Submenus/CourseSubNavigationSupermarketTheme';
import { AuthCourseSubNavigationHouseholdTheme } from '../Submenus/AuthCourseSubNavigationHouseholdTheme';
import { AuthCourseSubNavigationSupermarketTheme } from '../Submenus/AuthCourseSubNavigationSupermarketTheme';
import { AuthCourseSubNavigationWorkNJobsTheme } from '../Submenus/AuthCourseSubNavigationWorknJobsTheme';
import { getTopSubmenuForEnglishConnect } from '../Submenus/Top-Submenus/EConnectTopSubmenus';
import { COURSE_COLOR_CONFIG, COURSE_ICON_CONFIG } from 'configs/CourseThemeConfig';
import { ICON_LIBRARY_TYPE_CONFIG } from 'configs/IconConfig';

export const getEnglishCourseMainNavigationConfig = (isAuthenticated) => {
	return EnglishCourseMainNavigationConfig(isAuthenticated);
}
const EnglishCourseMainNavigationConfig  = (isAuthenticated) => [
	{
		key: 'level-1-eng-inactive',
		path: `${APP_PREFIX_PATH}/eng/level-1`,
		title: 'main.upper.nav.level.1',
		sideTitle: 'Lower Beginner',
		icon: COURSE_ICON_CONFIG.default,
		iconType: ICON_LIBRARY_TYPE_CONFIG.hostedSvg,
		color: COURSE_COLOR_CONFIG.lowerBeginner,
		current: false,
		isRootMenuItem: true,
		iconPosition: "upperNav",
		isServiceAvailableForUser: false,
		isToDisplayInNavigation: false,
		isFree: true,
		course: "English",
		topSubmenu: [],
		submenu: [
			...getCourseSubNavigationLowBasic("eng")
		]
	},
	{
		key: 'level-2-eng-inactive',
		path: `${APP_PREFIX_PATH}/eng/level-2`,
		title: 'main.upper.nav.level.2',
		sideTitle: 'Mid Beginner',
		icon: COURSE_ICON_CONFIG.default,
		iconType: ICON_LIBRARY_TYPE_CONFIG.hostedSvg,
		color: COURSE_COLOR_CONFIG.midBeginner,
		current: false,
		isRootMenuItem: true,
		iconPosition: "upperNav",
		isServiceAvailableForUser: false,
		isToDisplayInNavigation: false,
		isFree: true,
		course: "English",
		topSubmenu: [],
		submenu: [
			...getCourseSubNavigationMidBasic("eng")
		]
	},
	{
		key: 'level-work-and-jobs-part-eng',
		path: `${APP_PREFIX_PATH}/eng/level-work-n-jobs`,
		title: 'main.upper.nav.theme.level.workNjobs',
		sideTitle: 'Work & Jobs',
		icon: COURSE_ICON_CONFIG.default,
		iconType: ICON_LIBRARY_TYPE_CONFIG.hostedSvg,
		color: COURSE_COLOR_CONFIG.workNjobsTheme,
		current: false,
		isRootMenuItem: true,
		iconPosition: "upperNav",
		isServiceAvailableForUser: false,
		isToDisplayInNavigation: true,
		isFree: false,
		course: "English",
		topSubmenu: [],
		submenu: [
			...(isAuthenticated 
				? AuthCourseSubNavigationWorkNJobsTheme("eng") 
				: CourseSubNavigationWorkNJobsTheme("eng")
			)
		]
	},
	{
		key: 'level-household-part-eng',
		path: `${APP_PREFIX_PATH}/eng/level-household`,
		title: 'main.upper.nav.theme.level.household',
		sideTitle: 'Household',
		icon: COURSE_ICON_CONFIG.default,
		iconType: ICON_LIBRARY_TYPE_CONFIG.hostedSvg,
		color: COURSE_COLOR_CONFIG.householdTheme,
		current: true,
		isRootMenuItem: true,
		iconPosition: "upperNav",
		isServiceAvailableForUser: false,
		isToDisplayInNavigation: true,
		isFree: false,
		course: "English",
		topSubmenu: [],
		submenu: [
			...(isAuthenticated 
				? AuthCourseSubNavigationHouseholdTheme("eng") 
				: CourseSubNavigationHouseholdTheme("eng")
			)
		]
	},
	{
		key: 'level-supermarket-eng',
		path: `${APP_PREFIX_PATH}/eng/level-supermarket`,
		title: 'main.upper.nav.theme.level.supermarket',
		sideTitle: 'Supermarket',
		icon: COURSE_ICON_CONFIG.default,
		iconType: ICON_LIBRARY_TYPE_CONFIG.hostedSvg,
		color: COURSE_COLOR_CONFIG.superMarketTheme,
		current: true,
		isRootMenuItem: true,
		iconPosition: "upperNav",
		isServiceAvailableForUser: false,
		isToDisplayInNavigation: true,
		isFree: false,
		course: "English",
		topSubmenu: [],
		submenu: [
			...(isAuthenticated 
				? AuthCourseSubNavigationSupermarketTheme("eng") 
				: CourseSubNavigationSupermarketTheme("eng")
			)
		]
	},
	{
		key: 'level-connect-eng-general',
		path: `${APP_PREFIX_PATH}/eng/level-general`,
		title: 'main.upper.nav.theme.level.ec',
		sideTitle: 'Connect',
		icon: COURSE_ICON_CONFIG.default,
		iconType: ICON_LIBRARY_TYPE_CONFIG.hostedSvg,
		color: COURSE_COLOR_CONFIG.superMarketTheme,
		current: true,
		isRootMenuItem: true,
		iconPosition: "upperNav",
		isServiceAvailableForUser: false,
		isToDisplayInNavigation: true,
		isFree: false,
		course: "English",
		topSubmenu:[
			...getTopSubmenuForEnglishConnect("eng")
		],
		submenu: []
	},
]

