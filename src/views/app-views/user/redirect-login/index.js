import React, { useState, useEffect } from 'react';
import { AUTH_PREFIX_PATH } from "../../../../configs/AppConfig";
import LoginOne from "../../../auth-views/authentication/login-1";
import { createClient } from '@supabase/supabase-js';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Route, Switch, Redirect } from "react-router-dom";
import supabaseConfig from 'configs/SupabaseConfig';
import { SupabaseProvider } from '@supabase/auth-helpers-react';


export const RedirectLogin = () => {
	const supabase = createClient(
		"https://dollxabphvcafglmixns.supabase.co",
		"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvbGx4YWJwaHZjYWZnbG1peG5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc0OTM5MjUsImV4cCI6MjA0MzA2OTkyNX0.bXj0ZjusXoRNihiG5BcSjMOGXqy35WBwm0aqGmCohY4"
	)


//   return <Redirect to={`${AUTH_PREFIX_PATH}/login`} />;
return (
	// <><div><LoginOne allowRedirect={true} /></div></>
	// <SupabaseProvider supabaseClient={supabase}>
		<div>Test Component</div>
	// </SupabaseProvider>
		// <>jsll</>
		// 	<div className="auth-container">
		// 	<Switch>
		// 		<Redirect to={`${AUTH_PREFIX_PATH}/test`} />
		// 	</Switch>
		
		// </div>
)
};

export default RedirectLogin;
