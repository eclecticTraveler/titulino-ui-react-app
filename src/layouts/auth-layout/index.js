import React from 'react'
import { Switch, Route, } from "react-router-dom";
import AuthViews from '../../views/auth-views'

export const AuthLayout = () => {
	alert("Container")
	return (
		<div className="auth-container">
			<Switch>
				<Route path="" component={AuthViews} />
			</Switch>
		</div>
	)
}


export default AuthLayout
