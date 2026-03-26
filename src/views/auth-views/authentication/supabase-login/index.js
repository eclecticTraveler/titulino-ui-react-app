import React from 'react'
import { useHistory } from "utils/routerCompat";


const SupabaseLogin = () => {
	let history = useHistory(); // eslint-disable-line no-unused-vars
	// supabase.auth.onAuthStateChange(async (event) => {
	// 	if(event === "SIGNED_OUT"){
	// 		// forward to succesful URL
	// 		// history.push("/sucess");
	// 		alert("OUT")
	// 	}else{
	// 		// forward to localhost
	// 		// history.push("/");
	// 		alert("IN")
	// 	}
	// })




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
