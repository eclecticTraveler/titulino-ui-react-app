import { APP_PREFIX_PATH } from '../../AppConfig'
import { getCourseSubNavigationLowBasic } from '../Submenus/CourseSubNavigationLowBasic'
import { getCourseSubNavigationMidBasic } from '../Submenus/CourseSubNavigationMidBasic';
import { CourseSubNavigationHouseholdTheme } from '../Submenus/CourseSubNavigationHouseholdTheme';
import { CourseSubNavigationWorkNJobsTheme } from '../Submenus/CourseSubNavigationWorkNJobsTheme';
import { CourseSubNavigationSpeechesTheme } from '../Submenus/CourseSubNavigationSpeechesTheme';
import { CourseSubNavigationSupermarketTheme } from '../Submenus/CourseSubNavigationSupermarketTheme';
import { AuthCourseSubNavigationHouseholdTheme } from '../Submenus/AuthCourseSubNavigationHouseholdTheme';
import { AuthCourseSubNavigationSupermarketTheme } from '../Submenus/AuthCourseSubNavigationSupermarketTheme';
import { AuthCourseSubNavigationWorkNJobsTheme } from '../Submenus/AuthCourseSubNavigationWorknJobsTheme';
import { AuthCourseSubNavigationSpeechesTheme } from '../Submenus/AuthCourseSubNavigationSpeechesTheme';
import { getTopSubmenuForEnglishConnect } from '../Submenus/Top-Submenus/EConnectTopSubmenus';
import { COURSE_COLOR_CONFIG, COURSE_ICON_CONFIG, COURSE_TIERS_CONFIG } from 'configs/CourseThemeConfig';
import { ICON_LIBRARY_TYPE_CONFIG } from 'configs/IconConfig';

