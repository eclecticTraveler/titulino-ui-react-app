import { APP_PREFIX_PATH } from '../../AppConfig';
import { getLocalizedConfig } from './ConfigureNavigationLocalization';

const uuidv4 = () => {
	return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
	  (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
	);
  }

export const getCoursePracticeInnerSubMenu = (lang, levelNo, chapterNo) => {
// spell  || flashcards -> Resources || Match || Learn --> pratica|| Test
  	return [
		{
			key: `${uuidv4()}`,					
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-${levelNo}/${getLocalizedConfig(lang)?.chapter}-${chapterNo}/${getLocalizedConfig(lang)?.class}`,
			title: 'sidenav.class',
			icon: '',
			iconAlt:'/img/sidebar/chalkboard-teacher-solid.svg',
			breadcrumb: false,
			isRootMenuItem: false,				
			submenu: []
		},
		{
			key: `${uuidv4()}`,	
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-${levelNo}/${getLocalizedConfig(lang)?.chapter}-${chapterNo}/${getLocalizedConfig(lang)?.listening}`,
			title: 'sidenav.listening',
			icon: '',
			iconAlt:'/img/sidebar/practice/ear-listen-solid.svg',
			breadcrumb: false,
			isRootMenuItem: false,				
			submenu: []
		},
		{
			key: `${uuidv4()}`,	
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-${levelNo}/${getLocalizedConfig(lang)?.chapter}-${chapterNo}/${getLocalizedConfig(lang)?.resources}`,
			title: 'sidenav.resources',
			icon: '',
			iconAlt:'/img/sidebar/practice/brain-solid.svg',
			breadcrumb: false,
			isRootMenuItem: false,				
			submenu: []
		},
		{
			key: `${uuidv4()}`,	
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-${levelNo}/${getLocalizedConfig(lang)?.chapter}-${chapterNo}/${getLocalizedConfig(lang)?.play}`,
			title: 'sidenav.match',
			icon: '',
			iconAlt:'/img/sidebar/practice/gamepad-solid.svg',
			breadcrumb: false,
			isRootMenuItem: false,				
			submenu: []
		},
		{
			key: `${uuidv4()}`,	
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-${levelNo}/${getLocalizedConfig(lang)?.chapter}-${chapterNo}/${getLocalizedConfig(lang)?.spell}`,
			title: 'sidenav.spell',
			icon: '',
			iconAlt:'/img/sidebar/practice/typewriter-solid.svg',
			breadcrumb: false,
			isRootMenuItem: false,				
			submenu: []
		},
		{
			key: `${uuidv4()}`,	
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-${levelNo}/${getLocalizedConfig(lang)?.chapter}-${chapterNo}/${getLocalizedConfig(lang)?.test}`,
			title: 'sidenav.test',
			icon: '',
			iconAlt:'/img/sidebar/practice/book-reader-solid.svg',
			breadcrumb: false,
			isRootMenuItem: false,				
			submenu: []
		}
	]

}


