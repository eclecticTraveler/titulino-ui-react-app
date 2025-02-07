import { APP_PREFIX_PATH } from '../../AppConfig';
import { getLocalizedConfig } from './ConfigureNavigationLocalization';
import { getCoursePracticeInnerSubMenu } from './CoursePracticeInnerSubMenu';
import { ICON_LIBRARY_TYPE_CONFIG } from 'configs/IconConfig';
import {
	faEye,
	faChildReaching,
	faChildren,
   } from '@fortawesome/free-solid-svg-icons';
   
   import SearchAssociation from "configs/CourseMainNavigationConfig/English/SearchAssociation";

  
export const getCourseSubNavigationHighBasic = (lang) => {
	const commonPath = `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-3/${getLocalizedConfig(lang)?.chapter}`;	
	return [
		{
			key: 'chapter-sidenav-high-basic-1',
			path: `${commonPath}-1`,
			title: 'sidenav.chapter.1',
			icon: faChildReaching,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 3, 1)
			]
		},
		{
			key: 'chapter-sidenav-high-basic-2',
			path: `${commonPath}-2`,
			title: 'sidenav.chapter.2',
			icon: faChildren,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 3, 2)
			]
		},
		{
			key: 'chapter-sidenav-high-basic-3',
			path: `${commonPath}-3`,
			title: 'sidenav.chapter.3',
			icon: faEye,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 3, 3)
			]
		}
	]
}

