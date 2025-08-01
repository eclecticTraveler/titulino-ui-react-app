import { SIDE_NAV_LIGHT, NAV_TYPE_SIDE, DIR_LTR } from 'constants/ThemeConstant';
import { env } from 'configs/EnvironmentConfig';

export const APP_NAME = 'LRN';
export const APP_FULLNAME = 'Titulino';
export const API_BASE_URL = env.TITULINO_NET_API
export const APP_PREFIX_PATH = '/lrn';
export const AUTH_PREFIX_PATH = '/lrn-auth';
export const DEFAULT_PREFIX_VIEW = '/';
export const DEFAULT_LANDING_COURSE = 'work-n-jobs';

export const THEME_CONFIG = {
	navCollapsed: false,
	sideNavTheme: SIDE_NAV_LIGHT,
	locale: 'en',
	course: '',	
	navType: NAV_TYPE_SIDE,
	topNavColor: '#4A5C78',//'#3e82f7'
	headerNavColor: '',
	mobileNav: false,
	currentTheme: 'light',
	direction: DIR_LTR,
	subNavColor:'#3CA292'
};


