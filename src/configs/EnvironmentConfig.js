const dev = {
  KC_ENABLED_FEATURE: false,
  KC_ENDPOINT_URL: '',
  KC_REALM:'titulino',
  HOME_URL: '',
  IS_KC_FEATURE_ON: false,
  DONATION_CENTER_URL: 'http://buymeacoffee.com/titulino',
  IS_ENROLLMENT_FEAT_ON: true,
  IS_ADMIN_DASHBOARD_FEAT_ON: true,
  IS_NEW_PROGRESS_APP_ON: true,
  IS_NEW_SEARCH_CONFIG_ON: true,
  IS_SSO_ON: false,
  TITULINO_NET_API: 'https://api.titulino.com',
  ENVIROMENT: 'dev',  
};

const prod = {
  KC_ENABLED_FEATURE: false,
  KC_ENDPOINT_URL: '',
  KC_REALM:'titulino',
  HOME_URL: '',
  IS_KC_FEATURE_ON: false,
  DONATION_CENTER_URL: 'http://buymeacoffee.com/titulino',
  IS_ENROLLMENT_FEAT_ON: true,
  IS_ADMIN_DASHBOARD_FEAT_ON: false,
  IS_NEW_PROGRESS_APP_ON: true,
  IS_NEW_SEARCH_CONFIG_ON: true,
  IS_SSO_ON: false,
  TITULINO_NET_API: 'https://api.titulino.com',
  ENVIROMENT: 'prod'
};

const local = {
  KC_ENABLED_FEATURE: false,
  KC_ENDPOINT_URL: '',
  KC_REALM:'titulino',
  HOME_URL: '',
  DONATION_CENTER_URL: 'http://buymeacoffee.com/titulino',
  IS_KC_FEATURE_ON: false,
  IS_ENROLLMENT_FEAT_ON: true,
  IS_ADMIN_DASHBOARD_FEAT_ON: true,
  IS_NEW_PROGRESS_APP_ON: true,
  IS_NEW_SEARCH_CONFIG_ON: true,
  IS_SSO_ON: true,
  TITULINO_NET_API: 'https://api.titulino.com',
  ENVIROMENT: 'local'
};

const getEnv = () => {

  const environment = process.env.NODE_ENV; // Default to production
  console.log('Environment:', environment); // Check what this logs
  // const environment = "production";
  // const environment = "development";
  // const environment = "local";
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
