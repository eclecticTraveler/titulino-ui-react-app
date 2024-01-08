import React, {Component, useEffect} from 'react'
import { useKeycloak } from "@react-keycloak/web";
import { Switch, Route, Redirect } from "react-router-dom";
import { DEFAULT_PREFIX_VIEW, APP_PREFIX_PATH, AUTH_PREFIX_PATH } from "../../../configs/AppConfig";

export const Login = (props) => {
		const { keycloak } = useKeycloak();
		useEffect(() => {
			if(!keycloak.authenticated){
				keycloak.login();
				//this.props.history.push('/');
			}
		})
	return (
		<div>
		<Switch>
			<Redirect to={`${APP_PREFIX_PATH}`} />
		</Switch>
		</div>
	)
}

export default Login
