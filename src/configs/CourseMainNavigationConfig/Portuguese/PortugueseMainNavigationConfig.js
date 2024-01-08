import { APP_PREFIX_PATH, AUTH_PREFIX_PATH } from '../../AppConfig'
import {GoogleSVG} from '../../../assets/svg/icon'
import { getCourseSubNavigationLowBasic } from '../Submenus/CourseSubNavigationLowBasic' 
import { getCourseSubNavigationMidBasic } from '../Submenus/CourseSubNavigationMidBasic'
import { COURSE_COLOR_CONFIG } from '../../../configs/CourseThemeConfig'
const dashBoardNavTree = [
	{
		key: 'level1',
		path: `${APP_PREFIX_PATH}/por/nivel-1`,
		title: 'Nivel 1',
		sideTitle: 'Iniciante Basico',
		icon: '',
		iconAlt:'/img/mainnav/Experience.svg',
		color: COURSE_COLOR_CONFIG.lowerBeginner,
		current: true,
		isRootMenuItem: true,
		iconPosition: "upperNav",
		isServiceAvailableForUser: false,
		isSubmenuCorpType: false,
		isFree: true,
		course: "Português",
		submenu: [
			...getCourseSubNavigationLowBasic("por")
		]
	},
	{
		key: 'level2',
		path: `${APP_PREFIX_PATH}/por/nivel-2`,
		title: 'Nivel 2',
		sideTitle: 'Iniciante Inter',
		icon: '',
		iconAlt:'/img/mainnav/Training.svg',
		color: COURSE_COLOR_CONFIG.midBeginner,
		current: false,
		isRootMenuItem: true,
		iconPosition: "upperNav",
		isServiceAvailableForUser: false,
		isSubmenuCorpType: false,
		isFree: true,
		course: "Português",
		submenu: [
			...getCourseSubNavigationMidBasic("por")
		]
	},
	{
		key: 'level3',
		path: `${APP_PREFIX_PATH}/por/nivel-3`,
		title: 'Nivel 3',
		sideTitle: 'Iniciante Superior',
		icon: '',
		iconAlt:'/img/mainnav/ReviewManager.svg',
		color: COURSE_COLOR_CONFIG.upperBeginner,
		current: false,
		isRootMenuItem: true,
		iconPosition: "upperNav",
		isServiceAvailableForUser: false,
		isSubmenuCorpType: false,
		isFree: true,
		course: "Português",
		submenu: [
			
		]
	}
]

const portugueseMainNavigationConfig = [
  ...dashBoardNavTree
]

export default portugueseMainNavigationConfig;
