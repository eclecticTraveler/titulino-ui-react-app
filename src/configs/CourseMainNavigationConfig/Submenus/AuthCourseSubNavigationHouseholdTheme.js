import { AUTH_PREFIX_PATH } from '../../AppConfig';
import { getLocalizedConfig } from './ConfigureNavigationLocalization';
import { getCoursePracticeResourcesInnerSubMenu, getCoursePracticeInnerSubMenuV2Light } from './CoursePracticeInnerSubMenu';
import { getAuthCourseInnerSubMenuV1 } from './AuthCourseInnerSubMenu';
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
	faHotdog,
	faBoxes,
	faTv,
   } from '@fortawesome/free-solid-svg-icons';
      

export const AuthCourseSubNavigationHouseholdTheme = (lang) => {
	const commonPath = `${AUTH_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-household/${getLocalizedConfig(lang)?.chapter}`;
	return [
		{
			key: 'chapter-sidenav-theme-household-intro',
			path: `${commonPath}-0`,
			title: 'sidenav.chapter.intro',
			icon: faTv,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenuV2Light(lang, 'household', 0)
			]
		},
		{
			key: 'chapter-sidenav-theme-household-1',
			path: `${commonPath}-1`,
			title: 'sidenav.chapter.1',
			icon: faCarrot,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuV1(lang, 'household', 1)
			]
		},
		{
			key: 'chapter-sidenav-theme-household-2',
			path: `${commonPath}-2`,
			title: 'sidenav.chapter.2',
			icon: faPepperHot,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuV1(lang, 'household', 2)
			]
		},
		{
			key: 'chapter-sidenav-theme-household-3',
			path: `${commonPath}-3`,
			title: 'sidenav.chapter.3',
			icon: faAppleAlt,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuV1(lang, 'household', 3)
			]
		},
		{
			key: 'chapter-sidenav-theme-household-4',
			path: `${commonPath}-4`,
			title: 'sidenav.chapter.4',
			icon: faLemon,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuV1(lang, 'household', 4)
			]
		},
		{
			key: 'chapter-sidenav-theme-household-5',
			path: `${commonPath}-5`,
			title: 'sidenav.chapter.5',
			icon: faBacon,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuV1(lang, 'household', 5)
			]
		},
		{
			key: 'chapter-sidenav-theme-household-6',
			path: `${commonPath}-6`,
			title: 'sidenav.chapter.6',
			icon: faFish,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuV1(lang, 'household', 6)
			]
		},
		{
			key: 'chapter-sidenav-theme-household-7',
			path: `${commonPath}-7`,
			title: 'sidenav.chapter.7',
			icon: faBoxArchive,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuV1(lang, 'household', 7)
			]
		},
		{
			key: 'chapter-sidenav-theme-household-8',
			path: `${commonPath}-8`,
			title: 'sidenav.chapter.8',
			icon: faArchive,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuV1(lang, 'household', 8)
			]
		},
		{
			key: 'chapter-sidenav-theme-household-9',
			path: `${commonPath}-9`,
			title: 'sidenav.chapter.9',
			icon: faMoneyBill,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuV1(lang, 'household', 9)
			]
		},
		{
			key: 'chapter-sidenav-theme-household-10',
			path: `${commonPath}-10`,
			title: 'sidenav.chapter.10',
			icon: faBreadSlice,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuV1(lang, 'household', 10)
			]
		},
		{
			key: 'chapter-sidenav-theme-household-11',
			path: `${commonPath}-11`,
			title: 'sidenav.chapter.11',
			icon: faHotdog,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuV1(lang, 'household', 11)
			]
		},
		{
			key: 'chapter-sidenav-theme-household-resources',
			path: `${AUTH_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-household/${getLocalizedConfig(lang)?.resources}`,
			title: 'module.resources',
			icon: faBoxes,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getCoursePracticeResourcesInnerSubMenu(lang, 'household', 'resources')
			]
		}
	]
}

