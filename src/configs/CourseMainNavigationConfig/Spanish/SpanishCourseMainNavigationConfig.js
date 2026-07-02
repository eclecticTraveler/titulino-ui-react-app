import { APP_PREFIX_PATH } from '../../AppConfig'
import { getCourseSubNavigationLowBasic } from '../Submenus/CourseSubNavigationLowBasic'
import { getCourseSubNavigationMidBasic } from '../Submenus/CourseSubNavigationMidBasic'
import { CourseSubNavigationMeditacionesTheme } from '../Submenus/CourseSubNavigationMeditacionesTheme'
import { AuthCourseSubNavigationMeditacionesTheme } from '../Submenus/AuthCourseSubNavigationMeditacionesTheme'
import { COURSE_COLOR_CONFIG, COURSE_ICON_CONFIG } from '../../CourseThemeConfig';
import { ICON_LIBRARY_TYPE_CONFIG } from 'configs/IconConfig';

const SpanishCourseMainNavigationConfig = (isAuthenticated, coursesByTheme) => [
	{
		key: 'level-1-spa',
		path: `${APP_PREFIX_PATH}/es/nivel-1`,
		title: 'main.upper.nav.level.1',
		sideTitle: 'Iniciante Simple',
		icon: COURSE_ICON_CONFIG.default,
		iconType: ICON_LIBRARY_TYPE_CONFIG.hostedSvg,
		color: COURSE_COLOR_CONFIG.lowerBeginner,
		current: true,
		isRootMenuItem: true,
		isToDisplayInNavigation: false,
		iconPosition: "upperNav",
		isServiceAvailableForUser: false,
		isFree: true,
		course: "Español",
		topSubmenu: [],
		// TODO: confirm nameToCourseCodeKey
		submenu: [
			...getCourseSubNavigationLowBasic("es")
		]
	},
	{
		key: 'level-2-spa',
		path: `${APP_PREFIX_PATH}/es/nivel-2`,
		title: 'main.upper.nav.level.2',
		sideTitle: 'Iniciante Medio',
		icon: COURSE_ICON_CONFIG.default,
		iconType: ICON_LIBRARY_TYPE_CONFIG.hostedSvg,
		color: COURSE_COLOR_CONFIG.midBeginner,
		current: false,
		isRootMenuItem: true,
		isToDisplayInNavigation: false,
		iconPosition: "upperNav",
		isServiceAvailableForUser: false,
		isFree: true,
		course: "Español",
		topSubmenu: [],
		// TODO: confirm nameToCourseCodeKey
		submenu: [
			...getCourseSubNavigationMidBasic("es")
		]
	},
	{
		key: 'level-3-spa',
		path: `${APP_PREFIX_PATH}/es/nivel-3`,
		title: 'main.upper.nav.level.3',
		sideTitle: 'Iniciante Completo',
		icon: COURSE_ICON_CONFIG.default,
		iconType: ICON_LIBRARY_TYPE_CONFIG.hostedSvg,
		color: COURSE_COLOR_CONFIG.upperBeginner,
		current: false,
		isRootMenuItem: true,
		iconPosition: "upperNav",
		isToDisplayInNavigation: false,
		isServiceAvailableForUser: false,
		isFree: true,
		course: "Español",
		topSubmenu: [],
		// TODO: confirm nameToCourseCodeKey
		submenu: []
	},
	{
		key: 'level-meditaciones-spa',
		nameToCourseCodeKey: 'meditaciones',
		path: `${APP_PREFIX_PATH}/es/nivel-meditaciones`,
		title: 'main.upper.nav.theme.level.meditaciones',
		sideTitle: 'Meditaciones',
		icon: COURSE_ICON_CONFIG.default,
		iconType: ICON_LIBRARY_TYPE_CONFIG.hostedSvg,
		color: COURSE_COLOR_CONFIG.meditacionesTheme,
		current: false,
		isRootMenuItem: true,
		iconPosition: "upperNav",
		isServiceAvailableForUser: false,
		isToDisplayInNavigation: true,
		isFree: false,
		course: "Español",
		topSubmenu: [],
		submenu: [
			...(isAuthenticated
				? AuthCourseSubNavigationMeditacionesTheme("es", coursesByTheme?.['meditaciones'])
				: CourseSubNavigationMeditacionesTheme("es")
			)
		]
	}
]

export default SpanishCourseMainNavigationConfig;
