import { APP_PREFIX_PATH } from '../../AppConfig';
import { getLocalizedConfig } from './ConfigureNavigationLocalization';
import { getCoursePracticeInnerSubMenu } from './CoursePracticeInnerSubMenu';
// TITULINO: Submenu keys must be unique and you are repeating them in submenu many times

export const getCourseSubNavigationHighBasic = (lang) => {			
	return [
		{
			key: 'chapter-sidenav-high-basic-1',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-3/${getLocalizedConfig(lang)?.chapter}-1`,
			title: 'sidenav.chapter.1',
			icon: '',
			iconAlt:'/img/sidebar/human-solid.svg',
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 3, 1)
			]
		},
		{
			key: 'chapter-sidenav-high-basic-2',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-3/${getLocalizedConfig(lang)?.chapter}-2`,
			title: 'sidenav.chapter.2',
			icon: '',
			iconAlt:'/img/sidebar/children-solid.svg',
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 3, 2)
			]
		},
		{
			key: 'chapter-sidenav-high-basic-3',
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-3/${getLocalizedConfig(lang)?.chapter}-3`,
			title: 'sidenav.chapter.3',
			icon: '',
			iconAlt:'/img/sidebar/eye-solid.svg',
			breadcrumb: false,
			submenu: [
				...getCoursePracticeInnerSubMenu(lang, 3, 3)
			]
		}
	]
}

