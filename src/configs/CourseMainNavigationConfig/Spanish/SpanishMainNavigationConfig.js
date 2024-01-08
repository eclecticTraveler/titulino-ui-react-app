import { APP_PREFIX_PATH, AUTH_PREFIX_PATH } from '../../AppConfig'
import { getCourseSubNavigationLowBasic } from '../Submenus/CourseSubNavigationLowBasic' 
import { getCourseSubNavigationMidBasic } from '../Submenus/CourseSubNavigationMidBasic'
import { COURSE_COLOR_CONFIG } from '../../../configs/CourseThemeConfig'
import {GoogleSVG} from '../../../assets/svg/icon'
const dashBoardNavTree = [
	{
		key: 'level1',
		path: `${APP_PREFIX_PATH}/spa/nivel-1`,
		title: 'Nivel 1',
		sideTitle: 'Iniciante Simple',
		icon: '',
		iconAlt:'/img/mainnav/Experience.svg',
		color: COURSE_COLOR_CONFIG.lowerBeginner,
		current: true,
		isRootMenuItem: true,
		iconPosition: "upperNav",
		isServiceAvailableForUser: false,
		isSubmenuCorpType: false,
		isFree: true,
		course: "Español",
		submenu: [
			...getCourseSubNavigationLowBasic("spa")
		]
	},
	{
		key: 'level2',
		path: `${APP_PREFIX_PATH}/spa/nivel-2`,
		title: 'Nivel 2',
		sideTitle: 'Iniciante Medio',
		icon: '',
		iconAlt:'/img/mainnav/Training.svg',
		color: COURSE_COLOR_CONFIG.midBeginner,
		current: false,
		isRootMenuItem: true,
		iconPosition: "upperNav",
		isServiceAvailableForUser: false,
		isSubmenuCorpType: false,
		isFree: true,
		course: "Español",
		submenu: [
			...getCourseSubNavigationMidBasic("spa")
		]
	},
	{
		key: 'level3',
		path: `${APP_PREFIX_PATH}/spa/nivel-3`,
		title: 'Nivel 3',
		sideTitle: 'Iniciante Completo',
		icon: '',
		iconAlt:'/img/mainnav/ReviewManager.svg',
		color: COURSE_COLOR_CONFIG.upperBeginner,
		current: false,
		isRootMenuItem: true,
		iconPosition: "upperNav",
		isServiceAvailableForUser: false,
		isSubmenuCorpType: false,
		isFree: true,
		course: "Español",
		submenu: []
	}
]

const spanishMainNavigationConfig = [
  ...dashBoardNavTree
]

export default spanishMainNavigationConfig;
