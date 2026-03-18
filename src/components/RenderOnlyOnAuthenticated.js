import { RouteInterceptor } from '../helpers/index';
import { Route, Switch, Redirect, withRouter } from 'utils/routerCompat';
import { AUTH_PREFIX_PATH, APP_PREFIX_PATH } from "../configs/AppConfig";
import { useLocation } from 'utils/routerCompat';
import React, {useEffect} from 'react'

const RenderOnlyOnAuthenticated = ({ children }) => {

    // const { keycloak } = useKeycloak();
    // const location = useLocation();
    // const isLoggedIn = keycloak.authenticated;
    return null;
};

export default RenderOnlyOnAuthenticated;
