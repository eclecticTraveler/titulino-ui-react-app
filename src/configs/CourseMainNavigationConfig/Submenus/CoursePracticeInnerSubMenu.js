import { APP_PREFIX_PATH } from '../../AppConfig';
import { getLocalizedConfig } from './ConfigureNavigationLocalization';
import { ICON_LIBRARY_TYPE_CONFIG } from 'configs/IconConfig';
import {
	faChalkboardUser,	
	faEarListen,
	faBrain,
	faGamepad,
	faBookReader,
	faKeyboard,
	faClone,
	faFileLines,
	faDice,
	faUserClock,
	faPencilAlt,
	faChalkboard
   } from '@fortawesome/free-solid-svg-icons';

const uuidv4 = () => {
	return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
	  ((c ^ crypto.getRandomValues(new Uint8Array(1))[0]) & 15) >> (c / 4)).toString(16)
  }

export const getCoursePracticeInnerSubMenu = (lang, levelNo, chapterNo) => {
// spell  || flashcards -> Resources || Match || Learn --> pratica|| Test
  	return [
		{
			key: `module-class-${levelNo}-${chapterNo}-${uuidv4()}`,
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-${levelNo}/${getLocalizedConfig(lang)?.chapter}-${chapterNo}/${getLocalizedConfig(lang)?.class}`,
			title: 'sidenav.class',
			icon: faChalkboardUser,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			isRootMenuItem: false,				
			submenu: []
		},
		{
			key: `module-listening-${levelNo}-${chapterNo}-${uuidv4()}`,
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-${levelNo}/${getLocalizedConfig(lang)?.chapter}-${chapterNo}/${getLocalizedConfig(lang)?.listening}`,
			title: 'sidenav.listening',
			icon: faEarListen,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			isRootMenuItem: false,				
			submenu: []
		},
		{
			key: `module-resources-${levelNo}-${chapterNo}-${uuidv4()}`,
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-${levelNo}/${getLocalizedConfig(lang)?.chapter}-${chapterNo}/${getLocalizedConfig(lang)?.resources}`,
			title: 'sidenav.resources',
			icon: faBrain,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			isRootMenuItem: false,				
			submenu: []
		},
		{
			key: `module-play-${levelNo}-${chapterNo}-${uuidv4()}`,	
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-${levelNo}/${getLocalizedConfig(lang)?.chapter}-${chapterNo}/${getLocalizedConfig(lang)?.play}`,
			title: 'sidenav.match',
			icon: faGamepad,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			isRootMenuItem: false,				
			submenu: []
		},
		{
			key: `module-spell-${levelNo}-${chapterNo}-${uuidv4()}`,
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-${levelNo}/${getLocalizedConfig(lang)?.chapter}-${chapterNo}/${getLocalizedConfig(lang)?.spell}`,
			title: 'sidenav.spell',
			icon: faKeyboard,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			isRootMenuItem: false,				
			submenu: []
		},
		{
			key: `module-test-${levelNo}-${chapterNo}-${uuidv4()}`,
			path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-${levelNo}/${getLocalizedConfig(lang)?.chapter}-${chapterNo}/${getLocalizedConfig(lang)?.test}`,
			title: 'sidenav.test',
			icon: faBookReader,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			isRootMenuItem: false,				
			submenu: []
		}
	]

}

export const getCoursePracticeInnerSubMenuV2 = (lang, levelNo, chapterNo) => {
	// spell  || flashcards -> Resources || Match || Learn --> pratica|| Test
		  return [
			{
				key: `module-class-${levelNo}-${chapterNo}-${uuidv4()}`,
				path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-${levelNo}/${getLocalizedConfig(lang)?.chapter}-${chapterNo}/${getLocalizedConfig(lang)?.class}`,
				title: 'sidenav.class',
				icon: faChalkboard,
				iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
				breadcrumb: false,
				isRootMenuItem: false,				
				submenu: []
			},
			{
				key: `module-quizlet-${levelNo}-${chapterNo}-${uuidv4()}`,
				path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-${levelNo}/${getLocalizedConfig(lang)?.chapter}-${chapterNo}/${getLocalizedConfig(lang)?.quizlet}`,
				title: 'sidenav.quizlet',
				icon: faClone,
				iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
				breadcrumb: false,
				isRootMenuItem: false,				
				submenu: []
			},
			{
				key: `module-review-${levelNo}-${chapterNo}-${uuidv4()}`,
				path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-${levelNo}/${getLocalizedConfig(lang)?.chapter}-${chapterNo}/${getLocalizedConfig(lang)?.review}`,
				title: 'sidenav.review',
				icon: faFileLines,
				iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
				breadcrumb: false,
				isRootMenuItem: false,				
				submenu: []
			},
			{
				key: `module-play-${levelNo}-${chapterNo}-${uuidv4()}`,	
				path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-${levelNo}/${getLocalizedConfig(lang)?.chapter}-${chapterNo}/${getLocalizedConfig(lang)?.play}`,
				title: 'sidenav.match',
				icon: faDice,
				iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
				breadcrumb: false,
				isRootMenuItem: false,				
				submenu: []
			},
			{
				key: `module-spell-${levelNo}-${chapterNo}-${uuidv4()}`,
				path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-${levelNo}/${getLocalizedConfig(lang)?.chapter}-${chapterNo}/${getLocalizedConfig(lang)?.spell}`,
				title: 'sidenav.spell',
				icon: faPencilAlt,
				iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
				breadcrumb: false,
				isRootMenuItem: false,				
				submenu: []
			},
			{
				key: `module-test-${levelNo}-${chapterNo}-${uuidv4()}`,
				path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-${levelNo}/${getLocalizedConfig(lang)?.chapter}-${chapterNo}/${getLocalizedConfig(lang)?.test}`,
				title: 'sidenav.test',
				icon: faUserClock,
				iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
				breadcrumb: false,
				isRootMenuItem: false,				
				submenu: []
			}
		]
	
	}

