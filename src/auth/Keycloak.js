import Keycloak from "keycloak-js";
import { env } from '../configs/EnvironmentConfig';

const keycloak  = new Keycloak( env.ENVIROMENT === 'prod' ? '/keycloak.json' : '/keycloak-dev.json');

export default keycloak;




