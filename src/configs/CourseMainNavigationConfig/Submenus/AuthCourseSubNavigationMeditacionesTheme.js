import { AUTH_PREFIX_PATH } from '../../AppConfig';
import { getLocalizedConfig } from './ConfigureNavigationLocalization';
import { getAuthCourseInnerSubMenuV2, getAuthCourseInnerSubMenuV3, getAuthCourseInnerSubMenuNoClassV3 } from './AuthCourseInnerSubMenu';
import { ICON_LIBRARY_TYPE_CONFIG } from 'configs/IconConfig';
import {
	faCarrot,
	faPepperHot,
	faAppleAlt,
	faLemon,
	faBacon,
	faFish,
	faBoxArchive,
	faArchive,
	faMoneyBill,
	faBreadSlice,
	faMedal,
   } from '@fortawesome/free-solid-svg-icons';

export const AuthCourseSubNavigationMeditacionesTheme = (lang, course) => {
	const commonPath = `${AUTH_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-meditaciones/${getLocalizedConfig(lang)?.chapter}`;
	const baseMenu = [
		{
			key: 'chapter-sidenav-theme-meditaciones-1',
			path: `${commonPath}-1`,
			title: 'sidenav.chapter.1',
			icon: faCarrot,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuV3(lang, 'meditaciones', 1, course?.courseTierAccess)
			]
		},
		{
			key: 'chapter-sidenav-theme-meditaciones-2',
			path: `${commonPath}-2`,
			title: 'sidenav.chapter.2',
			icon: faPepperHot,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuV2(lang, 'meditaciones', 2, course?.courseTierAccess)
			]
		},
		{
			key: 'chapter-sidenav-theme-meditaciones-3',
			path: `${commonPath}-3`,
			title: 'sidenav.chapter.3',
			icon: faAppleAlt,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuV3(lang, 'meditaciones', 3, course?.courseTierAccess)
			]
		},
		{
			key: 'chapter-sidenav-theme-meditaciones-4',
			path: `${commonPath}-4`,
			title: 'sidenav.chapter.4',
			icon: faLemon,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuV2(lang, 'meditaciones', 4, course?.courseTierAccess)
			]
		},
		{
			key: 'chapter-sidenav-theme-meditaciones-5',
			path: `${commonPath}-5`,
			title: 'sidenav.chapter.5',
			icon: faBacon,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuV3(lang, 'meditaciones', 5, course?.courseTierAccess)
			]
		},
		{
			key: 'chapter-sidenav-theme-meditaciones-6',
			path: `${commonPath}-6`,
			title: 'sidenav.chapter.6',
			icon: faFish,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuV2(lang, 'meditaciones', 6, course?.courseTierAccess)
			]
		},
		{
			key: 'chapter-sidenav-theme-meditaciones-7',
			path: `${commonPath}-7`,
			title: 'sidenav.chapter.7',
			icon: faBoxArchive,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuV3(lang, 'meditaciones', 7, course?.courseTierAccess)
			]
		},
		{
			key: 'chapter-sidenav-theme-meditaciones-8',
			path: `${commonPath}-8`,
			title: 'sidenav.chapter.8',
			icon: faArchive,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuV2(lang, 'meditaciones', 8, course?.courseTierAccess)
			]
		},
		{
			key: 'chapter-sidenav-theme-meditaciones-9',
			path: `${commonPath}-9`,
			title: 'sidenav.chapter.9',
			icon: faMoneyBill,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuV3(lang, 'meditaciones', 9, course?.courseTierAccess)
			]
		},
		{
			key: 'chapter-sidenav-theme-meditaciones-10',
			path: `${commonPath}-10`,
			title: 'sidenav.chapter.10',
			icon: faBreadSlice,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuV2(lang, 'meditaciones', 10, course?.courseTierAccess)
			]
		},
		{
			key: 'chapter-sidenav-theme-meditaciones-11',
			path: `${commonPath}-11`,
			title: 'sidenav.chapter.11',
			icon: faMedal,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuNoClassV3(lang, 'meditaciones', 11)
			]
		}
	]

	return baseMenu;
}
