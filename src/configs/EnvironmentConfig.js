const commonConfig = {
  IS_NEW_PROGRESS_APP_ON: true,
  IS_NEW_SEARCH_CONFIG_ON: true,
  IS_ENROLLMENT_FEAT_ON: true,
  TITULINO_NET_API: process.env.REACT_APP_TITULINO_NET_API || '',
  DONATION_CENTER_URL: 'http://buymeacoffee.com/titulino',
};

const dev = {
  ...commonConfig,
  IS_SSO_ON: true,
  IS_SHOPPING_UX_ON: true,
  IS_SWITCH_COURSE_ON:true,
  IS_TO_DISPLAY_PROGRESS_DASHBOARD: true,
  ENVIROMENT: 'dev',  
};

const prod = {
  ...commonConfig,
  IS_SSO_ON: true,
  IS_SHOPPING_UX_ON: true,
  IS_SWITCH_COURSE_ON:false,
  IS_TO_DISPLAY_PROGRESS_DASHBOARD: true,
  ENVIROMENT: 'prod'
};

const local = {
  ...commonConfig,
  IS_SSO_ON: true,
  IS_SHOPPING_UX_ON: true,
  IS_SWITCH_COURSE_ON:false,
  IS_TO_DISPLAY_PROGRESS_DASHBOARD: true,
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