export const getEnglishCourseMainNavigationConfig = (isAuthenticated, coursesByTheme) => {
	return EnglishCourseMainNavigationConfig(isAuthenticated, coursesByTheme);
}
const EnglishCourseMainNavigationConfig  = (isAuthenticated, coursesByTheme) => [
	// ─── Hidden from top nav (routing / side-nav only) ──────────────────────────
	{
		key: 'level-1-eng-inactive',
		nameToCourseCodeKey:"english-connect-1",
		path: `${APP_PREFIX_PATH}/en/level-1`,
		title: 'main.upper.nav.level.1',
		sideTitle: 'Lower Beginner',
		icon: COURSE_ICON_CONFIG.default,
		iconType: ICON_LIBRARY_TYPE_CONFIG.hostedSvg,
		color: COURSE_COLOR_CONFIG.lowerBeginner,
		current: false,
		isRootMenuItem: true,
		iconPosition: "upperNav",
		isServiceAvailableForUser: false,
		isToDisplayInNavigation: false,
		isFree: true,
		course: "English",
		topSubmenu: [],
		submenu: [
			...getCourseSubNavigationLowBasic("en")
		]
	},
	{
		key: 'level-2-eng-inactive',
		nameToCourseCodeKey:"english-connect-2",
		path: `${APP_PREFIX_PATH}/en/level-2`,
		title: 'main.upper.nav.level.2',
		sideTitle: 'Mid Beginner',
		icon: COURSE_ICON_CONFIG.default,
		iconType: ICON_LIBRARY_TYPE_CONFIG.hostedSvg,
		color: COURSE_COLOR_CONFIG.midBeginner,
		current: false,
		isRootMenuItem: true,
		iconPosition: "upperNav",
		isServiceAvailableForUser: false,
		isToDisplayInNavigation: false,
		isFree: true,
		course: "English",
		topSubmenu: [],
		submenu: [
			...getCourseSubNavigationMidBasic("en")
		]
	},
	// Hidden: kept so side-nav renders correctly when visiting these course routes
	{
		key: 'level-work-and-jobs-part-eng',
		nameToCourseCodeKey:"work-n-jobs",
		path: `${APP_PREFIX_PATH}/en/level-work-n-jobs`,
		title: 'main.upper.nav.theme.level.workNjobs',
		sideTitle: 'Work & Jobs',
		icon: COURSE_ICON_CONFIG.default,
		iconType: ICON_LIBRARY_TYPE_CONFIG.hostedSvg,
		color: isAuthenticated && coursesByTheme['work-n-jobs']?.courseTierAccess === COURSE_TIERS_CONFIG.silver
				? COURSE_COLOR_CONFIG.silverTier
				: isAuthenticated && coursesByTheme['work-n-jobs']?.courseTierAccess === COURSE_TIERS_CONFIG.gold
				? COURSE_COLOR_CONFIG.goldTier
				: COURSE_COLOR_CONFIG.workNjobsTheme,
		current: false,
		isRootMenuItem: true,
		iconPosition: "upperNav",
		isServiceAvailableForUser: false,
		isToDisplayInNavigation: false,
		isFree: false,
		course: "English",
		topSubmenu: [],
		submenu: [
			...(isAuthenticated
				? AuthCourseSubNavigationWorkNJobsTheme("en", coursesByTheme['work-n-jobs'])
				: CourseSubNavigationWorkNJobsTheme("en")
			  )
		]
	},
	{
		key: 'level-household-part-eng',
		nameToCourseCodeKey:"household",
		path: `${APP_PREFIX_PATH}/en/level-household`,
		title: 'main.upper.nav.theme.level.household',
		sideTitle: 'Household',
		icon: COURSE_ICON_CONFIG.default,
		iconType: ICON_LIBRARY_TYPE_CONFIG.hostedSvg,
		color: COURSE_COLOR_CONFIG.householdTheme,
		current: true,
		isRootMenuItem: true,
		iconPosition: "upperNav",
		isServiceAvailableForUser: false,
		isToDisplayInNavigation: false,
		isFree: false,
		course: "English",
		topSubmenu: [],
		submenu: [
			...(isAuthenticated
				? AuthCourseSubNavigationHouseholdTheme("en")
				: CourseSubNavigationHouseholdTheme("en")
			)
		]
	},
	{
		key: 'level-supermarket-eng',
		nameToCourseCodeKey:"supermarket",
		path: `${APP_PREFIX_PATH}/en/level-supermarket`,
		title: 'main.upper.nav.theme.level.supermarket',
		sideTitle: 'Supermarket',
		icon: COURSE_ICON_CONFIG.default,
		iconType: ICON_LIBRARY_TYPE_CONFIG.hostedSvg,
		color: COURSE_COLOR_CONFIG.superMarketTheme,
		current: true,
		isRootMenuItem: true,
		iconPosition: "upperNav",
		isServiceAvailableForUser: false,
		isToDisplayInNavigation: false,
		isFree: false,
		course: "English",
		topSubmenu: [],
		submenu: [
			...(isAuthenticated
				? AuthCourseSubNavigationSupermarketTheme("en")
				: CourseSubNavigationSupermarketTheme("en")
			)
		]
	},
	// ─── Visible top-nav items (order = display order) ───────────────────────────
	{
		key: 'level-speeches-part-eng',
		nameToCourseCodeKey:"speeches",
		path: `${APP_PREFIX_PATH}/en/level-speeches`,
		title: 'main.upper.nav.theme.level.speeches',
		sideTitle: 'Speeches',
		icon: COURSE_ICON_CONFIG.default,
		iconType: ICON_LIBRARY_TYPE_CONFIG.hostedSvg,
		color: isAuthenticated && coursesByTheme['speeches']?.courseTierAccess === COURSE_TIERS_CONFIG.gold
				? COURSE_COLOR_CONFIG.goldTier
				: COURSE_COLOR_CONFIG.speechesTheme,
		current: false,
		isRootMenuItem: true,
		iconPosition: "upperNav",
		isServiceAvailableForUser: false,
		isToDisplayInNavigation: true,
		isFree: false,
		course: "English",
		topSubmenu: [],
		submenu: [
			...(isAuthenticated
				? AuthCourseSubNavigationSpeechesTheme("en", coursesByTheme['speeches'])
				: CourseSubNavigationSpeechesTheme("en")
			  )
		]
	},
	{
		key: 'level-connect-eng-general',
		path: `${APP_PREFIX_PATH}/en/level-general`,
		title: 'main.upper.nav.theme.level.ec',
		sideTitle: 'Connect',
		icon: COURSE_ICON_CONFIG.default,
		iconType: ICON_LIBRARY_TYPE_CONFIG.hostedSvg,
		color: COURSE_COLOR_CONFIG.superMarketTheme,
		current: true,
		isRootMenuItem: true,
		iconPosition: "upperNav",
		isServiceAvailableForUser: false,
		isToDisplayInNavigation: true,
		isFree: false,
		course: "English",
		topSubmenu:[
			...getTopSubmenuForEnglishConnect("en")
		],
		submenu: []
	},
	// Temporary grouping — Work & Jobs, Household, Supermarket collected under one dropdown.
	// Nav order will be updated when the full English course lineup is finalized.
	{
		key: 'level-other-courses-eng',
		title: 'main.upper.nav.theme.level.otherCourses',
		sideTitle: 'Other Courses',
		icon: COURSE_ICON_CONFIG.default,
		iconType: ICON_LIBRARY_TYPE_CONFIG.hostedSvg,
		color: COURSE_COLOR_CONFIG.defaultBlueBasic,
		isRootMenuItem: true,
		iconPosition: "upperNav",
		isServiceAvailableForUser: false,
		isToDisplayInNavigation: true,
		isFree: false,
		course: "English",
		topSubmenu: [
			{
				key: 'other-courses-eng-worknJobs',
				path: `${APP_PREFIX_PATH}/en/level-work-n-jobs`,
				title: 'main.upper.nav.theme.level.workNjobs',
				icon: COURSE_ICON_CONFIG.default,
				iconPosition: "upperNav",
				topSubmenu: []
			},
			{
				key: 'other-courses-eng-household',
				path: `${APP_PREFIX_PATH}/en/level-household`,
				title: 'main.upper.nav.theme.level.household',
				icon: COURSE_ICON_CONFIG.default,
				iconPosition: "upperNav",
				topSubmenu: []
			},
			{
				key: 'other-courses-eng-supermarket',
				path: `${APP_PREFIX_PATH}/en/level-supermarket`,
				title: 'main.upper.nav.theme.level.supermarket',
				icon: COURSE_ICON_CONFIG.default,
				iconPosition: "upperNav",
				topSubmenu: []
			}
		],
		submenu: []
	},
]
