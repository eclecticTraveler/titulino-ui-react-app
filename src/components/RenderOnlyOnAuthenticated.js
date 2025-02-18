import { RouteInterceptor } from '../helpers/index';
import { Route, Switch, Redirect, withRouter } from "react-router-dom";
import { AUTH_PREFIX_PATH, APP_PREFIX_PATH } from "../configs/AppConfig";
import { useLocation } from 'react-router-dom';
import React, {useEffect} from 'react'

const RenderOnlyOnAuthenticated = ({ children }) => {

    // const { keycloak } = useKeycloak();
    // const location = useLocation();
    // const isLoggedIn = keycloak.authenticated;
    return null;
};

export default RenderOnlyOnAuthenticated;