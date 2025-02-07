import { APP_PREFIX_PATH } from '../../AppConfig';
import { getLocalizedConfig } from './ConfigureNavigationLocalization';
import { getCoursePracticeInnerSubMenu } from './CoursePracticeInnerSubMenu';
import { faSchool,
		 faEarthAmericas,
		 faCalendar,
		 faBiking,
		 faHiking,
		 faPeopleArrows,
		 faBaby,
		 faPencilRuler,
		 faTShirt,
		 faClock,
		 faCloudSunRain,		 
		 faUserTie,
		 faHammer,
		 faUtensilSpoon,
		 faHamburger,
		 faDrumstickBite,
		 faMoneyBill1Wave,
		 faHouseUser,
		 faShapes,
		 faPlaceOfWorship,
		 faUserInjured,
		 faUserMd,		
		} from '@fortawesome/free-solid-svg-icons';
import { ICON_LIBRARY_TYPE_CONFIG } from 'configs/IconConfig';
import SearchAssociation from "configs/CourseMainNavigationConfig/English/SearchAssociation";

export const getCourseSubNavigationLowBasic = (lang) => {
	const commonPath = `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-1/${getLocalizedConfig(lang)?.chapter}`;	
  	return [
	{
		key: 'chapter-sidenav-low-basic-1',
		path: `${commonPath}-1`,
		title: 'sidenav.low.basic.chapter.1',
		icon: faSchool,
		iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
		breadcrumb: false,
		submenu: [
			...getCoursePracticeInnerSubMenu(lang, 1, 1)
		]
	},// spell  || flashcards -> Resources || Match || Learn --> pratica|| Test
	{
		key: 'chapter-sidenav-low-basic-2',
		path: `${commonPath}-2`,
		title: 'sidenav.low.basic.chapter.2',
		icon: faEarthAmericas,
		iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
		breadcrumb: false,
		submenu: [
			...getCoursePracticeInnerSubMenu(lang, 1, 2)
		]
	},
	{
		key: 'chapter-sidenav-low-basic-3',
		path: `${commonPath}-3`,
		title: 'sidenav.low.basic.chapter.3',
		icon: faCalendar,
		iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
		breadcrumb: false,
		submenu: [
			...getCoursePracticeInnerSubMenu(lang, 1, 3)
		]
	},
	{
		key: 'chapter-sidenav-low-basic-4',
		path: `${commonPath}-4`,
		title: 'sidenav.low.basic.chapter.4',
		icon: faBiking,
		iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
		breadcrumb: false,
		submenu: [
			...getCoursePracticeInnerSubMenu(lang, 1, 4)
		]
	},
	{
		key: 'chapter-sidenav-low-basic-5',
		path: `${commonPath}-5`,
		title: 'sidenav.low.basic.chapter.5',
		icon: faHiking,
		iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
		breadcrumb: false,
		submenu: [
			...getCoursePracticeInnerSubMenu(lang, 1, 5)
		]
	},
	{
		key: 'chapter-sidenav-low-basic-6',
		path: `${commonPath}-6`,
		title: 'sidenav.low.basic.chapter.6',
		icon: faPeopleArrows,
		iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
		breadcrumb: false,
		submenu: [
			...getCoursePracticeInnerSubMenu(lang, 1, 6)
		]
	},
	{
		key: 'chapter-sidenav-low-basic-7',
		path: `${commonPath}-7`,
		title: 'sidenav.low.basic.chapter.7',
		icon: faBaby,
		iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
		breadcrumb: false,
		submenu: [
			...getCoursePracticeInnerSubMenu(lang, 1, 7)
		]
	},
	{
		key: 'chapter-sidenav-low-basic-8',
		path: `${commonPath}-8`,
		title: 'sidenav.low.basic.chapter.8',
		icon: faPencilRuler,
		iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
		breadcrumb: false,
		submenu: [
			...getCoursePracticeInnerSubMenu(lang, 1, 8)
		]
	},
	{
		key: 'chapter-sidenav-low-basic-9',
		path: `${commonPath}-9`,
		title: 'sidenav.low.basic.chapter.9',
		icon: faTShirt,
		iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
		breadcrumb: false,
		submenu: [
			...getCoursePracticeInnerSubMenu(lang, 1, 9)
		]
	},
	{
		key: 'chapter-sidenav-low-basic-10',
		path: `${commonPath}-10`,
		title: 'sidenav.low.basic.chapter.10',
		icon: faClock,
		iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
		breadcrumb: false,
		submenu: [
			...getCoursePracticeInnerSubMenu(lang, 1, 10)
		]
	},
	{
		key: 'chapter-sidenav-low-basic-11',
		path: `${commonPath}-11`,
		title: 'sidenav.low.basic.chapter.11',
		icon: faSchool,
		iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
		breadcrumb: false,
		submenu: [
			...getCoursePracticeInnerSubMenu(lang, 1, 11)
		]
	},
	{
		key: 'chapter-sidenav-low-basic-12',
		path: `${commonPath}-12`,
		title: 'sidenav.low.basic.chapter.12',
		icon: faCalendar,
		iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
		breadcrumb: false,
		submenu: [
			...getCoursePracticeInnerSubMenu(lang, 1, 12)
		]
	},
	{
		key: 'chapter-sidenav-low-basic-13',
		path: `${commonPath}-13`,
		title: 'sidenav.low.basic.chapter.13',
		icon: faCloudSunRain,
		iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
		breadcrumb: false,
		submenu: [
			...getCoursePracticeInnerSubMenu(lang, 1, 13)
		]
	},
	{
		key: 'chapter-sidenav-low-basic-14',
		path: `${commonPath}-14`,
		title: 'sidenav.low.basic.chapter.14',
		icon: faUserTie,
		iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
		breadcrumb: false,
		submenu: [
			...getCoursePracticeInnerSubMenu(lang, 1, 14)
		]
	},
	{
		key: 'chapter-sidenav-low-basic-15',
		path: `${commonPath}-15`,
		title: 'sidenav.low.basic.chapter.15',
		icon: faHammer,
		iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
		breadcrumb: false,
		submenu: [
			...getCoursePracticeInnerSubMenu(lang, 1, 15)
		]
	},
	{
		key: 'chapter-sidenav-low-basic-16',
		path: `${commonPath}-16`,
		title: 'sidenav.low.basic.chapter.16',
		icon: faUtensilSpoon,
		iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
		breadcrumb: false,
		submenu: [
			...getCoursePracticeInnerSubMenu(lang, 1, 16)
		]
	},
	{
		key: 'chapter-sidenav-low-basic-17',
		path: `${commonPath}-17`,
		title: 'sidenav.low.basic.chapter.17',
		icon: faHamburger,
		iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
		breadcrumb: false,
		submenu: [
			...getCoursePracticeInnerSubMenu(lang, 1, 17)
		]
	},
	{
		key: 'chapter-sidenav-low-basic-18',
		path: `${commonPath}-18`,
		title: 'sidenav.low.basic.chapter.18',
		icon: faDrumstickBite,
		iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
		breadcrumb: false,
		submenu: [
			...getCoursePracticeInnerSubMenu(lang, 1, 18)
		]
	},
	{
		key: 'chapter-sidenav-low-basic-19',
		path: `${commonPath}-19`,
		title: 'sidenav.low.basic.chapter.19',
		icon: faMoneyBill1Wave,
		iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
		breadcrumb: false,
		submenu: [
			...getCoursePracticeInnerSubMenu(lang, 1, 19)
		]
	},
	{
		key: 'chapter-sidenav-low-basic-20',
		path: `${commonPath}-20`,
		title: 'sidenav.low.basic.chapter.20',
		icon: faHouseUser,
		iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
		breadcrumb: false,
		submenu: [
			...getCoursePracticeInnerSubMenu(lang, 1, 20)
		]
	},
	{
		key: 'chapter-sidenav-low-basic-21',
		path: `${commonPath}-21`,
		title: 'sidenav.low.basic.chapter.21',
		icon: faShapes,
		iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
		breadcrumb: false,
		submenu: [
			...getCoursePracticeInnerSubMenu(lang, 1, 21)
		]
	},
	{
		key: 'chapter-sidenav-low-basic-22',
		path: `${commonPath}-22`,
		title: 'sidenav.low.basic.chapter.22',
		icon: faPlaceOfWorship,
		iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
		breadcrumb: false,
		submenu: [
			...getCoursePracticeInnerSubMenu(lang, 1, 22)
		]
	},
	{
		key: 'chapter-sidenav-low-basic-23',
		path: `${commonPath}-23`,
		title: 'sidenav.low.basic.chapter.23',
		icon: faUserInjured,
		iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
		breadcrumb: false,
		submenu: [
			...getCoursePracticeInnerSubMenu(lang, 1, 23)
		]
	},
	{
		key: 'chapter-sidenav-low-basic-24',
		path: `${commonPath}-24`,
		title: 'sidenav.low.basic.chapter.24',
		icon: faUserMd,
		iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
		breadcrumb: false,
		submenu: [
			...getCoursePracticeInnerSubMenu(lang, 1, 24)
		]
	}
]
}


