import React, { useState, useEffect } from 'react';
import { AUTH_PREFIX_PATH } from "../../../../configs/AppConfig";
import LoginOne from "../../../auth-views/authentication/login-1";
import { createClient } from '@supabase/supabase-js';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Route, Switch, Redirect } from "react-router-dom";


export const RedirectLogin = () => {
  useEffect(() => {
    // Add any login logic here if needed.
  }, []);

//   return <Redirect to={`${AUTH_PREFIX_PATH}/login`} />;
return (
	<><div><LoginOne allowRedirect={true} /></div></>
			//  <Auth
			// 	supabaseClient={supabasedb}
				
			// /> 
		// 	<div className="auth-container">
		// 	<Switch>
		// 		<Redirect to={`${AUTH_PREFIX_PATH}/test`} />
		// 	</Switch>
		
		// </div>
)
};

export default RedirectLogin;


// import React, {Component, useEffect} from 'react'
// import { createClient } from '@supabase/supabase-js';
// import { Auth } from '@supabase/auth-ui-react'
// import { ThemeSupa } from "@supabase/auth-ui-shared";
// import { useHistory } from "react-router-dom";


// const supabase = createClient(
//)

// const SupabaseLogin = (props) => {
// 	const history = useHistory();

// 	useEffect(() => {
// 	  // Listen to authentication state changes
// 	  const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
// 		if (event === 'SIGNED_OUT') {
// 		  alert('Signed out!');
// 		//   history.push('/success'); // Redirect to a successful logout page
// 		} else if (event === 'SIGNED_IN') {
// 		  alert('Signed in!');
// 		//   history.push('/'); // Redirect to the home page upon login
// 		}
// 	  });
// 	// Clean up the listener when the component unmounts
// 	return () => {
// 	authListener.unsubscribe();
// 	};
// }, [history]);




// 	return (
// 		<div>
// 			<header>
// 				{/* <Auth
// 				supabaseClient={supabase}
// 				appearance={{theme: ThemeSupa }}
// 				theme="dark"
// 				providers={["facebook"]}
// 				/> */}
// 				<div>HELLO WORLD</div>
// 			</header>
// 		</div>

// 	)
// }

// export default SupabaseLogin
