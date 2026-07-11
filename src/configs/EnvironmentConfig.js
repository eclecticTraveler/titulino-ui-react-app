const commonConfig = {
  IS_NEW_PROGRESS_APP_ON: true,
  IS_NEW_SEARCH_CONFIG_ON: true,
  IS_ENROLLMENT_FEAT_ON: true,
  IS_TO_FORCE_ENROLLMENT_PROFILE_PICTURE_UPLOAD: true,
  IS_TO_USE_LOCAL_LANG_COURSES_DATA: false,
  IS_TO_USE_LOCAL_COURSE_THEME_DATA: false,
  IS_TO_USE_LOCAL_BADGE_THEME_DATA: false,
  IS_TO_USE_LOCAL_KNOW_ME_SURVEY_DATA: false,
  TITULINO_NET_API: process.env.REACT_APP_TITULINO_NET_API || '',
  DONATION_CENTER_URL: 'http://buymeacoffee.com/titulino',
  RECAPTCHA_SITE_KEY: process.env.REACT_APP_RECAPTCHA_SITE_KEY || '',
  USER_PROFILE_CACHE_TTL_MINUTES: 300, // 5 hours — matches titulino-net-api's JwtTokenService.GenerateJwtTokenV2Async token lifetime
  INTERNAL_TOKEN_CACHE_TTL_MINUTES: 60,
  COURSE_DATA_CACHE_TTL_MINUTES: 60,
  IS_LANGUAGE_PICKER_ENABLED:true,
  IS_SSO_ON: true,
  IS_SHOPPING_UX_ON: true,
  IS_ENROLLMENT_LANDING_ON: false,
};

const dev = {
  ...commonConfig,
  IS_LOGIN_FOOTPRINT_INDIVIDUAL_HEATMAP_ON: true,
  IS_TO_DISPLAY_PROGRESS_DASHBOARD: true,
  IS_ENROLLMENT_LANDING_ON: true,
  ENVIROMENT: 'dev',  
};

const prod = {
  ...commonConfig,
  IS_LOGIN_FOOTPRINT_INDIVIDUAL_HEATMAP_ON: false,
  IS_TO_DISPLAY_PROGRESS_DASHBOARD: true,
  ENVIROMENT: 'prod'
};

const local = {
  ...commonConfig,
  IS_TO_DISPLAY_PROGRESS_DASHBOARD: true,
  IS_TO_USE_LOCAL_LANG_COURSES_DATA: true,
  IS_LOGIN_FOOTPRINT_INDIVIDUAL_HEATMAP_ON:false,
  IS_TO_USE_LOCAL_COURSE_THEME_DATA: true,
  IS_TO_USE_LOCAL_BADGE_THEME_DATA: true,
  IS_TO_USE_LOCAL_KNOW_ME_SURVEY_DATA: true,
  IS_ENROLLMENT_LANDING_ON: true,
  ENVIROMENT: 'local'
};

const getEnv = () => {

  const environment = process.env.REACT_APP_ENV || 'production'; 
  console.log('Server Environment:', environment, "process.env.NODE_ENV-Old", process.env.NODE_ENV);
	switch (environment) {
		case 'development':
			return dev
		case 'production':
			return prod
		case 'local':
			return local
		default:
      return prod;
	}
}

export const env = getEnv()
