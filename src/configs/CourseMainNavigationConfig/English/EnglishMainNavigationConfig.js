import { APP_PREFIX_PATH, SELECTED_COURSE_PATH, AUTH_PREFIX_PATH } from '../../AppConfig'
import { getCourseSubNavigationLowBasic } from '../Submenus/CourseSubNavigationLowBasic' 
import { getCourseSubNavigationMidBasic } from '../Submenus/CourseSubNavigationMidBasic'
import { COURSE_COLOR_CONFIG, COURSE_ICON_CONFIG } from '../../../configs/CourseThemeConfig'
import {GoogleSVG} from '../../../assets/svg/icon'

const dashBoardNavTree = [
	{
		key: 'level-1',
		path: `${APP_PREFIX_PATH}/eng/level-1`,
		title: 'Level 1',
		sideTitle: 'Lower Beginner',
		icon: '',
		iconAlt: COURSE_ICON_CONFIG.default,
		color: COURSE_COLOR_CONFIG.lowerBeginner,
		current: true,
		isRootMenuItem: true,
		iconPosition: "upperNav",
		isServiceAvailableForUser: false,
		isSubmenuCorpType: false,
		isFree: true,
		course: "English",
		submenu: [
			...getCourseSubNavigationLowBasic("eng")
		]
	},
	{
		key: 'level-2',
		path: `${APP_PREFIX_PATH}/eng/level-2`,
		title: 'Level 2',
		sideTitle: 'Mid Beginner',
		icon: '',
		iconAlt: COURSE_ICON_CONFIG.default,
		color: COURSE_COLOR_CONFIG.midBeginner,
		current: false,
		isRootMenuItem: true,
		iconPosition: "upperNav",
		isServiceAvailableForUser: false,
		isSubmenuCorpType: false,
		isFree: true,
		course: "English",
		submenu: [
			...getCourseSubNavigationMidBasic("eng")
		]
	},
	{
		key: 'level-3',
		path: `${APP_PREFIX_PATH}/eng/level-3`,
		title: 'Level 3',
		sideTitle: 'Upper Beginner',
		icon: '',
		iconAlt: COURSE_ICON_CONFIG.default,
		color: COURSE_COLOR_CONFIG.upperBeginner,
		current: false,
		isRootMenuItem: true,
		iconPosition: "upperNav",
		isServiceAvailableForUser: false,
		isSubmenuCorpType: false,
		isFree: false,
		course: "English",
		submenu: []
	}
]

const englishMainNavigationConfig = [
  ...dashBoardNavTree
]

export default englishMainNavigationConfig;
