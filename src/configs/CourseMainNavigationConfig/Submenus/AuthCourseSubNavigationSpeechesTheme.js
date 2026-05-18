import { AUTH_PREFIX_PATH } from '../../AppConfig';
import { getLocalizedConfig } from './ConfigureNavigationLocalization';
import { getCoursePracticeResourcesInnerSubMenu } from './CoursePracticeInnerSubMenu';
import { getAuthCourseInnerSubMenuV2, getAuthCourseInnerSubMenuNoClass, getCoursePracticeInnerSubMenuV2Light} from './AuthCourseInnerSubMenu';
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
	faBoxes,
	faTv,
	faMedal
   } from '@fortawesome/free-solid-svg-icons';
      

export const AuthCourseSubNavigationSpeechesTheme = (lang, course) => {	

	const commonPath = `${AUTH_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-speeches/${getLocalizedConfig(lang)?.chapter}`;
	const baseMenu = [
		{
			key: 'chapter-sidenav-theme-speeches-intro',
			path: `${commonPath}-0`,
			title: 'sidenav.chapter.intro',
			icon: faTv,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenuV2Light(lang, 'speeches', 0)
			]
		},
		{
			key: 'chapter-sidenav-theme-speeches-1',
			path: `${commonPath}-1`,
			title: 'sidenav.chapter.1',
			icon: faCarrot,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuV2(lang, 'speeches', 1, course?.courseTierAccess)
			]
		},
		{
			key: 'chapter-sidenav-theme-speeches-2',
			path: `${commonPath}-2`,
			title: 'sidenav.chapter.2',
			icon: faPepperHot,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuV2(lang, 'speeches', 2, course?.courseTierAccess)
			]
		},
		{
			key: 'chapter-sidenav-theme-speeches-3',
			path: `${commonPath}-3`,
			title: 'sidenav.chapter.3',
			icon: faAppleAlt,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuV2(lang, 'speeches', 3, course?.courseTierAccess)
			]
		},
		{
			key: 'chapter-sidenav-theme-speeches-4',
			path: `${commonPath}-4`,
			title: 'sidenav.chapter.4',
			icon: faLemon,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuV2(lang, 'speeches', 4, course?.courseTierAccess)
			]
		},
		{
			key: 'chapter-sidenav-theme-speeches-5',
			path: `${commonPath}-5`,
			title: 'sidenav.chapter.5',
			icon: faBacon,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuV2(lang, 'speeches', 5, course?.courseTierAccess)
			]
		},
		{
			key: 'chapter-sidenav-theme-speeches-6',
			path: `${commonPath}-6`,
			title: 'sidenav.chapter.6',
			icon: faFish,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuV2(lang, 'speeches', 6, course?.courseTierAccess)
			]
		},
		{
			key: 'chapter-sidenav-theme-speeches-7',
			path: `${commonPath}-7`,
			title: 'sidenav.chapter.7',
			icon: faBoxArchive,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuV2(lang, 'speeches', 7, course?.courseTierAccess)
			]
		},
		{
			key: 'chapter-sidenav-theme-speeches-8',
			path: `${commonPath}-8`,
			title: 'sidenav.chapter.8',
			icon: faArchive,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuV2(lang, 'speeches', 8, course?.courseTierAccess)
			]
		},
		{
			key: 'chapter-sidenav-theme-speeches-9',
			path: `${commonPath}-9`,
			title: 'sidenav.chapter.9',
			icon: faMoneyBill,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuV2(lang, 'speeches', 9, course?.courseTierAccess)
			]
		},
		{
			key: 'chapter-sidenav-theme-speeches-10',
			path: `${commonPath}-10`,
			title: 'sidenav.chapter.10',
			icon: faBreadSlice,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuV2(lang, 'speeches', 10, course?.courseTierAccess)
			]
		},
		{
			key: 'chapter-sidenav-theme-speeches-11',
			path: `${commonPath}-11`,
			title: 'sidenav.chapter.11',
			icon: faMedal,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuNoClass(lang, 'speeches', 11)
			]
		}
	]

	  

	baseMenu.push(
		{
			key: 'chapter-sidenav-theme-speeches-resources',
			path: `${AUTH_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-speeches/${getLocalizedConfig(lang)?.resources}`,
			title: 'module.resources',
			icon: faBoxes,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getCoursePracticeResourcesInnerSubMenu(lang, 'speeches', 'resources')
			]
		}
	)

	return baseMenu;
}

