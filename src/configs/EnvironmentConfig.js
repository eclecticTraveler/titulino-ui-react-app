const dev = {
  KC_ENABLED_FEATURE: true,
  KC_ENDPOINT_URL: '',
  KC_REALM:'titulino',
  HOME_URL: '',
  IS_KC_FEATURE_ON: false,
  ENVIROMENT: 'dev',  
};

const prod = {
  KC_ENABLED_FEATURE: false,
  KC_ENDPOINT_URL: '',
  KC_REALM:'titulino',
  HOME_URL: '',
  IS_KC_FEATURE_ON: false,
  ENVIROMENT: 'prod'
};

const local = {
  KC_ENABLED_FEATURE: false,
  KC_ENDPOINT_URL: '',
  KC_REALM:'titulino',
  HOME_URL: '',
  IS_KC_FEATURE_ON: false,
  ENVIROMENT: 'local'
};

const getEnv = () => {
  // process.env.NODE_ENV = "development";

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
