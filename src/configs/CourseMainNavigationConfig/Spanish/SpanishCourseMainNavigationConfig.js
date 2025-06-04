import { APP_PREFIX_PATH, AUTH_PREFIX_PATH } from '../../AppConfig'
import { getCourseSubNavigationLowBasic } from '../Submenus/CourseSubNavigationLowBasic' 
import { getCourseSubNavigationMidBasic } from '../Submenus/CourseSubNavigationMidBasic'
import { COURSE_COLOR_CONFIG, COURSE_ICON_CONFIG } from '../../CourseThemeConfig';
import { ICON_LIBRARY_TYPE_CONFIG } from 'configs/IconConfig';

const SpanishCourseMainNavigationConfig = (isAuthenticated) => [
	{
		key: 'level-1-spa',
		path: `${APP_PREFIX_PATH}/spa/nivel-1`,
		title: 'main.upper.nav.level.1',
		sideTitle: 'Iniciante Simple',
		icon: COURSE_ICON_CONFIG.default,
		iconType: ICON_LIBRARY_TYPE_CONFIG.hostedSvg,
		color: COURSE_COLOR_CONFIG.lowerBeginner,
		current: true,
		isRootMenuItem: true,
		isToDisplayInNavigation: true,
		iconPosition: "upperNav",
		isServiceAvailableForUser: false,
		isFree: true,
		course: "Español",
		submenu: [
			...getCourseSubNavigationLowBasic("spa")
		]
	},
	{
		key: 'level-2-spa',
		path: `${APP_PREFIX_PATH}/spa/nivel-2`,
		title: 'main.upper.nav.level.2',
		sideTitle: 'Iniciante Medio',
		icon: COURSE_ICON_CONFIG.default,
		iconType: ICON_LIBRARY_TYPE_CONFIG.hostedSvg,
		color: COURSE_COLOR_CONFIG.midBeginner,
		current: false,
		isRootMenuItem: true,
		isToDisplayInNavigation: true,
		iconPosition: "upperNav",
		isServiceAvailableForUser: false,
		isFree: true,
		course: "Español",
		submenu: [
			...getCourseSubNavigationMidBasic("spa")
		]
	},
	{
		key: 'level-3-spa',
		path: `${APP_PREFIX_PATH}/spa/nivel-3`,
		title: 'main.upper.nav.level.3',
		sideTitle: 'Iniciante Completo',
		icon: COURSE_ICON_CONFIG.default,
		iconType: ICON_LIBRARY_TYPE_CONFIG.hostedSvg,
		color: COURSE_COLOR_CONFIG.upperBeginner,
		current: false,
		isRootMenuItem: true,
		iconPosition: "upperNav",
		isToDisplayInNavigation: true,
		isServiceAvailableForUser: false,
		isFree: true,
		course: "Español",
		submenu: []
	}
]

export default SpanishCourseMainNavigationConfig;
