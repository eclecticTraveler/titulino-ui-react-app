import { AUTH_PREFIX_PATH } from '../../AppConfig';
import { getLocalizedConfig } from './ConfigureNavigationLocalization';
import { getCoursePracticeResourcesInnerSubMenu, getCoursePracticeInnerSubMenuV2Light } from './CoursePracticeInnerSubMenu';
import { getAuthCourseInnerSubMenuV1, getAuthCourseInnerSubMenuNoClass } from './AuthCourseInnerSubMenu';
import { ICON_LIBRARY_TYPE_CONFIG } from 'configs/IconConfig';
import { COURSE_TIERS_CONFIG } from 'configs/CourseThemeConfig';
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
	faMedal
   } from '@fortawesome/free-solid-svg-icons';
      

export const AuthCourseSubNavigationWorkNJobsTheme = (lang, course) => {
	const isSilver = course?.courseTierAccess === COURSE_TIERS_CONFIG.silver;
	const isGold = course?.courseTierAccess === COURSE_TIERS_CONFIG.gold;

	const commonPath = `${AUTH_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-work-n-jobs/${getLocalizedConfig(lang)?.chapter}`;
	const baseMenu = [
		{
			key: 'chapter-sidenav-theme-work-n-jobs-intro',
			path: `${commonPath}-0`,
			title: 'sidenav.chapter.intro',
			icon: faTv,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenuV2Light(lang, 'work-n-jobs', 0)
			]
		},
		{
			key: 'chapter-sidenav-theme-work-n-jobs-1',
			path: `${commonPath}-1`,
			title: 'sidenav.chapter.1',
			icon: faCarrot,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuV1(lang, 'work-n-jobs', 1)
			]
		},
		{
			key: 'chapter-sidenav-theme-work-n-jobs-2',
			path: `${commonPath}-2`,
			title: 'sidenav.chapter.2',
			icon: faPepperHot,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuV1(lang, 'work-n-jobs', 2)
			]
		},
		{
			key: 'chapter-sidenav-theme-work-n-jobs-3',
			path: `${commonPath}-3`,
			title: 'sidenav.chapter.3',
			icon: faAppleAlt,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuV1(lang, 'work-n-jobs', 3)
			]
		},
		{
			key: 'chapter-sidenav-theme-work-n-jobs-4',
			path: `${commonPath}-4`,
			title: 'sidenav.chapter.4',
			icon: faLemon,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuV1(lang, 'work-n-jobs', 4)
			]
		},
		{
			key: 'chapter-sidenav-theme-work-n-jobs-5',
			path: `${commonPath}-5`,
			title: 'sidenav.chapter.5',
			icon: faBacon,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuV1(lang, 'work-n-jobs', 5)
			]
		},
		{
			key: 'chapter-sidenav-theme-work-n-jobs-6',
			path: `${commonPath}-6`,
			title: 'sidenav.chapter.6',
			icon: faFish,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuV1(lang, 'work-n-jobs', 6)
			]
		},
		{
			key: 'chapter-sidenav-theme-work-n-jobs-7',
			path: `${commonPath}-7`,
			title: 'sidenav.chapter.7',
			icon: faBoxArchive,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuV1(lang, 'work-n-jobs', 7)
			]
		},
		{
			key: 'chapter-sidenav-theme-work-n-jobs-8',
			path: `${commonPath}-8`,
			title: 'sidenav.chapter.8',
			icon: faArchive,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuV1(lang, 'work-n-jobs', 8)
			]
		},
		{
			key: 'chapter-sidenav-theme-work-n-jobs-9',
			path: `${commonPath}-9`,
			title: 'sidenav.chapter.9',
			icon: faMoneyBill,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuV1(lang, 'work-n-jobs', 9)
			]
		},
		{
			key: 'chapter-sidenav-theme-work-n-jobs-10',
			path: `${commonPath}-10`,
			title: 'sidenav.chapter.10',
			icon: faBreadSlice,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuV1(lang, 'work-n-jobs', 10)
			]
		},
		{
			key: 'chapter-sidenav-theme-work-n-jobs-11',
			path: `${commonPath}-11`,
			title: 'sidenav.chapter.11',
			icon: faMedal,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuV1(lang, 'work-n-jobs', 11)
			]
		}
	]

	const silverMenu = [
		{
			key: 'chapter-sidenav-theme-work-n-jobs-12',
			path: `${commonPath}-12`,
			title: 'sidenav.chapter.12',
			icon: faMedal,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuNoClass(lang, 'work-n-jobs', 12)
			]
		},
		{
			key: 'chapter-sidenav-theme-work-n-jobs-13',
			path: `${commonPath}-13`,
			title: 'sidenav.chapter.13',
			icon: faMedal,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuNoClass(lang, 'work-n-jobs', 13)
			]
		},
		{
			key: 'chapter-sidenav-theme-work-n-jobs-14',
			path: `${commonPath}-14`,
			title: 'sidenav.chapter.14',
			icon: faMedal,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuNoClass(lang, 'work-n-jobs', 14)
			]
		},
		{
			key: 'chapter-sidenav-theme-work-n-jobs-15',
			path: `${commonPath}-15`,
			title: 'sidenav.chapter.15',
			icon: faMedal,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuNoClass(lang, 'work-n-jobs', 15)
			]
		}
	]

	const goldMenu = [
		{
			key: 'chapter-sidenav-theme-work-n-jobs-16',
			path: `${commonPath}-16`,
			title: 'sidenav.chapter.16',
			icon: faMedal,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuNoClass(lang, 'work-n-jobs', 16)
			]
		},
		{
			key: 'chapter-sidenav-theme-work-n-jobs-17',
			path: `${commonPath}-17`,
			title: 'sidenav.chapter.17',
			icon: faMedal,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuNoClass(lang, 'work-n-jobs', 17)
			]
		},
		{
			key: 'chapter-sidenav-theme-work-n-jobs-18',
			path: `${commonPath}-18`,
			title: 'sidenav.chapter.18',
			icon: faMedal,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuNoClass(lang, 'work-n-jobs', 18)
			]
		},
		{
			key: 'chapter-sidenav-theme-work-n-jobs-19',
			path: `${commonPath}-19`,
			title: 'sidenav.chapter.19',
			icon: faMedal,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getAuthCourseInnerSubMenuNoClass(lang, 'work-n-jobs', 19)
			]
		}
	]

	if (isSilver || isGold) {
		baseMenu.push(...silverMenu);
    }
	  
  	if (isGold) {
		baseMenu.push(...goldMenu);
    }
	  

	baseMenu.push(
		{
			key: 'chapter-sidenav-theme-work-n-jobs-resources',
			path: `${AUTH_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-work-n-jobs/${getLocalizedConfig(lang)?.resources}`,
			title: 'module.resources',
			icon: faBoxes,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getCoursePracticeResourcesInnerSubMenu(lang, 'work-n-jobs', 'resources')
			]
		}
	)

	return baseMenu;
}

