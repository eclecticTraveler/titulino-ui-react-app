import { APP_PREFIX_PATH } from '../../AppConfig';
import { getLocalizedConfig } from './ConfigureNavigationLocalization';
import { getCoursePracticeInnerSubMenu } from './CoursePracticeInnerSubMenu';
// TITULINO: Submenu keys must be unique and you are repeating them in submenu many times

export const getCourseSubNavigationMidBasic = (lang) => {			
	return [
		{
			key: 'sidenav.mid.basic.chapter.1',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-2/${getLocalizedConfig(lang)?.chapter}-1`,
			title: 'sidenav.mid.basic.chapter.1',
			icon: '',
			iconAlt:'/img/sidebar/school-solid.svg',
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 2, 1)
			]
		},
		{
			key: 'sidenav.mid.basic.chapter.2',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-2/${getLocalizedConfig(lang)?.chapter}-2`,
			title: 'sidenav.mid.basic.chapter.2',
			icon: '',
			iconAlt:'/img/sidebar/flag-solid.svg',
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 2, 2)
			]
		},
		{
			key: 'sidenav.mid.basic.chapter.3',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-2/${getLocalizedConfig(lang)?.chapter}-3`,
			title: 'sidenav.mid.basic.chapter.3',
			icon: '',
			iconAlt:'/img/sidebar/running-solid.svg',
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 2, 3)
			]
		},
		{
			key: 'sidenav.mid.basic.chapter.4',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-2/${getLocalizedConfig(lang)?.chapter}-4`,
			title: 'sidenav.mid.basic.chapter.4',
			icon: '',
			iconAlt:'/img/sidebar/sitemap-solid.svg',
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 2, 4)
			]
		},
		{
			key: 'sidenav.mid.basic.chapter.5',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-2/${getLocalizedConfig(lang)?.chapter}-5`,
			title: 'sidenav.mid.basic.chapter.5',
			icon: '',
			iconAlt:'/img/sidebar/expand-arrows-alt-solid.svg',
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 2, 5)
			]
		},
		{
			key: 'sidenav.mid.basic.chapter.6',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-2/${getLocalizedConfig(lang)?.chapter}-6`,
			title: 'sidenav.mid.basic.chapter.6',
			icon: '',
			iconAlt:'/img/sidebar/sad-tear-solid.svg',
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 2, 6)
			]
		},
		{
			key: 'sidenav.mid.basic.chapter.7',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-2/${getLocalizedConfig(lang)?.chapter}-7`,
			title: 'sidenav.mid.basic.chapter.7',
			icon: '',
			iconAlt:'/img/sidebar/hands-helping-solid.svg',
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 2, 7)
			]
		},
		{
			key: 'sidenav.mid.basic.chapter.8',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-2/${getLocalizedConfig(lang)?.chapter}-8`,
			title: 'sidenav.mid.basic.chapter.8',
			icon: '',
			iconAlt:'/img/sidebar/home-solid.svg',
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 2, 8)
			]
		},
		{
			key: 'sidenav.mid.basic.chapter.9',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-2/${getLocalizedConfig(lang)?.chapter}-9`,
			title: 'sidenav.mid.basic.chapter.9',
			icon: '',
			iconAlt:'/img/sidebar/globe-africa-solid.svg',
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 2, 9)
			]
		},
		{
			key: 'sidenav.mid.basic.chapter.10',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-2/${getLocalizedConfig(lang)?.chapter}-10`,
			title: 'sidenav.mid.basic.chapter.10',
			icon: '',
			iconAlt:'/img/sidebar/calendar-alt-regular.svg ',
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 2, 10)
			]
		},
		{
			key: 'sidenav.mid.basic.chapter.11',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-2/${getLocalizedConfig(lang)?.chapter}-11`,
			title: 'sidenav.mid.basic.chapter.11',
			icon: '',
			iconAlt:'/img/sidebar/user-clock-solid.svg',
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 2, 11)
			]
		},
		{
			key: 'sidenav.mid.basic.chapter.12',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-2/${getLocalizedConfig(lang)?.chapter}-12`,
			title: 'sidenav.mid.basic.chapter.12',
			icon: '',
			iconAlt:'/img/sidebar/history-solid.svg',
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 2, 12)
			]
		},
		{
			key: 'sidenav.mid.basic.chapter.13',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-2/${getLocalizedConfig(lang)?.chapter}-13`,
			title: 'sidenav.mid.basic.chapter.13',
			icon: '',
			iconAlt:'/img/sidebar/history-solid.svg',
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 2, 13)
			]
		},
		{
			key: 'sidenav.mid.basic.chapter.14',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-2/${getLocalizedConfig(lang)?.chapter}-14`,
			title: 'sidenav.mid.basic.chapter.14',
			icon: '',
			iconAlt:'/img/sidebar/person-booth-solid.svg',
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 2, 14)
			]
		},
		{
			key: 'sidenav.mid.basic.chapter.15',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-2/${getLocalizedConfig(lang)?.chapter}-15`,
			title: 'sidenav.mid.basic.chapter.15',
			icon: '',
			iconAlt:'/img/sidebar/tags-solid.svg',
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 2, 15)
			]
		},
		{
			key: 'sidenav.mid.basic.chapter.16',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-2/${getLocalizedConfig(lang)?.chapter}-16`,
			title: 'sidenav.mid.basic.chapter.16',
			icon: '',
			iconAlt:'/img/sidebar/mosque-solid.svg',
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 2, 16)
			]
		},
		{
			key: 'sidenav.mid.basic.chapter.17',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-2/${getLocalizedConfig(lang)?.chapter}-17`,
			title: 'sidenav.mid.basic.chapter.17',
			icon: '',
			iconAlt:'/img/sidebar/birthday-cake-solid.svg',
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 2, 17)
			]
		},
		{
			key: 'sidenav.mid.basic.chapter.18',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-2/${getLocalizedConfig(lang)?.chapter}-18`,
			title: 'sidenav.mid.basic.chapter.18',
			icon: '',
			iconAlt:'/img/sidebar/snowman-solid.svg',
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 2, 18)
			]
		},
		{
			key: 'sidenav.mid.basic.chapter.19',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-2/${getLocalizedConfig(lang)?.chapter}-19`,
			title: 'sidenav.mid.basic.chapter.19',
			icon: '',
			iconAlt:'/img/sidebar/plane-departure-solid.svg',
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 2, 19)
			]
		},
		{
			key: 'sidenav.mid.basic.chapter.20',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-2/${getLocalizedConfig(lang)?.chapter}-20`,
			title: 'sidenav.mid.basic.chapter.20',
			icon: '',
			iconAlt:'/img/sidebar/user-md-solid.svg',
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 2, 20)
			]
		},
		{
			key: 'sidenav.mid.basic.chapter.21',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-2/${getLocalizedConfig(lang)?.chapter}-21`,
			title: 'sidenav.mid.basic.chapter.21',
			icon: '',
			iconAlt:'/img/sidebar/user-injured-solid.svg',
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 2, 21)
			]
		},
		{
			key: 'sidenav.mid.basic.chapter.22',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-2/${getLocalizedConfig(lang)?.chapter}-22`,
			title: 'sidenav.mid.basic.chapter.22',
			icon: '',
			iconAlt:'/img/sidebar/place-of-worship-solid.svg',
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 2, 22)
			]
		},
		{
			key: 'sidenav.mid.basic.chapter.23',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-2/${getLocalizedConfig(lang)?.chapter}-23`,
			title: 'sidenav.mid.basic.chapter.23',
			icon: '',
			iconAlt:'/img/sidebar/glass-cheers-solid.svg',
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 2, 23)
			]
		},
		{
			key: 'sidenav.mid.basic.chapter.24',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-2/${getLocalizedConfig(lang)?.chapter}-24`,
			title: 'sidenav.mid.basic.chapter.24',
			icon: '',
			iconAlt:'/img/sidebar/bullseye-solid.svg',
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 2, 24)
			]
		}
	]
}

