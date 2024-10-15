import React from 'react'
import { createClient } from '@supabase/supabase-js';
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useHistory } from "react-router-dom";


const SupabaseLogin = () => {
	let history = useHistory();
	supabase.auth.onAuthStateChange(async (event) => {
		if(event === "SIGNED_OUT"){
			// forward to succesful URL
			// history.push("/sucess");
			alert("OUT")
		}else{
			// forward to localhost
			// history.push("/");
			alert("IN")
		}
	})




	return (
		<div>
			<header>
				{/* <Auth
				supabaseClient={supabase}
				appearance={{theme: ThemeSupa }}
				theme="dark"
				providers={["facebook", "google"]}
				/> */}
				<div>Hello World</div>
			</header>
		</div>

	)
}

export default SupabaseLogin
