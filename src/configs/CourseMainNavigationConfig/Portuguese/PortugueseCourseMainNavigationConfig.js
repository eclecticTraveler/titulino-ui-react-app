import { APP_PREFIX_PATH, AUTH_PREFIX_PATH } from '../../AppConfig';
import { getCourseSubNavigationLowBasic } from '../Submenus/CourseSubNavigationLowBasic';
import { getCourseSubNavigationMidBasic } from '../Submenus/CourseSubNavigationMidBasic';
import { COURSE_COLOR_CONFIG, COURSE_ICON_CONFIG } from '../../CourseThemeConfig';
import { ICON_LIBRARY_TYPE_CONFIG } from 'configs/IconConfig';

const PortugueseCourseMainNavigationConfig = (isAuthenticated) => [
	{
		key: 'level-1-por',
		path: `${APP_PREFIX_PATH}/por/nivel-1`,
		title: 'main.upper.nav.level.1',
		sideTitle: 'Iniciante Basico',
		icon: COURSE_ICON_CONFIG.default,
		iconType: ICON_LIBRARY_TYPE_CONFIG.hostedSvg,
		color: COURSE_COLOR_CONFIG.lowerBeginner,
		current: true,
		isRootMenuItem: true,
		iconPosition: "upperNav",
		isServiceAvailableForUser: false,
		isToDisplayInNavigation: true,
		isFree: true,
		course: "Português",
		submenu: [
			...getCourseSubNavigationLowBasic("por")
		]
	},
	{
		key: 'level-2-por',
		path: `${APP_PREFIX_PATH}/por/nivel-2`,
		title: 'main.upper.nav.level.2',
		sideTitle: 'Iniciante Inter',
		icon: COURSE_ICON_CONFIG.default,
		iconType: ICON_LIBRARY_TYPE_CONFIG.hostedSvg,
		color: COURSE_COLOR_CONFIG.midBeginner,
		current: false,
		isRootMenuItem: true,
		iconPosition: "upperNav",
		isServiceAvailableForUser: false,
		isToDisplayInNavigation: false,
		isFree: true,
		course: "Português",
		submenu: [
			...getCourseSubNavigationMidBasic("por")
		]
	},
	{
		key: 'level-3-por',
		path: `${APP_PREFIX_PATH}/por/nivel-3`,
		title: 'main.upper.nav.level.3',
		sideTitle: 'Iniciante Superior',
		icon: COURSE_ICON_CONFIG.default,
		iconType: ICON_LIBRARY_TYPE_CONFIG.hostedSvg,
		color: COURSE_COLOR_CONFIG.upperBeginner,
		current: false,
		isRootMenuItem: true,
		isToDisplayInNavigation: true,
		iconPosition: "upperNav",
		isServiceAvailableForUser: false,
		isFree: true,
		course: "Português",
		submenu: [
			
		]
	}
]

export default PortugueseCourseMainNavigationConfig;
