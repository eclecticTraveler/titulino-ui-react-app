import { APP_PREFIX_PATH } from '../../AppConfig';
import { getLocalizedConfig } from './ConfigureNavigationLocalization';
import { getCoursePracticeInnerSubMenuV2 } from './CoursePracticeInnerSubMenu';
import { ICON_LIBRARY_TYPE_CONFIG } from 'configs/IconConfig';
import {
	faCarrot,
	faPepperHot,
	faAppleAlt,
	faLemon,
	faBookReader,
	faBacon,
	faFish,
	faBoxArchive,
	faArchive,
	faMoneyBill,
	faBreadSlice,
	faHotdog
   } from '@fortawesome/free-solid-svg-icons';

export const CourseSubNavigationSupermarketTheme = (lang) => {			
	return [
		{
			key: 'chapter-sidenav-theme-supermarket-1',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-supermarket/${getLocalizedConfig(lang)?.chapter}-1`,
			title: 'sidenav.chapter.1',
			icon: faCarrot,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenuV2(lang, 'supermarket', 1)
			]
		},
		{
			key: 'chapter-sidenav-theme-supermarket-2',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-supermarket/${getLocalizedConfig(lang)?.chapter}-2`,
			title: 'sidenav.chapter.2',
			icon: faPepperHot,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenuV2(lang, 'supermarket', 2)
			]
		},
		{
			key: 'chapter-sidenav-theme-supermarket-3',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-supermarket/${getLocalizedConfig(lang)?.chapter}-3`,
			title: 'sidenav.chapter.3',
			icon: faAppleAlt,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenuV2(lang, 'supermarket', 3)
			]
		},
		{
			key: 'chapter-sidenav-theme-supermarket-4',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-supermarket/${getLocalizedConfig(lang)?.chapter}-5`,
			title: 'sidenav.chapter.5',
			icon: faLemon,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenuV2(lang, 'supermarket', 4)
			]
		},
		{
			key: 'chapter-sidenav-theme-supermarket-5',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-supermarket/${getLocalizedConfig(lang)?.chapter}-5`,
			title: 'sidenav.chapter.5',
			icon: faBacon,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenuV2(lang, 'supermarket', 5)
			]
		},
		{
			key: 'chapter-sidenav-theme-supermarket-6',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-supermarket/${getLocalizedConfig(lang)?.chapter}-6`,
			title: 'sidenav.chapter.6',
			icon: faFish,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenuV2(lang, 'supermarket', 6)
			]
		},
		{
			key: 'chapter-sidenav-theme-supermarket-7',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-supermarket/${getLocalizedConfig(lang)?.chapter}-7`,
			title: 'sidenav.chapter.7',
			icon: faBoxArchive,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenuV2(lang, 'supermarket', 7)
			]
		},
		{
			key: 'chapter-sidenav-theme-supermarket-8',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-supermarket/${getLocalizedConfig(lang)?.chapter}-8`,
			title: 'sidenav.chapter.8',
			icon: faArchive,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenuV2(lang, 'supermarket', 8)
			]
		},
		{
			key: 'chapter-sidenav-theme-supermarket-9',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-supermarket/${getLocalizedConfig(lang)?.chapter}-9`,
			title: 'sidenav.chapter.9',
			icon: faMoneyBill,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenuV2(lang, 'supermarket', 9)
			]
		},
		{
			key: 'chapter-sidenav-theme-supermarket-10',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-supermarket/${getLocalizedConfig(lang)?.chapter}-10`,
			title: 'sidenav.chapter.10',
			icon: faBreadSlice,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenuV2(lang, 'supermarket', 10)
			]
		},
		{
			key: 'chapter-sidenav-theme-supermarket-11',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-supermarket/${getLocalizedConfig(lang)?.chapter}-11`,
			title: 'sidenav.chapter.11',
			icon: faHotdog,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenuV2(lang, 'supermarket', 11)
			]
		}
	]
}
