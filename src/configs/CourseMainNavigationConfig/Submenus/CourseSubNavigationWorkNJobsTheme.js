import { APP_PREFIX_PATH } from '../../AppConfig';
import { getLocalizedConfig } from './ConfigureNavigationLocalization';
import { getCoursePracticeInnerSubMenuV2, getCoursePracticeResourcesInnerSubMenu, getCoursePracticeInnerSubMenuV2Light } from './CoursePracticeInnerSubMenu';
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
   
   import SearchAssociation from "configs/CourseMainNavigationConfig/English/SearchAssociation";

export const CourseSubNavigationWorkNJobsTheme = (lang) => {
	const commonPath = `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-work-n-jobs/${getLocalizedConfig(lang)?.chapter}`;
	return [
		{
			key: 'chapter-sidenav-theme-work-n-jobs-1',
			path: `${commonPath}-1`,
			title: 'sidenav.chapter.1',
			icon: faCarrot,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenuV2(lang, 'work-n-jobs', 1)
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
				...getCoursePracticeInnerSubMenuV2(lang, 'work-n-jobs', 2)
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
				...getCoursePracticeInnerSubMenuV2(lang, 'work-n-jobs', 3)
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
				...getCoursePracticeInnerSubMenuV2(lang, 'work-n-jobs', 4)
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
				...getCoursePracticeInnerSubMenuV2(lang, 'work-n-jobs', 5)
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
				...getCoursePracticeInnerSubMenuV2(lang, 'work-n-jobs', 6)
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
				...getCoursePracticeInnerSubMenuV2(lang, 'work-n-jobs', 7)
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
				...getCoursePracticeInnerSubMenuV2(lang, 'work-n-jobs', 8)
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
				...getCoursePracticeInnerSubMenuV2(lang, 'work-n-jobs', 9)
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
				...getCoursePracticeInnerSubMenuV2(lang, 'work-n-jobs', 10)
			]
		},
		{
			key: 'chapter-sidenav-theme-work-n-jobs-11',
			path: `${commonPath}-11`,
			title: 'sidenav.chapter.11',
			icon: faHotdog,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenuV2(lang, 'work-n-jobs', 11)
			]
		}
	]
}

