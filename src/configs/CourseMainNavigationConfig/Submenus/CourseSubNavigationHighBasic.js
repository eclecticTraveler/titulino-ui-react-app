import { APP_PREFIX_PATH } from '../../AppConfig';
import { getLocalizedConfig } from './ConfigureNavigationLocalization';
import { getCoursePracticeInnerSubMenu } from './CoursePracticeInnerSubMenu';
// TITULINO: Submenu keys must be unique and you are repeating them in submenu many times

export const getCourseSubNavigationHighBasic = (lang) => {			
	return [
		{
			key: 'sidenav.chapter.1',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-3/${getLocalizedConfig(lang)?.chapter}-1`,
			title: 'sidenav.chapter.1',
			icon: '',
			iconAlt:'/img/sidebar/human-solid.svg',
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 3, 1)
			]
		},
		{
			key: 'sidenav.chapter.2',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-3/${getLocalizedConfig(lang)?.chapter}-2`,
			title: 'sidenav.chapter.2',
			icon: '',
			iconAlt:'/img/sidebar/children-solid.svg',
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 3, 2)
			]
		},
		{
			key: 'sidenav.chapter.3',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-3/${getLocalizedConfig(lang)?.chapter}-3`,
			title: 'sidenav.chapter.3',
			icon: '',
			iconAlt:'/img/sidebar/eye-solid.svg',
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 3, 3)
			]
		}
		// {
		// 	key: 'sidenav.chapter.4',
		// 	path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-3/${getLocalizedConfig(lang)?.chapter}-4`,
		// 	title: 'sidenav.chapter.4',
		// 	icon: '',
		// 	iconAlt:'/img/sidebar/sitemap-solid.svg',
		// 	breadcrumb: false,
		// 	submenu: [
		// 		...getCoursePracticeInnerSubMenu(lang, 3, 4)
		// 	]
		// },
		// {
		// 	key: 'sidenav.chapter.5',
		// 	path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-3/${getLocalizedConfig(lang)?.chapter}-5`,
		// 	title: 'sidenav.chapter.5',
		// 	icon: '',
		// 	iconAlt:'/img/sidebar/expand-arrows-alt-solid.svg',
		// 	breadcrumb: false,
		// 	submenu: [
		// 		...getCoursePracticeInnerSubMenu(lang, 3, 5)
		// 	]
		// },
		// {
		// 	key: 'sidenav.chapter.6',
		// 	path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-3/${getLocalizedConfig(lang)?.chapter}-6`,
		// 	title: 'sidenav.chapter.6',
		// 	icon: '',
		// 	iconAlt:'/img/sidebar/sad-tear-solid.svg',
		// 	breadcrumb: false,
		// 	submenu: [
		// 		...getCoursePracticeInnerSubMenu(lang, 3, 6)
		// 	]
		// },
		// {
		// 	key: 'sidenav.chapter.7',
		// 	path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-3/${getLocalizedConfig(lang)?.chapter}-7`,
		// 	title: 'sidenav.chapter.7',
		// 	icon: '',
		// 	iconAlt:'/img/sidebar/hands-helping-solid.svg',
		// 	breadcrumb: false,
		// 	submenu: [
		// 		...getCoursePracticeInnerSubMenu(lang, 3, 7)
		// 	]
		// },
		// {
		// 	key: 'sidenav.chapter.8',
		// 	path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-3/${getLocalizedConfig(lang)?.chapter}-8`,
		// 	title: 'sidenav.chapter.8',
		// 	icon: '',
		// 	iconAlt:'/img/sidebar/home-solid.svg',
		// 	breadcrumb: false,
		// 	submenu: [
		// 		...getCoursePracticeInnerSubMenu(lang, 3, 8)
		// 	]
		// },
		// {
		// 	key: 'sidenav.chapter.9',
		// 	path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-3/${getLocalizedConfig(lang)?.chapter}-9`,
		// 	title: 'sidenav.chapter.9',
		// 	icon: '',
		// 	iconAlt:'/img/sidebar/globe-africa-solid.svg',
		// 	breadcrumb: false,
		// 	submenu: [
		// 		...getCoursePracticeInnerSubMenu(lang, 3, 9)
		// 	]
		// },
		// {
		// 	key: 'sidenav.chapter.10',
		// 	path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-3/${getLocalizedConfig(lang)?.chapter}-10`,
		// 	title: 'sidenav.chapter.10',
		// 	icon: '',
		// 	iconAlt:'/img/sidebar/calendar-alt-regular.svg ',
		// 	breadcrumb: false,
		// 	submenu: [
		// 		...getCoursePracticeInnerSubMenu(lang, 3, 10)
		// 	]
		// },
		// {
		// 	key: 'sidenav.chapter.11',
		// 	path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-3/${getLocalizedConfig(lang)?.chapter}-11`,
		// 	title: 'sidenav.chapter.11',
		// 	icon: '',
		// 	iconAlt:'/img/sidebar/user-clock-solid.svg',
		// 	breadcrumb: false,
		// 	submenu: [
		// 		...getCoursePracticeInnerSubMenu(lang, 3, 11)
		// 	]
		// },
		// {
		// 	key: 'sidenav.chapter.12',
		// 	path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-3/${getLocalizedConfig(lang)?.chapter}-12`,
		// 	title: 'sidenav.chapter.12',
		// 	icon: '',
		// 	iconAlt:'/img/sidebar/history-solid.svg',
		// 	breadcrumb: false,
		// 	submenu: [
		// 		...getCoursePracticeInnerSubMenu(lang, 3, 12)
		// 	]
		// },
		// {
		// 	key: 'sidenav.chapter.13',
		// 	path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-3/${getLocalizedConfig(lang)?.chapter}-13`,
		// 	title: 'sidenav.chapter.13',
		// 	icon: '',
		// 	iconAlt:'/img/sidebar/history-solid.svg',
		// 	breadcrumb: false,
		// 	submenu: [
		// 		...getCoursePracticeInnerSubMenu(lang, 3, 13)
		// 	]
		// },
		// {
		// 	key: 'sidenav.chapter.14',
		// 	path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-3/${getLocalizedConfig(lang)?.chapter}-14`,
		// 	title: 'sidenav.chapter.14',
		// 	icon: '',
		// 	iconAlt:'/img/sidebar/person-booth-solid.svg',
		// 	breadcrumb: false,
		// 	submenu: [
		// 		...getCoursePracticeInnerSubMenu(lang, 3, 14)
		// 	]
		// },
		// {
		// 	key: 'sidenav.chapter.15',
		// 	path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-3/${getLocalizedConfig(lang)?.chapter}-15`,
		// 	title: 'sidenav.chapter.15',
		// 	icon: '',
		// 	iconAlt:'/img/sidebar/tags-solid.svg',
		// 	breadcrumb: false,
		// 	submenu: [
		// 		...getCoursePracticeInnerSubMenu(lang, 3, 15)
		// 	]
		// },
		// {
		// 	key: 'sidenav.chapter.16',
		// 	path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-3/${getLocalizedConfig(lang)?.chapter}-16`,
		// 	title: 'sidenav.chapter.16',
		// 	icon: '',
		// 	iconAlt:'/img/sidebar/mosque-solid.svg',
		// 	breadcrumb: false,
		// 	submenu: [
		// 		...getCoursePracticeInnerSubMenu(lang, 3, 16)
		// 	]
		// },
		// {
		// 	key: 'sidenav.chapter.17',
		// 	path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-3/${getLocalizedConfig(lang)?.chapter}-17`,
		// 	title: 'sidenav.chapter.17',
		// 	icon: '',
		// 	iconAlt:'/img/sidebar/birthday-cake-solid.svg',
		// 	breadcrumb: false,
		// 	submenu: [
		// 		...getCoursePracticeInnerSubMenu(lang, 3, 17)
		// 	]
		// },
		// {
		// 	key: 'sidenav.chapter.18',
		// 	path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-3/${getLocalizedConfig(lang)?.chapter}-18`,
		// 	title: 'sidenav.chapter.18',
		// 	icon: '',
		// 	iconAlt:'/img/sidebar/snowman-solid.svg',
		// 	breadcrumb: false,
		// 	submenu: [
		// 		...getCoursePracticeInnerSubMenu(lang, 3, 18)
		// 	]
		// },
		// {
		// 	key: 'sidenav.chapter.19',
		// 	path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-3/${getLocalizedConfig(lang)?.chapter}-19`,
		// 	title: 'sidenav.chapter.19',
		// 	icon: '',
		// 	iconAlt:'/img/sidebar/plane-departure-solid.svg',
		// 	breadcrumb: false,
		// 	submenu: [
		// 		...getCoursePracticeInnerSubMenu(lang, 3, 19)
		// 	]
		// },
		// {
		// 	key: 'sidenav.chapter.20',
		// 	path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-3/${getLocalizedConfig(lang)?.chapter}-20`,
		// 	title: 'sidenav.chapter.20',
		// 	icon: '',
		// 	iconAlt:'/img/sidebar/user-md-solid.svg',
		// 	breadcrumb: false,
		// 	submenu: [
		// 		...getCoursePracticeInnerSubMenu(lang, 3, 20)
		// 	]
		// },
		// {
		// 	key: 'sidenav.chapter.21',
		// 	path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-3/${getLocalizedConfig(lang)?.chapter}-21`,
		// 	title: 'sidenav.chapter.21',
		// 	icon: '',
		// 	iconAlt:'/img/sidebar/user-injured-solid.svg',
		// 	breadcrumb: false,
		// 	submenu: [
		// 		...getCoursePracticeInnerSubMenu(lang, 3, 21)
		// 	]
		// },
		// {
		// 	key: 'sidenav.chapter.22',
		// 	path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-3/${getLocalizedConfig(lang)?.chapter}-22`,
		// 	title: 'sidenav.chapter.22',
		// 	icon: '',
		// 	iconAlt:'/img/sidebar/place-of-worship-solid.svg',
		// 	breadcrumb: false,
		// 	submenu: [
		// 		...getCoursePracticeInnerSubMenu(lang, 3, 22)
		// 	]
		// },
		// {
		// 	key: 'sidenav.chapter.23',
		// 	path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-3/${getLocalizedConfig(lang)?.chapter}-23`,
		// 	title: 'sidenav.chapter.23',
		// 	icon: '',
		// 	iconAlt:'/img/sidebar/glass-cheers-solid.svg',
		// 	breadcrumb: false,
		// 	submenu: [
		// 		...getCoursePracticeInnerSubMenu(lang, 3, 23)
		// 	]
		// },
		// {
		// 	key: 'sidenav.chapter.24',
		// 	path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-3/${getLocalizedConfig(lang)?.chapter}-24`,
		// 	title: 'sidenav.chapter.24',
		// 	icon: '',
		// 	iconAlt:'/img/sidebar/bullseye-solid.svg',
		// 	breadcrumb: false,
		// 	submenu: [
		// 		...getCoursePracticeInnerSubMenu(lang, 3, 24)
		// 	]
		// }
	]
}

