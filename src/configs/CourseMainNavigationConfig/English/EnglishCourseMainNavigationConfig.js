import { APP_PREFIX_PATH, SELECTED_COURSE_PATH, AUTH_PREFIX_PATH } from '../../AppConfig'
import { getCourseSubNavigationLowBasic } from '../Submenus/CourseSubNavigationLowBasic' 
import { getCourseSubNavigationMidBasic } from '../Submenus/CourseSubNavigationMidBasic';
import { getCourseSubNavigationHighBasic } from '../Submenus/CourseSubNavigationHighBasic';
import { CourseSubNavigationSupermarketTheme } from '../Submenus/CourseSubNavigationSupermarketTheme';
import { COURSE_COLOR_CONFIG, COURSE_ICON_CONFIG } from 'configs/CourseThemeConfig';
import { ICON_LIBRARY_TYPE_CONFIG } from 'configs/IconConfig';

const dashBoardNavTree = [
	{
		key: 'level-1-eng',
		path: `${APP_PREFIX_PATH}/eng/level-1`,
		title: 'main.upper.nav.level.1',
		sideTitle: 'Lower Beginner',
		icon: COURSE_ICON_CONFIG.default,
		iconType: ICON_LIBRARY_TYPE_CONFIG.hostedSvg,
		color: COURSE_COLOR_CONFIG.lowerBeginner,
		current: true,
		isRootMenuItem: true,
		iconPosition: "upperNav",
		isServiceAvailableForUser: false,
		isToDisplayInNavigation: true,
		isFree: true,
		course: "English",
		submenu: [
			...getCourseSubNavigationLowBasic("eng")
		]
	},
	{
		key: 'level-2-eng',
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
		isToDisplayInNavigation: true,
		isFree: true,
		course: "English",
		submenu: [
			...getCourseSubNavigationMidBasic("eng")
		]
	},
	{
		key: 'level-3-eng',
		path: `${APP_PREFIX_PATH}/eng/level-3`,
		title: 'main.upper.nav.level.3',
		sideTitle: 'Upper Beginner',
		icon: COURSE_ICON_CONFIG.default,
		iconType: ICON_LIBRARY_TYPE_CONFIG.hostedSvg,
		color: COURSE_COLOR_CONFIG.upperBeginner,
		current: false,
		isRootMenuItem: true,
		iconPosition: "upperNav",
		isServiceAvailableForUser: false,
		isToDisplayInNavigation: false,
		isFree: false,
		course: "English",
		submenu: [
			...getCourseSubNavigationHighBasic("eng")
		]
	},
	{
		key: 'level-supermarket-eng',
		path: `${APP_PREFIX_PATH}/eng/level-supermarket`,
		title: 'main.upper.nav.theme.level.pilot',
		sideTitle: 'Supermarket',
		icon: COURSE_ICON_CONFIG.default,
		iconType: ICON_LIBRARY_TYPE_CONFIG.hostedSvg,
		color: COURSE_COLOR_CONFIG.superMarketTheme,
		current: false,
		isRootMenuItem: true,
		iconPosition: "upperNav",
		isServiceAvailableForUser: false,
		isToDisplayInNavigation: true,
		isFree: false,
		course: "English",
		submenu: [
			...CourseSubNavigationSupermarketTheme("eng")
		]
	}
]

const englishCourseMainNavigationConfig = [
  ...dashBoardNavTree
]

export default englishCourseMainNavigationConfig;
