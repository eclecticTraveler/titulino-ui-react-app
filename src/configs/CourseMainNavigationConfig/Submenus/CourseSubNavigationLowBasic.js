import { APP_PREFIX_PATH } from '../../AppConfig';
import { getLocalizedConfig } from './ConfigureNavigationLocalization';
import { getCoursePracticeInnerSubMenu } from './CoursePracticeInnerSubMenu';
import { 
	ProfileOutlined
  } from '@ant-design/icons';
// TITULINO: Submenu keys must be unique and you are repeating them in submenu many times

export const getCourseSubNavigationLowBasic = (lang) => {
  	return [
	{
		key: 'chapter-sidenav-low-basic-1',
		path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-1/${getLocalizedConfig(lang)?.chapter}-1`,
		title: 'sidenav.low.basic.chapter.1',
		icon: ProfileOutlined,
		iconAlt:'/img/sidebar/school-solid.svg',
		breadcrumb: false,
		submenu: [
			...getCoursePracticeInnerSubMenu(lang, 1, 1)
		]
	},// spell  || flashcards -> Resources || Match || Learn --> pratica|| Test
	{
		key: 'chapter-sidenav-low-basic-2',
		path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-1/${getLocalizedConfig(lang)?.chapter}-2`,
		title: 'sidenav.low.basic.chapter.2',
		icon: '',
		iconAlt:'/img/sidebar/globe-americas-solid.svg',
		breadcrumb: false,
		submenu: [
			...getCoursePracticeInnerSubMenu(lang, 1, 2)
		]
	},
	{
		key: 'chapter-sidenav-low-basic-3',
		path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-1/${getLocalizedConfig(lang)?.chapter}-3`,
		title: 'sidenav.low.basic.chapter.3',
		icon: '',
		iconAlt:'/img/sidebar/calendar-regular.svg',
		breadcrumb: false,
		submenu: [
			...getCoursePracticeInnerSubMenu(lang, 1, 3)
		]
	},
	{
		key: 'chapter-sidenav-low-basic-4',
		path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-1/${getLocalizedConfig(lang)?.chapter}-4`,
		title: 'sidenav.low.basic.chapter.4',
		icon: '',
		iconAlt:'/img/sidebar/biking-solid.svg',
		breadcrumb: false,
		submenu: [
			...getCoursePracticeInnerSubMenu(lang, 1, 4)
		]
	},
	{
		key: 'chapter-sidenav-low-basic-5',
		path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-1/${getLocalizedConfig(lang)?.chapter}-5`,
		title: 'sidenav.low.basic.chapter.5',
		icon: '',
		iconAlt:'/img/sidebar/hiking-solid.svg',
		breadcrumb: false,
		submenu: [
			...getCoursePracticeInnerSubMenu(lang, 1, 5)
		]
	},
	{
		key: 'chapter-sidenav-low-basic-6',
		path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-1/${getLocalizedConfig(lang)?.chapter}-6`,
		title: 'sidenav.low.basic.chapter.6',
		icon: '',
		iconAlt:'/img/sidebar/people-arrows-solid.svg',
		breadcrumb: false,
		submenu: [
			...getCoursePracticeInnerSubMenu(lang, 1, 6)
		]
	},
	{
		key: 'chapter-sidenav-low-basic-7',
		path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-1/${getLocalizedConfig(lang)?.chapter}-7`,
		title: 'sidenav.low.basic.chapter.7',
		icon: '',
		iconAlt:'/img/sidebar/baby-solid.svg',
		breadcrumb: false,
		submenu: [
			...getCoursePracticeInnerSubMenu(lang, 1, 7)
		]
	},
	{
		key: 'chapter-sidenav-low-basic-8',
		path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-1/${getLocalizedConfig(lang)?.chapter}-8`,
		title: 'sidenav.low.basic.chapter.8',
		icon: '',
		iconAlt:'/img/sidebar/pencil-ruler-solid.svg',
		breadcrumb: false,
		submenu: [
			...getCoursePracticeInnerSubMenu(lang, 1, 8)
		]
	},
	{
		key: 'chapter-sidenav-low-basic-9',
		path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-1/${getLocalizedConfig(lang)?.chapter}-9`,
		title: 'sidenav.low.basic.chapter.9',
		icon: '',
		iconAlt:'/img/sidebar/tshirt-solid.svg',
		breadcrumb: false,
		submenu: [
			...getCoursePracticeInnerSubMenu(lang, 1, 9)
		]
	},
	{
		key: 'chapter-sidenav-low-basic-10',
		path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-1/${getLocalizedConfig(lang)?.chapter}-10`,
		title: 'sidenav.low.basic.chapter.10',
		icon: '',
		iconAlt:'/img/sidebar/clock-solid.svg',
		breadcrumb: false,
		submenu: [
			...getCoursePracticeInnerSubMenu(lang, 1, 10)
		]
	},
	{
		key: 'chapter-sidenav-low-basic-11',
		path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-1/${getLocalizedConfig(lang)?.chapter}-11`,
		title: 'sidenav.low.basic.chapter.11',
		icon: '',
		iconAlt:'/img/sidebar/school-solid.svg',
		breadcrumb: false,
		submenu: [
			...getCoursePracticeInnerSubMenu(lang, 1, 11)
		]
	},
	{
		key: 'chapter-sidenav-low-basic-12',
		path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-1/${getLocalizedConfig(lang)?.chapter}-12`,
		title: 'sidenav.low.basic.chapter.12',
		icon: '',
		iconAlt:'/img/sidebar/calendar-alt-regular.svg',
		breadcrumb: false,
		submenu: [
			...getCoursePracticeInnerSubMenu(lang, 1, 12)
		]
	},
	{
		key: 'chapter-sidenav-low-basic-13',
		path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-1/${getLocalizedConfig(lang)?.chapter}-13`,
		title: 'sidenav.low.basic.chapter.13',
		icon: '',
		iconAlt:'/img/sidebar/cloud-sun-rain-solid.svg',
		breadcrumb: false,
		submenu: [
			...getCoursePracticeInnerSubMenu(lang, 1, 13)
		]
	},
	{
		key: 'chapter-sidenav-low-basic-14',
		path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-1/${getLocalizedConfig(lang)?.chapter}-14`,
		title: 'sidenav.low.basic.chapter.14',
		icon: '',
		iconAlt:'/img/sidebar/user-tie-solid.svg',
		breadcrumb: false,
		submenu: [
			...getCoursePracticeInnerSubMenu(lang, 1, 14)
		]
	},
	{
		key: 'chapter-sidenav-low-basic-15',
		path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-1/${getLocalizedConfig(lang)?.chapter}-15`,
		title: 'sidenav.low.basic.chapter.15',
		icon: '',
		iconAlt:'/img/sidebar/hammer-solid.svg',
		breadcrumb: false,
		submenu: [
			...getCoursePracticeInnerSubMenu(lang, 1, 15)
		]
	},
	{
		key: 'chapter-sidenav-low-basic-16',
		path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-1/${getLocalizedConfig(lang)?.chapter}-16`,
		title: 'sidenav.low.basic.chapter.16',
		icon: '',
		iconAlt:'/img/sidebar/utensils-solid.svg',
		breadcrumb: false,
		submenu: [
			...getCoursePracticeInnerSubMenu(lang, 1, 16)
		]
	},
	{
		key: 'chapter-sidenav-low-basic-17',
		path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-1/${getLocalizedConfig(lang)?.chapter}-17`,
		title: 'sidenav.low.basic.chapter.17',
		icon: '',
		iconAlt:'/img/sidebar/hamburger-solid.svg',
		breadcrumb: false,
		submenu: [
			...getCoursePracticeInnerSubMenu(lang, 1, 17)
		]
	},
	{
		key: 'chapter-sidenav-low-basic-18',
		path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-1/${getLocalizedConfig(lang)?.chapter}-18`,
		title: 'sidenav.low.basic.chapter.18',
		icon: '',
		iconAlt:'/img/sidebar/drumstick-bite-solid.svg',
		breadcrumb: false,
		submenu: [
			...getCoursePracticeInnerSubMenu(lang, 1, 18)
		]
	},
	{
		key: 'chapter-sidenav-low-basic-19',
		path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-1/${getLocalizedConfig(lang)?.chapter}-19`,
		title: 'sidenav.low.basic.chapter.19',
		icon: '',
		iconAlt:'/img/sidebar/money-bill-wave-solid.svg',
		breadcrumb: false,
		submenu: [
			...getCoursePracticeInnerSubMenu(lang, 1, 19)
		]
	},
	{
		key: 'chapter-sidenav-low-basic-20',
		path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-1/${getLocalizedConfig(lang)?.chapter}-20`,
		title: 'sidenav.low.basic.chapter.20',
		icon: '',
		iconAlt:'/img/sidebar/house-user-solid.svg',
		breadcrumb: false,
		submenu: [
			...getCoursePracticeInnerSubMenu(lang, 1, 20)
		]
	},
	{
		key: 'chapter-sidenav-low-basic-21',
		path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-1/${getLocalizedConfig(lang)?.chapter}-21`,
		title: 'sidenav.low.basic.chapter.21',
		icon: '',
		iconAlt:'/img/sidebar/shapes-solid.svg',
		breadcrumb: false,
		submenu: [
			...getCoursePracticeInnerSubMenu(lang, 1, 21)
		]
	},
	{
		key: 'chapter-sidenav-low-basic-22',
		path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-1/${getLocalizedConfig(lang)?.chapter}-22`,
		title: 'sidenav.low.basic.chapter.22',
		icon: '',
		iconAlt:'/img/sidebar/place-of-worship-solid.svg',
		breadcrumb: false,
		submenu: [
			...getCoursePracticeInnerSubMenu(lang, 1, 22)
		]
	},
	{
		key: 'chapter-sidenav-low-basic-23',
		path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-1/${getLocalizedConfig(lang)?.chapter}-23`,
		title: 'sidenav.low.basic.chapter.23',
		icon: '',
		iconAlt:'/img/sidebar/user-injured-solid.svg',
		breadcrumb: false,
		submenu: [
			...getCoursePracticeInnerSubMenu(lang, 1, 23)
		]
	},
	{
		key: 'chapter-sidenav-low-basic-24',
		path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-1/${getLocalizedConfig(lang)?.chapter}-24`,
		title: 'sidenav.low.basic.chapter.24',
		icon: '',
		iconAlt:'/img/sidebar/user-md-solid.svg',
		breadcrumb: false,
		submenu: [
			...getCoursePracticeInnerSubMenu(lang, 1, 24)
		]
	}
]
}


