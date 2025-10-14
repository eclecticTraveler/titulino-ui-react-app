import { AUTH_PREFIX_PATH } from '../../AppConfig';
import { getLocalizedConfig } from './ConfigureNavigationLocalization';
import { ICON_LIBRARY_TYPE_CONFIG } from 'configs/IconConfig';
import {
	faBookReader,
	faClone,
	faFileLines,
	faDice,
	faUserClock,
	faPencilAlt,
	faChalkboard,
	faFilePdf,
	faChartSimple,
	faMicrophone,
	faPencilSquare,
	faPeopleRoof,
	faPersonWalkingArrowRight
   } from '@fortawesome/free-solid-svg-icons';
   import SearchAssociation from "configs/CourseMainNavigationConfig/English/SearchAssociation";

const uuidv4 = () => {
	return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
	  ((c ^ crypto.getRandomValues(new Uint8Array(1))[0]) & 15) >> (c / 4)).toString(16)
  }

const getCommonUrl = (lang, levelNo, chapterNo) => {
	const commonPath = `${AUTH_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-${levelNo}/${getLocalizedConfig(lang)?.chapter}-${chapterNo}`;
	return commonPath;
}

export const getAuthCourseInnerSubMenuV1 = (lang, levelNo, chapterNo) => {	
	const commonPath = getCommonUrl(lang, levelNo, chapterNo);
	// spell  || flashcards -> Resources || Match || Learn --> pratica|| Test
		  return [
				{
				key: `module-class-${levelNo}-${chapterNo}-${uuidv4()}`,
				path: `${commonPath}/${getLocalizedConfig(lang)?.class}`,
				title: 'sidenav.class',
				icon: faChalkboard,
				iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
				breadcrumb: false,
				isRootMenuItem: false,				
				submenu: [
					{
						key: `module-class-gg-${levelNo}-${chapterNo}-${uuidv4()}`,
						path: `${commonPath}/${getLocalizedConfig(lang)?.class}`,
						title: 'sidenav.generalGathering',
						icon: faPeopleRoof,
						iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
						breadcrumb: false,
						isRootMenuItem: false,				
						submenu: [
							
						],
						keywords: SearchAssociation.generateSearchKeywords(lang, levelNo, chapterNo, 'class', 'general gathering')
					},
					{
						key: `module-class-gc-${levelNo}-${chapterNo}-${uuidv4()}`,
						path: `${commonPath}/${getLocalizedConfig(lang)?.grammarClass}`,
						title: 'sidenav.grammarClass',
						icon: faPencilSquare,
						iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
						breadcrumb: false,
						isRootMenuItem: false,				
						submenu: [
							
						],
						keywords: SearchAssociation.generateSearchKeywords(lang, levelNo, chapterNo, 'class', 'grammar class')
					}
				],
				keywords: SearchAssociation.generateSearchKeywords(lang, levelNo, chapterNo, 'class')
			},
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
				key: `module-quizlet-${levelNo}-${chapterNo}-${uuidv4()}`,
				path: `${commonPath}/${getLocalizedConfig(lang)?.exercises}`,
				title: 'sidenav.exercises',
				icon: faClone,
				iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
				breadcrumb: false,
				isRootMenuItem: false,				
				submenu: [						
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
		
				],
				keywords: SearchAssociation.generateSearchKeywords(lang, levelNo, chapterNo, 'exercises')
			}
		]
	
}

export const getAuthCourseInnerSubMenuNoClass = (lang, levelNo, chapterNo) => {	
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
				key: `module-quizlet-${levelNo}-${chapterNo}-${uuidv4()}`,
				path: `${commonPath}/${getLocalizedConfig(lang)?.exercises}`,
				title: 'sidenav.exercises',
				icon: faClone,
				iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
				breadcrumb: false,
				isRootMenuItem: false,				
				submenu: [						
					{
						key: `module-review-${levelNo}-${chapterNo}-${uuidv4()}`,
						path: `${commonPath}/${getLocalizedConfig(lang)?.review}`,
						title: 'sidenav.review',
						icon: faFileLines,
						iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
						breadcrumb: false,
						isRootMenuItem: false,				
						submenu: [],
						keywords: SearchAssociation.generateSearchKeywords(lang, levelNo, chapterNo, 'review')
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
		
				],
				keywords: SearchAssociation.generateSearchKeywords(lang, levelNo, chapterNo, 'exercises')
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
				path: `${commonPath}/${getLocalizedConfig(lang)?.knowMe}`,
				title: 'sidenav.knowMe',
				icon: faPersonWalkingArrowRight,
				iconType: ICON_LIBRARY_TYPE_CONFIG.fontAwesome,
				breadcrumb: false,
				isRootMenuItem: false,				
				submenu: [],
				keywords: SearchAssociation.generateSearchKeywords(lang, levelNo, chapterNo, 'knowMe')
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
				path: `${AUTH_PREFIX_PATH}/${lang}/${getLocalizedConfig(lang)?.level}-${levelNo}/${getLocalizedConfig(lang)?.resources}/${getLocalizedConfig(lang)?.test}`,
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

