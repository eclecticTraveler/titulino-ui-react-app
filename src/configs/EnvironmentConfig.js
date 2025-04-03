const commonConfig = {
  KC_REALM: 'titulino',
  KC_ENDPOINT_URL: '',
  KC_ENABLED_FEATURE: false,
  IS_KC_FEATURE_ON: false,
  IS_NEW_PROGRESS_APP_ON: true,
  IS_NEW_SEARCH_CONFIG_ON: true,
  IS_ENROLLMENT_FEAT_ON: true,
  TITULINO_NET_API: process.env.REACT_APP_TITULINO_NET_API || 'https://api.titulino.com',
  DONATION_CENTER_URL: 'http://buymeacoffee.com/titulino',
};

const dev = {
  ...commonConfig,
  IS_ADMIN_DASHBOARD_FEAT_ON: true,
  IS_SSO_ON: false,
  ENVIROMENT: 'dev',  
};

const prod = {
  IS_ADMIN_DASHBOARD_FEAT_ON: false,
  IS_SSO_ON: false,
  ENVIROMENT: 'prod'
};

const local = {
  IS_ADMIN_DASHBOARD_FEAT_ON: true,
  IS_SSO_ON: true,
  ENVIROMENT: 'local'
};

const getEnv = () => {

  const environment = process.env.REACT_APP_ENV || 'production'; 
  console.log('Environment:', environment); // Check what this logs
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
