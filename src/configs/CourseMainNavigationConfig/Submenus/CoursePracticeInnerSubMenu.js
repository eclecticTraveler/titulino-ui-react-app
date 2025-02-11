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
	faChalkboard,
	faArrowUp,
	faFilePdf,
	faRoad,
	faChartSimple,
	faMicrophone
   } from '@fortawesome/free-solid-svg-icons';
   import SearchAssociation from "configs/CourseMainNavigationConfig/English/SearchAssociation";

const uuidv4 = () => {
	return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
	  ((c ^ crypto.getRandomValues(new Uint8Array(1))[0]) & 15) >> (c / 4)).toString(16)
  }

const getCommonUrl = (lang, levelNo, chapterNo) => {
	const commonPath = `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-${levelNo}/${getLocalizedConfig(lang)?.chapter}-${chapterNo}`;
	return commonPath;
}

export const getCoursePracticeInnerSubMenu = (lang, levelNo, chapterNo) => {
	const commonPath = getCommonUrl(lang, levelNo, chapterNo);
// spell  || flashcards -> Resources || Match || Learn --> pratica|| Test
  	return [
		{
			key: `module-class-${levelNo}-${chapterNo}-${uuidv4()}`,
			path: `${commonPath}/${getLocalizedConfig(lang)?.class}`,
			title: 'sidenav.class',
			icon: faChalkboardUser,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			isRootMenuItem: false,				
			submenu: [],
			keywords: SearchAssociation.generateSearchKeywords(lang, levelNo, chapterNo, 'class')
		},
		{
			key: `module-listening-${levelNo}-${chapterNo}-${uuidv4()}`,
			path: `${commonPath}/${getLocalizedConfig(lang)?.listening}`,
			title: 'sidenav.listening',
			icon: faEarListen,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			isRootMenuItem: false,				
			submenu: [],
			keywords: SearchAssociation.generateSearchKeywords(lang, levelNo, chapterNo, 'listening')
		},
		{
			key: `module-resources-${levelNo}-${chapterNo}-${uuidv4()}`,
			path: `${commonPath}/${getLocalizedConfig(lang)?.resources}`,
			title: 'sidenav.resources',
			icon: faBrain,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			isRootMenuItem: false,				
			submenu: [],
			keywords: SearchAssociation.generateSearchKeywords(lang, levelNo, chapterNo, 'resources')
		},
		{
			key: `module-play-${levelNo}-${chapterNo}-${uuidv4()}`,	
			path: `${commonPath}/${getLocalizedConfig(lang)?.play}`,
			title: 'sidenav.match',
			icon: faGamepad,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			isRootMenuItem: false,				
			submenu: [],
			keywords: SearchAssociation.generateSearchKeywords(lang, levelNo, chapterNo, 'match')
		},
		{
			key: `module-spell-${levelNo}-${chapterNo}-${uuidv4()}`,
			path: `${commonPath}/${getLocalizedConfig(lang)?.spell}`,
			title: 'sidenav.spell',
			icon: faKeyboard,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			isRootMenuItem: false,				
			submenu: [],
			keywords: SearchAssociation.generateSearchKeywords(lang, levelNo, chapterNo, 'match')
		},
		{
			key: `module-test-${levelNo}-${chapterNo}-${uuidv4()}`,
			path: `${commonPath}/${getLocalizedConfig(lang)?.test}`,
			title: 'sidenav.test',
			icon: faBookReader,
			iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
			breadcrumb: false,
			isRootMenuItem: false,				
			submenu: [],
			keywords: SearchAssociation.generateSearchKeywords(lang, levelNo, chapterNo, 'test')
		}
	]

}

