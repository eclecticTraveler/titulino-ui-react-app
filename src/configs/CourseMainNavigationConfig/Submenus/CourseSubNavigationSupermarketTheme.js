import { APP_PREFIX_PATH } from '../../AppConfig';
import { getLocalizedConfig } from './ConfigureNavigationLocalization';
import { getCoursePracticeInnerSubMenuV2 } from './CoursePracticeInnerSubMenu';
import { ICON_LIBRARY_TYPE_CONFIG } from 'configs/IconConfig';
import {
	faEye,
	faChildReaching,
	faChildren,
   } from '@fortawesome/free-solid-svg-icons';

export const CourseSubNavigationSupermarketTheme = (lang) => {			
	return [
		{
			key: 'chapter-sidenav-theme-supermarket-1',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-3/${getLocalizedConfig(lang)?.chapter}-1`,
			title: 'sidenav.chapter.1',
			icon: faChildReaching,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenuV2(lang, 'supermarket', 1)
			]
		},
		{
			key: 'chapter-sidenav-theme-supermarket-2',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-3/${getLocalizedConfig(lang)?.chapter}-2`,
			title: 'sidenav.chapter.2',
			icon: faChildren,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenuV2(lang, 'supermarket', 2)
			]
		},
		{
			key: 'chapter-sidenav-theme-supermarket-3',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-3/${getLocalizedConfig(lang)?.chapter}-3`,
			title: 'sidenav.chapter.3',
			icon: faEye,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenuV2(lang, 'supermarket', 3)
			]
		}
	]
}

