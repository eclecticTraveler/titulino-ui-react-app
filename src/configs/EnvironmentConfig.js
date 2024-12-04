const dev = {
  KC_ENABLED_FEATURE: false,
  KC_ENDPOINT_URL: '',
  KC_REALM:'titulino',
  HOME_URL: '',
  IS_KC_FEATURE_ON: false,
  DONATION_CENTER_URL: 'http://buymeacoffee.com/titulino',
  IS_ENROLLMENT_FEAT_ON: true,
  IS_NEW_PROGRESS_APP_ON: false,
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
  IS_NEW_PROGRESS_APP_ON: true,
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
  IS_NEW_PROGRESS_APP_ON: true,
  ENVIROMENT: 'local'
};

const getEnv = () => {
  // const enviroment = process.env.NODE_ENV
  // const enviroment = "production";
  // const enviroment = "development";
  const enviroment = "local";
	switch (enviroment) {
		case 'development':
			return dev
		case 'production':
			return prod
		case 'local':
			return local
		default:
			break;
	}
}

export const env = getEnv()