export const getCoursePracticeInnerSubMenuV2 = (lang, levelNo, chapterNo) => {	
	const commonPath = getCommonUrl(lang, levelNo, chapterNo);
	// spell  || flashcards -> Resources || Match || Learn --> pratica|| Test
		  return [
			{
				key: `module-class-${levelNo}-${chapterNo}-${uuidv4()}`,
				path: `${commonPath}/${getLocalizedConfig(lang)?.book}`,
				title: 'sidenav.book',
				icon: faBookReader,
				iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
				breadcrumb: false,
				isRootMenuItem: false,				
				submenu: [],
				keywords: SearchAssociation.generateSearchKeywords(lang, levelNo, chapterNo, 'book')
			},
			{
				key: `module-class-${levelNo}-${chapterNo}-${uuidv4()}`,
				path: `${commonPath}/${getLocalizedConfig(lang)?.class}`,
				title: 'sidenav.class',
				icon: faChalkboard,
				iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
				breadcrumb: false,
				isRootMenuItem: false,				
				submenu: [],
				keywords: SearchAssociation.generateSearchKeywords(lang, levelNo, chapterNo, 'class')
			},
			...(levelNo === "household"
				? [			{
					key: `module-class-${levelNo}-${chapterNo}-${uuidv4()}`,
					path: `${commonPath}/${getLocalizedConfig(lang)?.speaking}`,
					title: 'sidenav.speaking',
					icon: faMicrophone,
					iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
					breadcrumb: false,
					isRootMenuItem: false,
					submenu: [],
					keywords: SearchAssociation.generateSearchKeywords(lang, levelNo, chapterNo, 'speaking')
				}]
				: []
			),
			{
				key: `module-quizlet-${levelNo}-${chapterNo}-${uuidv4()}`,
				path: `${commonPath}/${getLocalizedConfig(lang)?.quizlet}`,
				title: 'sidenav.quizlet',
				icon: faClone,
				iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
				breadcrumb: false,
				isRootMenuItem: false,				
				submenu: [],
				keywords: SearchAssociation.generateSearchKeywords(lang, levelNo, chapterNo, 'quizlet')
			},
			{
				key: `module-quizlet-pdf-${levelNo}-${chapterNo}-${uuidv4()}`,
				path: `${commonPath}/${getLocalizedConfig(lang)?.quizletpdf}`,
				title: 'sidenav.quizletpdf',
				icon: faFilePdf,
				iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
				breadcrumb: false,
				isRootMenuItem: false,				
				submenu: [],
				keywords: SearchAssociation.generateSearchKeywords(lang, levelNo, chapterNo, 'quizletpdf')
			},
			{
				key: `module-review-${levelNo}-${chapterNo}-${uuidv4()}`,
				path: `${commonPath}/${getLocalizedConfig(lang)?.quizletpdf}`,
				title: 'sidenav.review',
				icon: faFileLines,
				iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
				breadcrumb: false,
				isRootMenuItem: false,				
				submenu: [],
				keywords: SearchAssociation.generateSearchKeywords(lang, levelNo, chapterNo, 'quizletpdf')
			},
			{
				key: `module-play-${levelNo}-${chapterNo}-${uuidv4()}`,	
				path: `${commonPath}/${getLocalizedConfig(lang)?.play}`,
				title: 'sidenav.match',
				icon: faDice,
				iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
				breadcrumb: false,
				isRootMenuItem: false,				
				submenu: [],
				keywords: SearchAssociation.generateSearchKeywords(lang, levelNo, chapterNo, 'play')
			},
			{
				key: `module-spell-${levelNo}-${chapterNo}-${uuidv4()}`,
				path: `${commonPath}/${getLocalizedConfig(lang)?.spell}`,
				title: 'sidenav.spell',
				icon: faPencilAlt,
				iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
				breadcrumb: false,
				isRootMenuItem: false,				
				submenu: [],
				keywords: SearchAssociation.generateSearchKeywords(lang, levelNo, chapterNo, 'spell')
			},
			{
				key: `module-test-${levelNo}-${chapterNo}-${uuidv4()}`,
				path: `${commonPath}/${getLocalizedConfig(lang)?.test}`,
				title: 'sidenav.test',
				icon: faUserClock,
				iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
				breadcrumb: false,
				isRootMenuItem: false,				
				submenu: [],
				keywords: SearchAssociation.generateSearchKeywords(lang, levelNo, chapterNo, 'test')
			}
		]
	
}

export const getCoursePracticeInnerSubMenuV2Light = (lang, levelNo, chapterNo) => {
	const commonPath = getCommonUrl(lang, levelNo, chapterNo);

	// spell  || flashcards -> Resources || Match || Learn --> pratica|| Test
		  return [
			{
				key: `module-class-${levelNo}-${chapterNo}-${uuidv4()}`,
				path: `${commonPath}/${getLocalizedConfig(lang)?.book}`,
				title: 'sidenav.book',
				icon: faBookReader,
				iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
				breadcrumb: false,
				isRootMenuItem: false,				
				submenu: [],
				keywords: SearchAssociation.generateSearchKeywords(lang, levelNo, chapterNo, 'book')
			},
			{
				key: `module-class-${levelNo}-${chapterNo}-${uuidv4()}`,
				path: `${commonPath}/${getLocalizedConfig(lang)?.class}`,
				title: 'sidenav.class',
				icon: faChalkboard,
				iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
				breadcrumb: false,
				isRootMenuItem: false,				
				submenu: [],
				keywords: SearchAssociation.generateSearchKeywords(lang, levelNo, chapterNo, 'class')
			}
		]
	
}

export const getCoursePracticeResourcesInnerSubMenu = (lang, levelNo, chapterNo) => {
		  return [
			{
				key: `module-class-${levelNo}-${chapterNo}-${uuidv4()}`,
				path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-${levelNo}/${getLocalizedConfig(lang)?.resources}/${getLocalizedConfig(lang)?.myProgress}`,
				title: 'sidenav.findMyprogress',
				icon: faChartSimple,
				iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
				breadcrumb: false,
				isRootMenuItem: false,				
				submenu: [],
				keywords: SearchAssociation.generateSearchKeywords(lang, levelNo, chapterNo, 'myProgress')
			},
			{
				key: `module-class-${levelNo}-${chapterNo}-${uuidv4()}`,
				path: `${APP_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-${levelNo}/${getLocalizedConfig(lang)?.resources}/${getLocalizedConfig(lang)?.test}`,
				title: 'sidenav.finaltest',
				icon: faUserClock,
				iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
				breadcrumb: false,
				isRootMenuItem: false,				
				submenu: [],
				keywords: SearchAssociation.generateSearchKeywords(lang, levelNo, chapterNo, 'test')
			}
		]
	
}

