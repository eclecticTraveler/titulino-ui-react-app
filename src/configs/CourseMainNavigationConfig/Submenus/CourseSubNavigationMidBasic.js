import { APP_PREFIX_PATH } from '../../AppConfig';
import { getLocalizedConfig } from './ConfigureNavigationLocalization';
import { getCoursePracticeInnerSubMenu } from './CoursePracticeInnerSubMenu';
import { ICON_LIBRARY_TYPE_CONFIG } from 'configs/IconConfig';
import { faSchool,
	faFlag,
	faRunning,
	faSitemap,
	faExpandAlt,
	faSadTear,
	faHandsHelping,
	faHome,
	faGlobeAfrica,
	faCalendarAlt,
	faUserClock,
	faHistory,
	faPersonBooth,
	faTags,
	faMosque,
	faBirthdayCake,
	faSnowman,
	faPlaneDeparture,
	faUserMd,
	faUserInjured,
	faPlaceOfWorship,
	faGlassCheers,
	faBullseye,
   } from '@fortawesome/free-solid-svg-icons';

export const getCourseSubNavigationMidBasic = (lang) => {			
	return [
		{
			key: 'chapter-sidenav-mid-basic-1',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-2/${getLocalizedConfig(lang)?.chapter}-1`,
			title: 'sidenav.mid.basic.chapter.1',
			icon: faSchool,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 2, 1)
			]
		},
		{
			key: 'chapter-sidenav-mid-basic-2',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-2/${getLocalizedConfig(lang)?.chapter}-2`,
			title: 'sidenav.mid.basic.chapter.2',
			icon: faFlag,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 2, 2)
			]
		},
		{
			key: 'chapter-sidenav-mid-basic-3',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-2/${getLocalizedConfig(lang)?.chapter}-3`,
			title: 'sidenav.mid.basic.chapter.3',
			icon: faRunning,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 2, 3)
			]
		},
		{
			key: 'chapter-sidenav-mid-basic-4',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-2/${getLocalizedConfig(lang)?.chapter}-4`,
			title: 'sidenav.mid.basic.chapter.4',
			icon: faSitemap,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 2, 4)
			]
		},
		{
			key: 'chapter-sidenav-mid-basic-5',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-2/${getLocalizedConfig(lang)?.chapter}-5`,
			title: 'sidenav.mid.basic.chapter.5',
			icon: faExpandAlt,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 2, 5)
			]
		},
		{
			key: 'chapter-sidenav-mid-basic-6',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-2/${getLocalizedConfig(lang)?.chapter}-6`,
			title: 'sidenav.mid.basic.chapter.6',
			icon: faSadTear,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 2, 6)
			]
		},
		{
			key: 'chapter-sidenav-mid-basic-7',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-2/${getLocalizedConfig(lang)?.chapter}-7`,
			title: 'sidenav.mid.basic.chapter.7',
			icon: faHandsHelping,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 2, 7)
			]
		},
		{
			key: 'chapter-sidenav-mid-basic-8',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-2/${getLocalizedConfig(lang)?.chapter}-8`,
			title: 'sidenav.mid.basic.chapter.8',
			icon: faHome,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 2, 8)
			]
		},
		{
			key: 'chapter-sidenav-mid-basic-9',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-2/${getLocalizedConfig(lang)?.chapter}-9`,
			title: 'sidenav.mid.basic.chapter.9',
			icon: faGlobeAfrica,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 2, 9)
			]
		},
		{
			key: 'chapter-sidenav-mid-basic-10',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-2/${getLocalizedConfig(lang)?.chapter}-10`,
			title: 'sidenav.mid.basic.chapter.10',
			icon: faCalendarAlt,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 2, 10)
			]
		},
		{
			key: 'chapter-sidenav-mid-basic-11',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-2/${getLocalizedConfig(lang)?.chapter}-11`,
			title: 'sidenav.mid.basic.chapter.11',
			icon: faUserClock,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 2, 11)
			]
		},
		{
			key: 'chapter-sidenav-mid-basic-12',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-2/${getLocalizedConfig(lang)?.chapter}-12`,
			title: 'sidenav.mid.basic.chapter.12',
			icon: faHistory,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 2, 12)
			]
		},
		{
			key: 'chapter-sidenav-mid-basic-13',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-2/${getLocalizedConfig(lang)?.chapter}-13`,
			title: 'sidenav.mid.basic.chapter.13',
			icon: faHistory,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 2, 13)
			]
		},
		{
			key: 'chapter-sidenav-mid-basic-14',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-2/${getLocalizedConfig(lang)?.chapter}-14`,
			title: 'sidenav.mid.basic.chapter.14',
			icon: faPersonBooth,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 2, 14)
			]
		},
		{
			key: 'chapter-sidenav-mid-basic-15',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-2/${getLocalizedConfig(lang)?.chapter}-15`,
			title: 'sidenav.mid.basic.chapter.15',
			icon: faTags,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 2, 15)
			]
		},
		{
			key: 'chapter-sidenav-mid-basic-16',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-2/${getLocalizedConfig(lang)?.chapter}-16`,
			title: 'sidenav.mid.basic.chapter.16',
			icon: faMosque,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 2, 16)
			]
		},
		{
			key: 'chapter-sidenav-mid-basic-17',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-2/${getLocalizedConfig(lang)?.chapter}-17`,
			title: 'sidenav.mid.basic.chapter.17',
			icon: faBirthdayCake,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 2, 17)
			]
		},
		{
			key: 'chapter-sidenav-mid-basic-18',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-2/${getLocalizedConfig(lang)?.chapter}-18`,
			title: 'sidenav.mid.basic.chapter.18',
			icon: faSnowman,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 2, 18)
			]
		},
		{
			key: 'chapter-sidenav-mid-basic-19',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-2/${getLocalizedConfig(lang)?.chapter}-19`,
			title: 'sidenav.mid.basic.chapter.19',
			icon: faPlaneDeparture,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 2, 19)
			]
		},
		{
			key: 'chapter-sidenav-mid-basic-20',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-2/${getLocalizedConfig(lang)?.chapter}-20`,
			title: 'sidenav.mid.basic.chapter.20',
			icon: faUserMd,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 2, 20)
			]
		},
		{
			key: 'chapter-sidenav-mid-basic-21',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-2/${getLocalizedConfig(lang)?.chapter}-21`,
			title: 'sidenav.mid.basic.chapter.21',
			icon: faUserInjured,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 2, 21)
			]
		},
		{
			key: 'chapter-sidenav-mid-basic-22',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-2/${getLocalizedConfig(lang)?.chapter}-22`,
			title: 'sidenav.mid.basic.chapter.22',
			icon: faPlaceOfWorship,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 2, 22)
			]
		},
		{
			key: 'chapter-sidenav-mid-basic-23',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-2/${getLocalizedConfig(lang)?.chapter}-23`,
			title: 'sidenav.mid.basic.chapter.23',
			icon: faGlassCheers,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 2, 23)
			]
		},
		{
			key: 'chapter-sidenav-mid-basic-24',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-2/${getLocalizedConfig(lang)?.chapter}-24`,
			title: 'sidenav.mid.basic.chapter.24',
			icon: faBullseye,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 2, 24)
			]
		}
	]
}

