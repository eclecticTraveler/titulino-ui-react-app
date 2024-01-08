import $ from 'jquery'; 
import Keycloak from 'keycloak-js';
import { env } from '../configs/EnvironmentConfig';

const keycloak  = new Keycloak( env.ENVIROMENT === 'prod' ? '/keycloak.json' : '/keycloak-dev.json');
const isInTestingMode =  env.ENVIROMENT === 'prod' ? false : true;
keycloak[``] = "";

/**
 * Initializes Keycloak instance and calls the provided callback function if successfully authenticated. login-required ||check-sso ->   pkceMethod: 'S256',  silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html'
 *
 * @param onAuthenticatedCallback
 */
const initKeycloak = async(onAuthenticatedCallback) => { 
    keycloak.init({
      onLoad: 'login-required',
      promiseType: 'native'
    }).then(async (authenticated) => {           
     if (authenticated) {
        await processUserServices(onAuthenticatedCallback, authenticated);                       
      }
      else {
        // redirectOnError();
      }
    }).catch((err) => {
      // Redirect user to report error page or log in error
        console.log("NOT authenticated");
        console.error(err);   
        // redirectOnError();  
    });
  };

  const processUserServices = async(onAuthenticatedCallback, authenticated) => { 

    if(isInTestingMode){
      console.log(env.ENVIROMENT);
    }
    
    try {
      onAuthenticatedCallback();  
    } catch (err) {

      console.error(err);  
      if(isInTestingMode) {
        alert("UserService");
      }
    }                
  }; 


export const isUserSpecialAdmin = () => {
    if(hasRole(["administrator"]) || hasRole(["customer"]) || hasRole(["default-roles-master"])){
      return true;
  }
  return false;
}

  const doLogin = () => keycloak.login;
  
  const doLogout = () => keycloak.logout;
  
  const getToken = () => keycloak.token;
  
  const isLoggedIn = () => !!keycloak.token;
  
  const updateToken = (successCallback) =>
    keycloak.updateToken(5)
      .then(successCallback)
      .catch(doLogin);       
  
  const getUsername = () => keycloak.tokenParsed?.preferred_username;
  
  const hasRole = (roles) => roles.some((role) => keycloak.hasRealmRole(role));
    
  const UserService = {
    isUserSpecialAdmin,
    initKeycloak,
    doLogin,
    doLogout,
    isLoggedIn,
    getToken,
    updateToken,
    getUsername,
    hasRole
  };
  
  export default UserService;